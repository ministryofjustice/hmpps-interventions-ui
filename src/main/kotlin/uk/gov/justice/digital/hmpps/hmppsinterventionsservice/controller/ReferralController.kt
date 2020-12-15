package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.servlet.support.ServletUriComponentsBuilder
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.DraftReferral
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.service.ReferralService
import java.util.UUID

@RestController
class ReferralController(private val referralService: ReferralService) {

  @PostMapping("/draft-referral")
  fun createDraftReferral(): ResponseEntity<DraftReferral> {

    val referral = referralService.createDraftReferral()
    val location = ServletUriComponentsBuilder
      .fromCurrentRequest()
      .path("/{id}")
      .buildAndExpand(referral.id)
      .toUri()

    return ResponseEntity
      .created(location)
      .body(DraftReferral(referral))
  }

  @GetMapping("/draft-referral/{id}")
  fun getDraftReferralByID(@PathVariable id: String): ResponseEntity<Any> {
    val uuid = try {
      UUID.fromString(id)
    } catch (e: IllegalArgumentException) {
      return ResponseEntity.badRequest().body("malformed id")
    }

    return referralService.getDraftReferral(uuid)
      ?.let { ResponseEntity.ok(DraftReferral(it)) }
      ?: ResponseEntity.notFound().build()
  }

  @PatchMapping("/draft-referral/{id}")
  fun patchDraftReferralByID(@PathVariable id: String, @RequestBody partialUpdate: DraftReferral): ResponseEntity<Any> {
    val uuid = try {
      UUID.fromString(id)
    } catch (e: IllegalArgumentException) {
      return ResponseEntity.badRequest().body("malformed id")
    }

    return referralService.updateDraftReferral(uuid, partialUpdate)
      ?.let {
        ResponseEntity.ok(DraftReferral(it))
      }
      ?: ResponseEntity.notFound().build()
  }
}
