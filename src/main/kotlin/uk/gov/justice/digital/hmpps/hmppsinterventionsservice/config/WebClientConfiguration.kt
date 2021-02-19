package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.config

import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.oauth2.client.AuthorizedClientServiceOAuth2AuthorizedClientManager
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientManager
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientProviderBuilder
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository
import org.springframework.security.oauth2.client.web.reactive.function.client.ServletOAuth2AuthorizedClientExchangeFilterFunction
import org.springframework.web.reactive.function.client.ExchangeStrategies
import org.springframework.web.reactive.function.client.WebClient

@Configuration
class WebClientConfiguration(
  @Value("\${community-api.baseurl}") private val communityApiBaseUrl: String,
  @Value("\${hmppsauth.baseurl}") private val hmppsAuthBaseUrl: String,
  private val webClientBuilder: WebClient.Builder
) {
  @Bean
  fun communityApiWebClient(authorizedClientManager: OAuth2AuthorizedClientManager): WebClient {
    return createAuthorizedWebClient(authorizedClientManager, communityApiBaseUrl)
  }

  @Bean
  fun hmppsAuthApiWebClient(authorizedClientManager: OAuth2AuthorizedClientManager): WebClient {
    return createAuthorizedWebClient(authorizedClientManager, hmppsAuthBaseUrl)
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

  private fun createAuthorizedWebClient(clientManager: OAuth2AuthorizedClientManager, baseUrl: String): WebClient {
    val oauth2Client = ServletOAuth2AuthorizedClientExchangeFilterFunction(clientManager)
    oauth2Client.setDefaultClientRegistrationId("interventions-client")
    return webClientBuilder
      .baseUrl(baseUrl)
      .apply(oauth2Client.oauth2Configuration())
      .exchangeStrategies(
        ExchangeStrategies.builder()
          .codecs { configurer ->
            configurer.defaultCodecs()
              .maxInMemorySize(-1)
          }
          .build()
      )
      .build()
  }
}
