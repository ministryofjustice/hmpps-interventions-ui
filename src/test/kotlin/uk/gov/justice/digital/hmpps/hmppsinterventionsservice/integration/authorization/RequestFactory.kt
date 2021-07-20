package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.integration.authorization

import org.springframework.test.web.reactive.server.WebTestClient
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.AuthUserDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.CreateReferralRequestDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.DraftReferralDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.EndReferralRequestDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.ReferralAssignmentDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.integration.SetupAssistant
import java.util.UUID

enum class Request {
  CreateDraftReferral,
  GetDraftReferral,
  UpdateDraftReferral,
  SendDraftReferral,
  GetSentReferral,
  AssignSentReferral,
  EndSentReferral,
  GetDraftReferrals,
  GetSentReferrals,
  GetServiceProviderReferralsSummary,
}

class RequestFactory(private val webTestClient: WebTestClient, private val setupAssistant: SetupAssistant) {
  fun create(request: Request, token: String?, vararg urlParams: String, body: Any? = null): WebTestClient.RequestHeadersSpec<*> {
    val spec = when (request) {
      Request.CreateDraftReferral -> webTestClient.post().uri("/draft-referral").bodyValue(
        if (body != null) body as CreateReferralRequestDTO else CreateReferralRequestDTO("X123456", UUID.randomUUID())
      )

      Request.GetDraftReferral -> webTestClient.get().uri("/draft-referral/${urlParams[0]}")
      Request.UpdateDraftReferral -> webTestClient.patch().uri("/draft-referral/${urlParams[0]}").bodyValue(
        if (body != null) body as DraftReferralDTO else DraftReferralDTO()
      )
      Request.SendDraftReferral -> webTestClient.post().uri("/draft-referral/${urlParams[0]}/send")

      Request.GetSentReferral -> webTestClient.get().uri("/sent-referral/${urlParams[0]}")
      Request.AssignSentReferral -> webTestClient.post().uri("/sent-referral/${urlParams[0]}/assign").bodyValue(
        if (body != null) body as ReferralAssignmentDTO else ReferralAssignmentDTO(AuthUserDTO.from(setupAssistant.createSPUser()))
      )
      Request.EndSentReferral -> webTestClient.post().uri("/sent-referral/${urlParams[0]}/end").bodyValue(
        if (body != null) body as EndReferralRequestDTO else EndReferralRequestDTO(setupAssistant.randomCancellationReason().code, "comments")
      )

      Request.GetDraftReferrals -> webTestClient.get().uri("/draft-referrals")
      Request.GetSentReferrals -> webTestClient.get().uri("/sent-referrals")
      Request.GetServiceProviderReferralsSummary -> webTestClient.get().uri("/sent-referrals/summary/service-provider")
    }

    return if (token != null) {
      spec.headers { http -> http.setBearerAuth(token) }
    } else {
      spec
    }
  }
}
