package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller

import org.springframework.http.ResponseEntity
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.CreateActionPlanDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.SentReferralDTO

@RestController
class ActionPlanController() {

  @PostMapping("/draft-action-plan")
  fun createDraftActionPlan(@RequestBody createActionPlan: CreateActionPlanDTO, authentication: JwtAuthenticationToken): ResponseEntity<SentReferralDTO> {

    throw UnsupportedOperationException()
  }
}
