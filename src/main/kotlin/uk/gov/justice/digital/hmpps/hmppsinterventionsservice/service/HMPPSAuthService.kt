package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import io.netty.channel.ConnectTimeoutException
import io.netty.handler.timeout.ReadTimeoutException
import mu.KLogging
import net.logstash.logback.argument.StructuredArguments
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.util.UriComponentsBuilder
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import reactor.util.retry.Retry
import reactor.util.retry.Retry.RetrySignal
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.RestClient
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthGroupID
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser
import javax.transaction.Transactional

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
@Transactional
class HMPPSAuthService(
  @Value("\${hmppsauth.api.locations.auth-user-groups}") private val authUserGroupsLocation: String,
  @Value("\${hmppsauth.api.locations.auth-user-detail}") private val authUserDetailLocation: String,
  @Value("\${hmppsauth.api.locations.user-email}") private val userEmailLocation: String,
  @Value("\${hmppsauth.api.locations.user-detail}") private val userDetailLocation: String,
  @Value("\${webclient.hmpps-auth.max-retry-attempts}") private val maxRetryAttempts: Long,
  private val hmppsAuthApiClient: RestClient,
) {
  companion object : KLogging()

  fun getUserGroups(user: AuthUser): List<AuthGroupID>? {
    val url = UriComponentsBuilder.fromPath(authUserGroupsLocation)
      .buildAndExpand(user.userName)
      .toString()

    return hmppsAuthApiClient.get(url)
      .retrieve()
      .onStatus({ HttpStatus.NOT_FOUND == it }, { Mono.just(null) })
      .bodyToFlux(AuthGroupResponse::class.java)
      .withRetryPolicy()
      .map { it.groupCode }
      .collectList().block()
  }

  fun getUserDetail(user: AuthUser): UserDetail {
    return if (user.authSource == "auth") {
      val url = UriComponentsBuilder.fromPath(authUserDetailLocation).buildAndExpand(user.userName).toString()
      hmppsAuthApiClient.get(url)
        .retrieve()
        .bodyToMono(AuthUserDetailResponse::class.java)
        .withRetryPolicy()
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
        hmppsAuthApiClient.get(detailUrl)
          .retrieve()
          .bodyToMono(UserDetailResponse::class.java)
          .withRetryPolicy()
          .map { it.name.substringBefore(' ') },
        hmppsAuthApiClient.get(emailUrl)
          .retrieve()
          .onStatus({ it.equals(HttpStatus.NO_CONTENT) }, { Mono.error(UnverifiedEmailException()) })
          .bodyToMono(UserEmailResponse::class.java)
          .withRetryPolicy()
          .map { it.email }
      )
        .map { UserDetail(it.t1, it.t2) }
        .block()
    }
  }

  fun <T> Flux<T>.withRetryPolicy(): Flux<T> {
    return this
      .retryWhen(
        Retry.max(maxRetryAttempts)
          .filter { isTimeoutException(it) }
          .doBeforeRetry { logRetrySignal(it) }
      )
  }

  fun <T> Mono<T>.withRetryPolicy(): Mono<T> {
    return this
      .retryWhen(
        Retry.max(maxRetryAttempts)
          .filter { isTimeoutException(it) }
          .doBeforeRetry { logRetrySignal(it) }
      )
  }

  fun isTimeoutException(it: Throwable): Boolean {
    // Timeout for NO_RESPONSE is wrapped in a WebClientRequestException
    return it is ReadTimeoutException || it is ConnectTimeoutException ||
      it.cause is ReadTimeoutException || it.cause is ConnectTimeoutException
  }

  fun logRetrySignal(retrySignal: RetrySignal) {
    val exception = retrySignal.failure()?.cause.let { it } ?: retrySignal.failure()
    val message = exception.message ?: exception.javaClass.canonicalName
    logger.debug(
      "Retrying due to [$message]",
      exception,
      StructuredArguments.kv("res.causeMessage", message),
      StructuredArguments.kv("totalRetries", retrySignal.totalRetries())
    )
  }
}
