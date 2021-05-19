package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller

import mu.KLogging
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.server.ResponseStatusException
import org.springframework.web.server.ServerWebInputException
import org.springframework.web.servlet.support.ServletUriComponentsBuilder
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.authorization.UserMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller.mappers.CancellationReasonMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.CreateReferralRequestDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.DraftReferralDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.EndReferralRequestDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.ReferralAssignmentDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.SentReferralDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.ServiceCategoryFullDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.CancellationReason
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.ReferralService
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.ServiceCategoryService
import java.util.UUID
import javax.persistence.EntityNotFoundException

@RestController
class ReferralController(
  private val referralService: ReferralService,
  private val serviceCategoryService: ServiceCategoryService,
  private val userMapper: UserMapper,
  private val cancellationReasonMapper: CancellationReasonMapper,
) {
  companion object : KLogging()

  @PostMapping("/sent-referral/{id}/assign")
  fun assignSentReferral(
    @PathVariable id: UUID,
    @RequestBody referralAssignment: ReferralAssignmentDTO,
    authentication: JwtAuthenticationToken,
  ): SentReferralDTO {
    val assignedBy = userMapper.fromToken(authentication)

    val sentReferral = referralService.getSentReferralForUser(id, assignedBy)
      ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "sent referral not found [id=$id]")

    val assignedTo = AuthUser(
      id = referralAssignment.assignedTo.userId,
      authSource = referralAssignment.assignedTo.authSource,
      userName = referralAssignment.assignedTo.username,
    )
    return SentReferralDTO.from(
      referralService.assignSentReferral(sentReferral, assignedBy, assignedTo)
    )
  }

  @PostMapping("/draft-referral/{id}/send")
  fun sendDraftReferral(@PathVariable id: UUID, authentication: JwtAuthenticationToken): ResponseEntity<SentReferralDTO> {
    val user = userMapper.fromToken(authentication)

    val draftReferral = referralService.getDraftReferralForUser(id, user)
      ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "draft referral not found [id=$id]")

    val sentReferral = referralService.sendDraftReferral(draftReferral, user)

    val location = ServletUriComponentsBuilder
      .fromCurrentContextPath()
      .path("/sent-referral/{id}")
      .buildAndExpand(sentReferral.id)
      .toUri()

    return ResponseEntity
      .created(location)
      .body(SentReferralDTO.from(sentReferral))
  }

  @GetMapping("/sent-referral/{id}")
  fun getSentReferral(@PathVariable id: UUID, authentication: JwtAuthenticationToken): SentReferralDTO {
    val user = userMapper.fromToken(authentication)
    return referralService.getSentReferralForUser(id, user)
      ?.let { SentReferralDTO.from(it) }
      ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "sent referral not found [id=$id]")
  }

  @GetMapping("/sent-referrals")
  fun getSentReferrals(
    authentication: JwtAuthenticationToken,
  ): List<SentReferralDTO> {
    val user = userMapper.fromToken(authentication)
    return referralService.getSentReferralsForUser(user).map { SentReferralDTO.from(it) }
  }

  @PostMapping("/sent-referral/{id}/end")
  fun endSentReferral(@PathVariable id: UUID, @RequestBody endReferralRequest: EndReferralRequestDTO, authentication: JwtAuthenticationToken): SentReferralDTO {
    val user = userMapper.fromToken(authentication)

    val sentReferral = referralService.getSentReferralForUser(id, user)
      ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "referral not found [id=$id]")

    val cancellationReason = cancellationReasonMapper.mapCancellationReasonIdToCancellationReason(endReferralRequest.reasonCode)

    return SentReferralDTO.from(referralService.requestReferralEnd(sentReferral, user, cancellationReason, endReferralRequest.comments))
  }

  @PostMapping("/draft-referral")
  fun createDraftReferral(@RequestBody createReferralRequestDTO: CreateReferralRequestDTO, authentication: JwtAuthenticationToken): ResponseEntity<DraftReferralDTO> {
    val user = userMapper.fromToken(authentication)

    val referral = try {
      referralService.createDraftReferral(
        user,
        createReferralRequestDTO.serviceUserCrn,
        createReferralRequestDTO.interventionId,
      )
    } catch (e: EntityNotFoundException) {
      throw ServerWebInputException("invalid intervention id [id=${createReferralRequestDTO.interventionId}]")
    }

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
  fun getDraftReferralByID(@PathVariable id: UUID, authentication: JwtAuthenticationToken): DraftReferralDTO {
    val user = userMapper.fromToken(authentication)
    return referralService.getDraftReferralForUser(id, user)
      ?.let { DraftReferralDTO.from(it) }
      ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "draft referral not found [id=$id]")
  }

  @PatchMapping("/draft-referral/{id}")
  fun patchDraftReferralByID(@PathVariable id: UUID, @RequestBody partialUpdate: DraftReferralDTO, authentication: JwtAuthenticationToken): DraftReferralDTO {
    val user = userMapper.fromToken(authentication)
    val referralToUpdate = referralService.getDraftReferralForUser(id, user)
      ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "draft referral not found [id=$id]")

    val updatedReferral = referralService.updateDraftReferral(referralToUpdate, partialUpdate)
    return DraftReferralDTO.from(updatedReferral)
  }

  @GetMapping("/draft-referrals")
  fun getDraftReferrals(authentication: JwtAuthenticationToken): List<DraftReferralDTO> {
    val user = userMapper.fromToken(authentication)
    return referralService.getDraftReferralsForUser(user).map { DraftReferralDTO.from(it) }
  }

  @GetMapping("/service-category/{id}")
  fun getServiceCategoryByID(@PathVariable id: UUID): ServiceCategoryFullDTO {
    return serviceCategoryService.getServiceCategoryByID(id)
      ?.let { ServiceCategoryFullDTO.from(it) }
      ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "service category not found [id=$id]")
  }

  @GetMapping("/referral-cancellation-reasons")
  fun getCancellationReasons(): List<CancellationReason> {
    return referralService.getCancellationReasons()
  }
}
