package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.config

import io.netty.handler.timeout.ReadTimeoutHandler
import io.netty.handler.timeout.WriteTimeoutHandler
import mu.KLogging
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.boot.context.properties.ConstructorBinding
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.boot.web.client.RestTemplateBuilder
import org.springframework.boot.web.client.RestTemplateCustomizer
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.client.reactive.ReactorClientHttpConnector
import org.springframework.http.converter.FormHttpMessageConverter
import org.springframework.retry.RetryCallback
import org.springframework.retry.RetryContext
import org.springframework.retry.backoff.FixedBackOffPolicy
import org.springframework.retry.listener.RetryListenerSupport
import org.springframework.retry.policy.SimpleRetryPolicy
import org.springframework.retry.support.RetryTemplate
import org.springframework.security.oauth2.client.AuthorizedClientServiceOAuth2AuthorizedClientManager
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientManager
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientProviderBuilder
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService
import org.springframework.security.oauth2.client.endpoint.DefaultClientCredentialsTokenResponseClient
import org.springframework.security.oauth2.client.http.OAuth2ErrorResponseErrorHandler
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository
import org.springframework.security.oauth2.client.web.reactive.function.client.ServletOAuth2AuthorizedClientExchangeFilterFunction
import org.springframework.security.oauth2.core.http.converter.OAuth2AccessTokenResponseHttpMessageConverter
import org.springframework.web.reactive.function.client.WebClient
import reactor.netty.http.client.HttpClient
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.RestClient
import java.time.Duration

@ConstructorBinding
@ConfigurationProperties(prefix = "spring.security.oauth2.client.provider.hmppsauth.token-request")
data class TokenRequestConfig(
  val connectTimeoutMs: Long,
  val readTimeoutMs: Long,
  val retries: Int,
  val retryDelayMs: Long,
)

