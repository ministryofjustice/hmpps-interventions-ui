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
import org.springframework.web.bind.annotation.RequestParam
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
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.HMPPSAuthService
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.ReferralService
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.ServiceCategoryService
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.ServiceProviderService
import java.util.UUID
import javax.persistence.EntityNotFoundException

@RestController
class ReferralController(
  private val referralService: ReferralService,
  private val serviceCategoryService: ServiceCategoryService,
  private val hmppsAuthService: HMPPSAuthService,
  private val userMapper: UserMapper,
  private val cancellationReasonMapper: CancellationReasonMapper,
  private val serviceProviderService: ServiceProviderService
) {
  companion object : KLogging()

  private fun validateReferralAccess(authentication: JwtAuthenticationToken, referralId: UUID) {
    val authUser = parseAuthUserToken(authentication)
    val hmppsAuthGroupId = hmppsAuthService.getServiceProviderOrganizationForUser(authUser)
    val serviceProvider = serviceProviderService.getServiceProviderByReferralId(referralId)
      ?: throw ResponseStatusException(HttpStatus.NOT_FOUND)
    serviceProvider.let {
      if (it.id != hmppsAuthGroupId) {
        logger.error("AuthUser [id=${authUser.id}] does not have access to referral [id=$referralId]")
        throw ResponseStatusException(HttpStatus.UNAUTHORIZED, "unauthorized to access referral [id=$referralId]")
      }
    }
  }

  @PostMapping("/sent-referral/{id}/assign")
  fun assignSentReferral(
    @PathVariable id: UUID,
    @RequestBody referralAssignment: ReferralAssignmentDTO,
    authentication: JwtAuthenticationToken,
  ): SentReferralDTO {
    val sentReferral = referralService.getSentReferral(id)
      ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "sent referral not found [id=$id]")

    val assignedBy = userMapper.fromToken(authentication)
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
    val draftReferral = referralService.getDraftReferral(id)
      ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "draft referral not found [id=$id]")

    val user = userMapper.fromToken(authentication)
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
    validateReferralAccess(authentication, id)
    return referralService.getSentReferral(id)
      ?.let { SentReferralDTO.from(it) }
      ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "sent referral not found [id=$id]")
  }

  @GetMapping("/sent-referrals")
  fun getSentReferrals(
    @RequestParam sentBy: String? = null,
    @RequestParam sentTo: String? = null,
    @RequestParam assignedTo: String? = null,
  ): List<SentReferralDTO> {
    if (listOfNotNull(sentBy, sentTo, assignedTo).size != 1) {
      throw ServerWebInputException("a single search parameter must be supplied")
    }

    sentBy?.let {
      return referralService.getSentReferralsSentBy(it).map { referral -> SentReferralDTO.from(referral) }
    }

    sentTo?.let {
      return referralService.getSentReferralsForServiceProviderID(it).map { referral -> SentReferralDTO.from(referral) }
    }

    assignedTo?.let {
      return referralService.getSentReferralsAssignedTo(it).map { referral -> SentReferralDTO.from(referral) }
    }

    return emptyList()
  }

  @PostMapping("/sent-referral/{id}/end")
  fun endSentReferral(@PathVariable id: UUID, @RequestBody endReferralRequest: EndReferralRequestDTO, authentication: JwtAuthenticationToken): SentReferralDTO {
    val sentReferral = referralService.getSentReferral(id)
      ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "referral not found [id=$id]")

    val user = userMapper.fromToken(authentication)
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
  fun getDraftReferralByID(@PathVariable id: UUID): DraftReferralDTO {
    return referralService.getDraftReferral(id)
      ?.let { DraftReferralDTO.from(it) }
      ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "draft referral not found [id=$id]")
  }

  @PatchMapping("/draft-referral/{id}")
  fun patchDraftReferralByID(@PathVariable id: UUID, @RequestBody partialUpdate: DraftReferralDTO): DraftReferralDTO {
    val referralToUpdate = referralService.getDraftReferral(id)
      ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "draft referral not found [id=$id]")

    val updatedReferral = referralService.updateDraftReferral(referralToUpdate, partialUpdate)
    return DraftReferralDTO.from(updatedReferral)
  }

  @GetMapping("/draft-referrals")
  fun getDraftReferralsCreatedByUserID(@RequestParam userID: String): List<DraftReferralDTO> {
    return referralService.getDraftReferralsCreatedByUserID(userID)
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
