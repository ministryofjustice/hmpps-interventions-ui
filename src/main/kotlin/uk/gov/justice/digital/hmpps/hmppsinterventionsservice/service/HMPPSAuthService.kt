package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.reactive.function.client.WebClient
import org.springframework.web.util.UriComponentsBuilder
import reactor.core.publisher.Mono
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthGroupID
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser

class UnverifiedEmailException : RuntimeException()

data class UserDetail(
  val firstName: String,
  val email: String,
)

private const val AuthServiceProviderGroupPrefix = "INT_SP_"

private data class AuthGroupResponse(
  val groupCode: String,
  val groupName: String,
)

private data class AuthUserDetailResponse(
  val firstName: String,
  val email: String,
  val verified: Boolean,
)

private data class UserEmailResponse(
  val email: String,
)

private data class UserDetailResponse(
  val name: String,
)

@Service
class HMPPSAuthService(
  @Value("\${hmppsauth.api.locations.auth-user-groups}") private val authUserGroupsLocation: String,
  @Value("\${hmppsauth.api.locations.auth-user-detail}") private val authUserDetailLocation: String,
  @Value("\${hmppsauth.api.locations.user-email}") private val userEmailLocation: String,
  @Value("\${hmppsauth.api.locations.user-detail}") private val userDetailLocation: String,
  private val hmppsAuthApiWebClient: WebClient,
) {
  fun getServiceProviderOrganizationForUser(user: AuthUser): AuthGroupID? {
    if (user.authSource != "auth") {
      return null
    }

    val url = UriComponentsBuilder.fromPath(authUserGroupsLocation)
      .buildAndExpand(user.userName)
      .toString()

    val groups = hmppsAuthApiWebClient.get().uri(url)
      .retrieve()
      .bodyToFlux(AuthGroupResponse::class.java)
      .collectList().block()

    val serviceProviderOrgs = groups
      .filter { it.groupCode.startsWith(AuthServiceProviderGroupPrefix) }
      .map { it.groupCode.removePrefix(AuthServiceProviderGroupPrefix) }

    // in the future, we will have to handle multiple group memberships
    // which represent SP admins managing subcontractor organizations.
    // for now we can assume there is only one group per user.
    return if (serviceProviderOrgs.isEmpty()) null else serviceProviderOrgs[0]
  }

  fun getUserDetail(user: AuthUser): UserDetail {
    return if (user.authSource == "auth") {
      val url = UriComponentsBuilder.fromPath(authUserDetailLocation).buildAndExpand(user.userName).toString()
      hmppsAuthApiWebClient.get().uri(url)
        .retrieve()
        .bodyToMono(AuthUserDetailResponse::class.java)
        .map {
          if (!it.verified) {
            throw UnverifiedEmailException()
          }
          UserDetail(it.firstName, it.email)
        }
        .block()
    } else {
      val detailUrl = UriComponentsBuilder.fromPath(userDetailLocation).buildAndExpand(user.userName).toString()
      val emailUrl = UriComponentsBuilder.fromPath(userEmailLocation).buildAndExpand(user.userName).toString()
      Mono.zip(
        hmppsAuthApiWebClient.get().uri(detailUrl)
          .retrieve()
          .bodyToMono(UserDetailResponse::class.java)
          .map { it.name.substringBefore(' ') },
        hmppsAuthApiWebClient.get().uri(emailUrl)
          .retrieve()
          .onStatus({ it.equals(HttpStatus.NO_CONTENT) }, { Mono.error(UnverifiedEmailException()) })
          .bodyToMono(UserEmailResponse::class.java)
          .map { it.email }
      )
        .map { UserDetail(it.t1, it.t2) }
        .block()
    }
  }
}