@Configuration
@EnableConfigurationProperties(TokenRequestConfig::class)
class WebClientConfiguration(
  @Value("\${webclient.connect-timeout-seconds}") private val defaultConnectTimeoutSeconds: Long,
  @Value("\${webclient.read-timeout-seconds}") private val defaultReadTimeoutSeconds: Int,
  @Value("\${webclient.hmpps-auth.read-timeout-seconds}") private val hmppsReadTimeoutSeconds: Int,
  @Value("\${webclient.hmpps-auth.connect-timeout-seconds}") private val hmppsAuthConnectTimeoutSeconds: Long,
  @Value("\${webclient.write-timeout-seconds}") private val writeTimeoutSeconds: Int,
  @Value("\${community-api.baseurl}") private val communityApiBaseUrl: String,
  @Value("\${hmppsauth.baseurl}") private val hmppsAuthBaseUrl: String,
  @Value("\${assess-risks-and-needs.baseurl}") private val assessRisksAndNeedsBaseUrl: String,
  private val tokenRequestConfig: TokenRequestConfig,
  private val webClientBuilder: WebClient.Builder,
  private val restTemplateBuilder: RestTemplateBuilder,
) {
  private val interventionsClientRegistrationId = "interventions-client"

  @Bean
  fun assessRisksAndNeedsClient(authorizedClientManager: OAuth2AuthorizedClientManager): RestClient {
    return RestClient(
      createAuthorizedWebClient(authorizedClientManager, assessRisksAndNeedsBaseUrl),
      interventionsClientRegistrationId
    )
  }

  @Bean
  fun hmppsAuthApiClient(authorizedClientManager: OAuth2AuthorizedClientManager): RestClient {
    return RestClient(
      createAuthorizedWebClient(authorizedClientManager, hmppsAuthBaseUrl, hmppsReadTimeoutSeconds, hmppsAuthConnectTimeoutSeconds),
      interventionsClientRegistrationId
    )
  }

  @Bean
  fun communityApiClient(authorizedClientManager: OAuth2AuthorizedClientManager): RestClient {
    return RestClient(
      createAuthorizedWebClient(authorizedClientManager, communityApiBaseUrl),
      interventionsClientRegistrationId
    )
  }

  @Bean
  fun authorizedClientManager(
    clientRegistrationRepository: ClientRegistrationRepository?,
    clientService: OAuth2AuthorizedClientService?
  ): OAuth2AuthorizedClientManager? {
    val authorizedClientProvider = OAuth2AuthorizedClientProviderBuilder.builder()
      .clientCredentials {
        it.accessTokenResponseClient(createRetryingTokenResponseClient())
      }
      .build()

    val authorizedClientManager = AuthorizedClientServiceOAuth2AuthorizedClientManager(
      clientRegistrationRepository,
      clientService
    )
    authorizedClientManager.setAuthorizedClientProvider(authorizedClientProvider)

    return authorizedClientManager
  }

  private fun createRetryingTokenResponseClient(): DefaultClientCredentialsTokenResponseClient {
    val clientCredentialsTokenResponseClient = DefaultClientCredentialsTokenResponseClient()
    val errorHandler = OAuth2ErrorResponseErrorHandler()

    val retryCustomizer = RestTemplateCustomizer { restTemplate ->
      restTemplate.interceptors.add { request, body, execution ->

        val retryTemplate = RetryTemplate()
        val fixedBackOffPolicy = FixedBackOffPolicy()
        fixedBackOffPolicy.backOffPeriod = tokenRequestConfig.retryDelayMs
        retryTemplate.setBackOffPolicy(fixedBackOffPolicy)
        retryTemplate.setRetryPolicy(SimpleRetryPolicy(tokenRequestConfig.retries))
        retryTemplate.setListeners(arrayOf(RetryLogger("token request failed; retrying")))

        retryTemplate.execute(
          RetryCallback {
            execution.execute(request, body).also {
              // i hate that this basically duplicates `RestTemplate.handleResponse`,
              // but it's the only way i could figure out to get this to work.
              if (errorHandler.hasError(it)) {
                errorHandler.handleError(it)
              }
            }
          }
        )
      }
    }

    val restTemplate = restTemplateBuilder
      .setConnectTimeout(Duration.ofMillis(tokenRequestConfig.connectTimeoutMs))
      .setReadTimeout(Duration.ofMillis(tokenRequestConfig.readTimeoutMs))
      .customizers(retryCustomizer)
      .messageConverters(
        FormHttpMessageConverter(),
        OAuth2AccessTokenResponseHttpMessageConverter(),
      )
      .errorHandler(errorHandler)
      .build()

    clientCredentialsTokenResponseClient.setRestOperations(restTemplate)
    return clientCredentialsTokenResponseClient
  }

  private fun createAuthorizedWebClient(
    clientManager: OAuth2AuthorizedClientManager,
    baseUrl: String,
    readTimeoutSeconds: Int = defaultReadTimeoutSeconds,
    connectTimeoutSeconds: Long = defaultConnectTimeoutSeconds,
  ): WebClient {
    val oauth2Client = ServletOAuth2AuthorizedClientExchangeFilterFunction(clientManager)

    val httpClient = HttpClient.create()
      .doOnConnected {
        it
          .addHandlerLast(ReadTimeoutHandler(readTimeoutSeconds))
          .addHandlerLast(WriteTimeoutHandler(writeTimeoutSeconds))
      }
      .responseTimeout(Duration.ofSeconds(connectTimeoutSeconds))

    return webClientBuilder
      .clientConnector(ReactorClientHttpConnector(httpClient))
      .baseUrl(baseUrl)
      .apply(oauth2Client.oauth2Configuration())
      .build()
  }
}

class RetryLogger(private val msg: String) : RetryListenerSupport() {
  companion object : KLogging()

  override fun <T : Any?, E : Throwable?> onError(context: RetryContext?, callback: RetryCallback<T, E>?, throwable: Throwable?) {
    logger.info(msg, throwable)
  }
}
