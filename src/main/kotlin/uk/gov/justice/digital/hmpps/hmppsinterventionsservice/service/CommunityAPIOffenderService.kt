package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.reactive.function.client.WebClientResponseException
import org.springframework.web.util.UriComponentsBuilder
import reactor.core.publisher.Mono
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.RestClient
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser

data class Offender(
  val crnNumber: String,
)

data class ServiceUserAccessResult(
  val canAccess: Boolean,
  val messages: List<String>,
)

data class ResponsibleOfficer(
  val firstName: String?,
  val email: String?,
  val staffId: Long?,
)

private data class UserAccessResponse(
  val exclusionMessage: String?,
  val restrictionMessage: String?,
)

private data class StaffDetailsResponse(
  val staffIdentifier: String,
)

private data class ContactableHumanResponse(
  val forenames: String?,
  val surname: String?,
  val email: String?,
  val phoneNumber: String?,
)

private data class OffenderManagerResponse(
  val staff: ContactableHumanResponse?,
  val staffId: Long?,
  val isResponsibleOfficer: Boolean?,
)

@Service
class CommunityAPIOffenderService(
  @Value("\${community-api.locations.offender-access}") private val offenderAccessLocation: String,
  @Value("\${community-api.locations.managed-offenders}") private val managedOffendersLocation: String,
  @Value("\${community-api.locations.staff-details}") private val staffDetailsLocation: String,
  @Value("\${community-api.locations.offender-managers}") private val offenderManagersLocation: String,
  private val communityApiClient: RestClient,
  private val telemetryService: TelemetryService,
) {
  fun checkIfAuthenticatedDeliusUserHasAccessToServiceUser(user: AuthUser, crn: String): ServiceUserAccessResult {
    val userAccessPath = UriComponentsBuilder.fromPath(offenderAccessLocation)
      .buildAndExpand(crn, user.userName)
      .toString()

    val response = communityApiClient.get(userAccessPath)
      .retrieve()
      .onStatus({ it.equals(HttpStatus.FORBIDDEN) }, { Mono.empty() })
      .toEntity(UserAccessResponse::class.java)
      .block()

    return ServiceUserAccessResult(
      !response.statusCode.equals(HttpStatus.FORBIDDEN),
      listOfNotNull(response.body.restrictionMessage, response.body.exclusionMessage)
    )
  }

  fun getManagedOffendersForDeliusUser(user: AuthUser): List<Offender> {
    val staffIdentifier = getStaffIdentifier(user)
      // if a delius user does not have a staff identifier it's not an error;
      // but it does mean they do not have any managed offenders allocated.
      ?: return emptyList()

    val managedOffendersPath = UriComponentsBuilder.fromPath(managedOffendersLocation)
      .buildAndExpand(staffIdentifier)
      .toString()

    return communityApiClient.get(managedOffendersPath)
      .retrieve()
      .bodyToFlux(Offender::class.java)
      .collectList()
      .block()
  }

  private fun getStaffIdentifier(user: AuthUser): String? {
    val staffDetailsPath = UriComponentsBuilder.fromPath(staffDetailsLocation)
      .buildAndExpand(user.userName)
      .toString()

    return communityApiClient.get(staffDetailsPath)
      .retrieve()
      .bodyToMono(StaffDetailsResponse::class.java)
      .onErrorResume(WebClientResponseException::class.java) { e ->
        when (e.statusCode) {
          // not all delius users are staff
          HttpStatus.NOT_FOUND -> Mono.empty()
          else -> Mono.error(e)
        }
      }
      .block()
      ?.staffIdentifier
  }

  fun getResponsibleOfficer(crn: String): ResponsibleOfficer {
    val offenderManagersPath = UriComponentsBuilder.fromPath(offenderManagersLocation)
      .buildAndExpand(crn)
      .toString()

    val responsibleOfficers = communityApiClient.get(offenderManagersPath)
      .retrieve()
      .bodyToFlux(OffenderManagerResponse::class.java)
      .filter { it.isResponsibleOfficer == true }
      .map { ResponsibleOfficer(it.staff?.forenames?.substringBefore(' '), it.staff?.email, it.staffId) }
      .collectList()
      .block()

    // as with many community API endpoints, we have a few assumptions about the data.
    // if there are no ROs, we can't recover. if there are more than one, we just take
    // the first.
    responsibleOfficers.size.let {
      when {
        it == 0 -> telemetryService.reportInvalidAssumption(
          "service users always have a responsible officer",
          mapOf("crn" to crn),
          recoverable = false
        )
        it > 1 -> telemetryService.reportInvalidAssumption(
          "service users only have one responsible officer",
          mapOf("crn" to crn, "numberOfResponsibleOfficers" to it.toString()),
        )
      }
    }

    return responsibleOfficers.first()
  }
}
