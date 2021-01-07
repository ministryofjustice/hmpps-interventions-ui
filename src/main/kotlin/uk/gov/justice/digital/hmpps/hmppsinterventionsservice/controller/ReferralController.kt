package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller

import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.server.ResponseStatusException
import org.springframework.web.server.ServerWebInputException
import org.springframework.web.servlet.support.ServletUriComponentsBuilder
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.DraftReferralDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.ServiceCategoryDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.service.ReferralService
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.service.ServiceCategoryService
import java.util.UUID

@RestController
class ReferralController(
  private val referralService: ReferralService,
  private val serviceCategoryService: ServiceCategoryService
) {

  @PostMapping("/draft-referral")
  fun createDraftReferral(): ResponseEntity<DraftReferralDTO> {

    val referral = referralService.createDraftReferral()
    val location = ServletUriComponentsBuilder
      .fromCurrentRequest()
      .path("/{id}")
      .buildAndExpand(referral.id)
      .toUri()

    return ResponseEntity
      .created(location)
      .body(DraftReferralDTO.from(referral))
  }

  @GetMapping("/draft-referral/{id}")
  fun getDraftReferralByID(@PathVariable id: String): DraftReferralDTO {
    val uuid = parseID(id)

    return referralService.getDraftReferral(uuid)
      ?.let { DraftReferralDTO.from(it) }
      ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "referral not found [id=$uuid]")
  }

  @PatchMapping("/draft-referral/{id}")
  fun patchDraftReferralByID(@PathVariable id: String, @RequestBody partialUpdate: DraftReferralDTO): DraftReferralDTO {
    val uuid = parseID(id)

    val referralToUpdate = referralService.getDraftReferral(uuid)
      ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "referral not found [id=$uuid]")

    val updatedReferral = referralService.updateDraftReferral(referralToUpdate, partialUpdate)
    return DraftReferralDTO.from(updatedReferral)
  }

  @GetMapping("/draft-referrals")
  fun getDraftReferralsCreatedByUserID(@RequestParam userID: String): List<DraftReferralDTO> {
    return referralService.getDraftReferralsCreatedByUserID(userID)
  }

  @GetMapping("/service-category/{id}")
  fun getServiceCategoryByID(@PathVariable id: String): ServiceCategoryDTO {
    val uuid = parseID(id)

    return serviceCategoryService.getServiceCategoryByID(uuid)
      ?.let { ServiceCategoryDTO.from(it) }
      ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "service category not found [id=$uuid]")
  }

  private fun parseID(id: String): UUID {
    return try {
      UUID.fromString(id)
    } catch (e: IllegalArgumentException) {
      throw ServerWebInputException("could not parse id [id=$id]")
    }
  }
}
