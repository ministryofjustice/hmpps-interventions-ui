package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.config

import io.netty.handler.timeout.ReadTimeoutHandler
import io.netty.handler.timeout.WriteTimeoutHandler
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.client.reactive.ReactorClientHttpConnector
import org.springframework.security.oauth2.client.AuthorizedClientServiceOAuth2AuthorizedClientManager
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientManager
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientProviderBuilder
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository
import org.springframework.security.oauth2.client.web.reactive.function.client.ServletOAuth2AuthorizedClientExchangeFilterFunction
import org.springframework.web.reactive.function.client.WebClient
import reactor.netty.http.client.HttpClient
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.RestClient
import java.time.Duration

@Configuration
class WebClientConfiguration(
  @Value("\${webclient.connect-timeout-seconds}") private val defaultConnectTimeoutSeconds: Long,
  @Value("\${webclient.read-timeout-seconds}") private val defaultReadTimeoutSeconds: Int,
  @Value("\${webclient.hmpps-auth.read-timeout-seconds}") private val hmppsReadTimeoutSeconds: Int,
  @Value("\${webclient.hmpps-auth.connect-timeout-seconds}") private val hmppsAuthConnectTimeoutSeconds: Long,
  @Value("\${webclient.write-timeout-seconds}") private val writeTimeoutSeconds: Int,
  @Value("\${community-api.baseurl}") private val communityApiBaseUrl: String,
  @Value("\${hmppsauth.baseurl}") private val hmppsAuthBaseUrl: String,
  @Value("\${assess-risks-and-needs.baseurl}") private val assessRisksAndNeedsBaseUrl: String,
  private val webClientBuilder: WebClient.Builder
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
      .clientCredentials()
      .build()
    val authorizedClientManager = AuthorizedClientServiceOAuth2AuthorizedClientManager(
      clientRegistrationRepository,
      clientService
    )
    authorizedClientManager.setAuthorizedClientProvider(authorizedClientProvider)
    return authorizedClientManager
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
