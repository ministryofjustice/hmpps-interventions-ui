package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller

import com.fasterxml.jackson.annotation.JsonView
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
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.SelectedDesiredOutcomesDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.SentReferralDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.SentReferralSummaryDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.ServiceCategoryFullDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.SetComplexityLevelRequestDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.SupplierAssessmentDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.Views
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.CancellationReason
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Referral
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.SupplierAssessment
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.ReferralConcluder
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.ReferralService
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.ServiceCategoryService
import java.util.UUID
import javax.persistence.EntityNotFoundException

@RestController
class ReferralController(
  private val referralService: ReferralService,
  private val referralConcluder: ReferralConcluder,
  private val serviceCategoryService: ServiceCategoryService,
  private val userMapper: UserMapper,
  private val cancellationReasonMapper: CancellationReasonMapper,
) {
  companion object : KLogging()

  @JsonView(Views.SentReferral::class)
  @PostMapping("/sent-referral/{id}/assign")
  fun assignSentReferral(
    @PathVariable id: UUID,
    @RequestBody referralAssignment: ReferralAssignmentDTO,
    authentication: JwtAuthenticationToken,
  ): SentReferralDTO {
    val sentReferral = getSentReferralForAuthenticatedUser(authentication, id)

    val assignedBy = userMapper.fromToken(authentication)
    val assignedTo = AuthUser(
      id = referralAssignment.assignedTo.userId,
      authSource = referralAssignment.assignedTo.authSource,
      userName = referralAssignment.assignedTo.username,
    )
    return SentReferralDTO.from(
      referralService.assignSentReferral(sentReferral, assignedBy, assignedTo),
      referralConcluder.requiresEndOfServiceReportCreation(sentReferral)
    )
  }

  @JsonView(Views.SentReferral::class)
  @PostMapping("/draft-referral/{id}/send")
  fun sendDraftReferral(@PathVariable id: UUID, authentication: JwtAuthenticationToken): ResponseEntity<SentReferralDTO> {
    val user = userMapper.fromToken(authentication)

    val draftReferral = getDraftReferralForAuthenticatedUser(authentication, id)

    val sentReferral = referralService.sendDraftReferral(draftReferral, user)

    val location = ServletUriComponentsBuilder
      .fromCurrentContextPath()
      .path("/sent-referral/{id}")
      .buildAndExpand(sentReferral.id)
      .toUri()

    return ResponseEntity
      .created(location)
      .body(SentReferralDTO.from(sentReferral, referralConcluder.requiresEndOfServiceReportCreation(sentReferral)))
  }

  @JsonView(Views.SentReferral::class)
  @GetMapping("/sent-referral/{id}")
  fun getSentReferral(@PathVariable id: UUID, authentication: JwtAuthenticationToken): SentReferralDTO {
    val referral = getSentReferralForAuthenticatedUser(authentication, id)
    return SentReferralDTO.from(referral, referralConcluder.requiresEndOfServiceReportCreation(referral))
  }

  @JsonView(Views.SentReferral::class)
  @GetMapping("/sent-referrals")
  fun getSentReferrals(
    authentication: JwtAuthenticationToken,
  ): List<SentReferralSummaryDTO> {
    val user = userMapper.fromToken(authentication)
    return referralService.getSentReferralsForUser(user).map { SentReferralSummaryDTO.from(it) }
  }

  @JsonView(Views.SentReferral::class)
  @PostMapping("/sent-referral/{id}/end")
  fun endSentReferral(@PathVariable id: UUID, @RequestBody endReferralRequest: EndReferralRequestDTO, authentication: JwtAuthenticationToken): SentReferralDTO {
    val sentReferral = getSentReferralForAuthenticatedUser(authentication, id)

    val cancellationReason = cancellationReasonMapper.mapCancellationReasonIdToCancellationReason(endReferralRequest.reasonCode)

    val user = userMapper.fromToken(authentication)
    return SentReferralDTO.from(
      referralService.requestReferralEnd(sentReferral, user, cancellationReason, endReferralRequest.comments),
      referralConcluder.requiresEndOfServiceReportCreation(sentReferral),
    )
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
    return DraftReferralDTO.from(getDraftReferralForAuthenticatedUser(authentication, id))
  }

  @PatchMapping("/draft-referral/{id}")
  fun patchDraftReferralByID(@PathVariable id: UUID, @RequestBody partialUpdate: DraftReferralDTO, authentication: JwtAuthenticationToken): DraftReferralDTO {
    val referralToUpdate = getDraftReferralForAuthenticatedUser(authentication, id)

    val updatedReferral = referralService.updateDraftReferral(referralToUpdate, partialUpdate)
    return DraftReferralDTO.from(updatedReferral)
  }

  @PatchMapping("/draft-referral/{id}/complexity-level")
  fun setDraftReferralComplexityLevel(authentication: JwtAuthenticationToken, @PathVariable id: UUID, @RequestBody request: SetComplexityLevelRequestDTO): DraftReferralDTO {
    val referral = getDraftReferralForAuthenticatedUser(authentication, id)
    val updatedReferral = referralService.updateDraftReferralComplexityLevel(referral, request.serviceCategoryId, request.complexityLevelId)
    return DraftReferralDTO.from(updatedReferral)
  }

  @PatchMapping("/draft-referral/{id}/desired-outcomes")
  fun setDraftReferralDesiredOutcomes(
    authentication: JwtAuthenticationToken,
    @PathVariable id: UUID,
    @RequestBody request: SelectedDesiredOutcomesDTO
  ): DraftReferralDTO {
    val referral = getDraftReferralForAuthenticatedUser(authentication, id)
    val updatedReferral = referralService.updateDraftReferralDesiredOutcomes(referral, request.serviceCategoryId, request.desiredOutcomesIds)
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

  @GetMapping("sent-referral/{id}/supplier-assessment")
  fun getSupplierAssessmentAppointment(
    @PathVariable id: UUID,
    authentication: JwtAuthenticationToken,
  ): SupplierAssessmentDTO {
    val user = userMapper.fromToken(authentication)

    val sentReferral = referralService.getSentReferralForUser(id, user)
      ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "sent referral not found [id=$id]")

    val supplierAssessment = getSupplierAssessment(sentReferral)
    return SupplierAssessmentDTO.from(supplierAssessment)
  }

  private fun getSupplierAssessment(sentReferral: Referral): SupplierAssessment {
    return sentReferral.supplierAssessment ?: throw ResponseStatusException(
      HttpStatus.NOT_FOUND,
      "Supplier assessment does not exist for referral[id=${sentReferral.id}]"
    )
  }

  private fun getDraftReferralForAuthenticatedUser(authentication: JwtAuthenticationToken, id: UUID): Referral {
    val user = userMapper.fromToken(authentication)
    return referralService.getDraftReferralForUser(id, user)
      ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "draft referral not found [id=$id]")
  }

  private fun getSentReferralForAuthenticatedUser(authentication: JwtAuthenticationToken, id: UUID): Referral {
    val user = userMapper.fromToken(authentication)
    return referralService.getSentReferralForUser(id, user)
      ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "sent referral not found [id=$id]")
  }
}
