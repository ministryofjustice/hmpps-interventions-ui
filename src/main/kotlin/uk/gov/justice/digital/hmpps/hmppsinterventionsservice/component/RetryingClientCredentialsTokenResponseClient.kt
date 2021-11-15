package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component

import mu.KLogging
import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.boot.context.properties.ConstructorBinding
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.boot.web.client.RestTemplateBuilder
import org.springframework.boot.web.client.RestTemplateCustomizer
import org.springframework.http.converter.FormHttpMessageConverter
import org.springframework.retry.RetryCallback
import org.springframework.retry.RetryContext
import org.springframework.retry.backoff.FixedBackOffPolicy
import org.springframework.retry.listener.RetryListenerSupport
import org.springframework.retry.policy.SimpleRetryPolicy
import org.springframework.retry.support.RetryTemplate
import org.springframework.security.oauth2.client.endpoint.DefaultClientCredentialsTokenResponseClient
import org.springframework.security.oauth2.client.endpoint.OAuth2AccessTokenResponseClient
import org.springframework.security.oauth2.client.endpoint.OAuth2ClientCredentialsGrantRequest
import org.springframework.security.oauth2.client.http.OAuth2ErrorResponseErrorHandler
import org.springframework.security.oauth2.core.endpoint.OAuth2AccessTokenResponse
import org.springframework.security.oauth2.core.http.converter.OAuth2AccessTokenResponseHttpMessageConverter
import org.springframework.stereotype.Component
import java.time.Duration

@ConstructorBinding
@ConfigurationProperties(prefix = "spring.security.oauth2.client.provider.hmppsauth.token-request")
data class TokenRequestConfig(
  val connectTimeoutMs: Long,
  val readTimeoutMs: Long,
  val retries: Int,
  val retryDelayMs: Long,
)

@Component
@EnableConfigurationProperties(TokenRequestConfig::class)
class RetryingClientCredentialsTokenResponseClient(
  private val config: TokenRequestConfig,
  private val restTemplateBuilder: RestTemplateBuilder,
) : OAuth2AccessTokenResponseClient<OAuth2ClientCredentialsGrantRequest> {
  companion object : KLogging()

  override fun getTokenResponse(authorizationGrantRequest: OAuth2ClientCredentialsGrantRequest?): OAuth2AccessTokenResponse =
    customizedClient.getTokenResponse(authorizationGrantRequest)

  private val errorHandler = OAuth2ErrorResponseErrorHandler()

  private val retryLogger = object : RetryListenerSupport() {
    override fun <T : Any?, E : Throwable?> onError(context: RetryContext?, callback: RetryCallback<T, E>?, throwable: Throwable?) {
      logger.info("token request failed; retrying", throwable)
    }
  }

  private val retryTemplate = RetryTemplate().apply {
    setBackOffPolicy(
      FixedBackOffPolicy().apply {
        backOffPeriod = config.retryDelayMs
      }
    )
    setRetryPolicy(SimpleRetryPolicy(config.retries))
    setListeners(arrayOf(retryLogger))
  }

  private val retryCustomizer = RestTemplateCustomizer { restTemplate ->
    restTemplate.interceptors.add { request, body, execution ->
      retryTemplate.execute(
        RetryCallback {
          execution.execute(request, body).also { response ->
            // i hate that this basically duplicates `RestTemplate.handleResponse`,
            // but it's the only way i could figure out to get this to work.
            if (errorHandler.hasError(response)) {
              errorHandler.handleError(response)
            }
          }
        }
      )
    }
  }

  private val customizedClient = DefaultClientCredentialsTokenResponseClient().apply {
    // see https://docs.spring.io/spring-security/site/docs/current/reference/html5/#customizing-the-access-token-response-3
    // for information on how to configure the defaults in this RestTemplate.
    setRestOperations(
      restTemplateBuilder
        .setConnectTimeout(Duration.ofMillis(config.connectTimeoutMs))
        .setReadTimeout(Duration.ofMillis(config.readTimeoutMs))
        .customizers(retryCustomizer)
        .messageConverters(
          FormHttpMessageConverter(),
          OAuth2AccessTokenResponseHttpMessageConverter(),
        )
        .errorHandler(errorHandler)
        .build()
    )
  }
}
