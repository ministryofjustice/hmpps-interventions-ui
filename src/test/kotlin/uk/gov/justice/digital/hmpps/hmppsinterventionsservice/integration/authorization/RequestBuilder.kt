package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.integration.authorization

import org.springframework.test.web.reactive.server.WebTestClient
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.AuthUserDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.CreateReferralRequestDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.DraftReferralDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.EndReferralRequestDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.ReferralAssignmentDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.integration.pact.SetupAssistant
import java.util.UUID

enum class Request {
  CreateDraftReferral,
  GetDraftReferral,
  UpdateDraftReferral,
  SendDraftReferral,
  GetSentReferral,
  AssignSentReferral,
  EndSentReferral,
}

class RequestBuilder(private val webTestClient: WebTestClient, private val setupAssistant: SetupAssistant) {
  fun referralRequest(request: Request, referralId: UUID, token: String?): WebTestClient.RequestHeadersSpec<*> {
    val spec = when (request) {
      Request.CreateDraftReferral -> webTestClient.post().uri("/draft-referral").bodyValue(CreateReferralRequestDTO("X123456", UUID.randomUUID()))

      Request.GetDraftReferral -> webTestClient.get().uri("/draft-referral/$referralId")
      Request.UpdateDraftReferral -> webTestClient.patch().uri("/draft-referral/$referralId").bodyValue(DraftReferralDTO())
      Request.SendDraftReferral -> webTestClient.post().uri("/draft-referral/$referralId/send")

      Request.GetSentReferral -> webTestClient.get().uri("/sent-referral/$referralId")
      Request.AssignSentReferral -> webTestClient.post().uri("/sent-referral/$referralId/assign").bodyValue(ReferralAssignmentDTO(AuthUserDTO.from(setupAssistant.createSPUser())))
      Request.EndSentReferral -> webTestClient.post().uri("/sent-referral/$referralId/end").bodyValue(EndReferralRequestDTO(setupAssistant.randomCancellationReason().code, "comments"))
    }

    return if (token != null) {
      spec.headers { http -> http.setBearerAuth(token) }
    } else {
      spec
    }
  }
}
