package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller

import ServiceProviderSentReferralSummaryDTO
import com.fasterxml.jackson.annotation.JsonView
import com.microsoft.applicationinsights.TelemetryClient
import mu.KLogging
import net.logstash.logback.argument.StructuredArguments.kv
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.web.PageableDefault
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
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.authorization.ClientApiAccessChecker
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.authorization.UserMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller.mappers.CancellationReasonMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.ActionPlanSummaryDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.CreateReferralRequestDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.DashboardType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.DraftOasysRiskInformationDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.DraftReferralDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.EndReferralRequestDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.ReferralAssignmentDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.SelectedDesiredOutcomesDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.SentReferralDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.SentReferralSummaryForDashboardDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.ServiceCategoryFullDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.SetComplexityLevelRequestDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.SupplierAssessmentDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.Views
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.CancellationReason
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Referral
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ReferralForDashboard
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.SupplierAssessment
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.ActionPlanService
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.DraftOasysRiskInformationService
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.ReferralConcluder
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.ReferralService
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.ServiceCategoryService
import java.util.UUID
import javax.annotation.Nullable
import javax.persistence.EntityNotFoundException

@RestController
class ReferralController(
  private val referralService: ReferralService,
  private val referralConcluder: ReferralConcluder,
  private val serviceCategoryService: ServiceCategoryService,
  private val userMapper: UserMapper,
  private val clientApiAccessChecker: ClientApiAccessChecker,
  private val cancellationReasonMapper: CancellationReasonMapper,
  private val actionPlanService: ActionPlanService,
  private val draftOasysRiskInformationService: DraftOasysRiskInformationService,
  private val telemetryClient: TelemetryClient,
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
    val referral = getSentReferralAuthenticatedRequest(authentication, id)
    return SentReferralDTO.from(referral, referralConcluder.requiresEndOfServiceReportCreation(referral))
  }

  @JsonView(Views.SentReferral::class)
  @GetMapping("/sent-referrals")
  fun getSentReferrals(
    authentication: JwtAuthenticationToken,
    @Nullable @RequestParam(name = "concluded", required = false) concluded: Boolean?,
    @Nullable @RequestParam(name = "cancelled", required = false) cancelled: Boolean?,
    @Nullable @RequestParam(name = "unassigned", required = false) unassigned: Boolean?,
    @Nullable @RequestParam(name = "assignedTo", required = false) assignedToUserId: String?,
  ): List<SentReferralSummaryForDashboardDTO> {
    val user = userMapper.fromToken(authentication)
    val referrals = referralService.getSentReferralsForUser(user, concluded, cancelled, unassigned, assignedToUserId, null) as List<ReferralForDashboard>
    logger.info(
      "returning list of referrals from /sent-referrals",
      kv("userType", user.authSource),
      kv("numberOfReferrals", referrals.size),
      kv("params", mapOf("concluded" to concluded, "cancelled" to cancelled, "unassigned" to unassigned, "assignedTo" to (assignedToUserId != null)))
    )
    return referrals.map { SentReferralSummaryForDashboardDTO.from(it) }
  }

  @JsonView(Views.SentReferral::class)
  @GetMapping("/sent-referrals/paged")
  fun getSentReferrals(
    authentication: JwtAuthenticationToken,
    @Nullable @RequestParam(name = "concluded", required = false) concluded: Boolean?,
    @Nullable @RequestParam(name = "cancelled", required = false) cancelled: Boolean?,
    @Nullable @RequestParam(name = "unassigned", required = false) unassigned: Boolean?,
    @Nullable @RequestParam(name = "assignedTo", required = false) assignedToUserId: String?,
    @PageableDefault(page = 0, size = 50, sort = ["sentAt"]) page: Pageable,
  ): Page<SentReferralSummaryForDashboardDTO> {
    val user = userMapper.fromToken(authentication)
    return (referralService.getSentReferralsForUser(user, concluded, cancelled, unassigned, assignedToUserId, page) as Page<ReferralForDashboard>).map { SentReferralSummaryForDashboardDTO.from(it) }.also {
      telemetryClient.trackEvent(
        "PagedDashboardRequest",
        null,
        mutableMapOf("totalNumberOfReferrals" to it.totalElements.toDouble(), "pageSize" to page.pageSize.toDouble())
      )
    }
  }

  @JsonView(Views.SentReferral::class)
  @GetMapping("/sent-referrals/summaries")
  fun getSentReferralsForDashboard(
    authentication: JwtAuthenticationToken,
    @Nullable @RequestParam(name = "concluded", required = false) concluded: Boolean?,
    @Nullable @RequestParam(name = "cancelled", required = false) cancelled: Boolean?,
    @Nullable @RequestParam(name = "unassigned", required = false) unassigned: Boolean?,
    @Nullable @RequestParam(name = "assignedTo", required = false) assignedToUserId: String?,
    @PageableDefault(page = 0, size = 50, sort = ["sentAt"]) page: Pageable,
  ): Page<SentReferralSummaryForDashboardDTO> {
    val user = userMapper.fromToken(authentication)
    return (referralService.getSentReferralsForUser(user, concluded, cancelled, unassigned, assignedToUserId, page) as Page<ReferralForDashboard>).map { SentReferralSummaryForDashboardDTO.from(it) }.also {
      telemetryClient.trackEvent(
        "PagedDashboardRequest",
        null,
        mutableMapOf("totalNumberOfReferrals" to it.totalElements.toDouble(), "pageSize" to page.pageSize.toDouble())
      )
    }
  }

  @Deprecated(message = "This is a temporary solution to by-pass the extremely long wait times in production that occurs with /sent-referrals")
  @JsonView(Views.SentReferral::class)
  @GetMapping("/sent-referrals/summary/service-provider")
  fun getServiceProviderSentReferralsSummary(
    authentication: JwtAuthenticationToken,
    @Nullable @RequestParam(name = "dashboardType", required = false) dashboardTypeSelection: String?,
  ): List<ServiceProviderSentReferralSummaryDTO> {
    val user = userMapper.fromToken(authentication)
    var dashboardType = dashboardTypeSelection?.let { DashboardType.valueOf(it) }
    return referralService.getServiceProviderSummaries(user, dashboardType)
      .map { ServiceProviderSentReferralSummaryDTO.from(it) }.also {
        telemetryClient.trackEvent(
          "ServiceProviderReferralSummaryRequest",
          null,
          mutableMapOf("totalNumberOfReferrals" to it.size.toDouble())
        )
      }
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

  @PatchMapping("/draft-referral/{id}/oasys-risk-information")
  fun setDraftReferralOasysRiskInformation(
    authentication: JwtAuthenticationToken,
    @PathVariable id: UUID,
    @RequestBody request: DraftOasysRiskInformationDTO
  ): DraftOasysRiskInformationDTO {
    val referral = getDraftReferralForAuthenticatedUser(authentication, id)
    val user = userMapper.fromToken(authentication)
    val draftOasysRiskInformation = draftOasysRiskInformationService.updateDraftOasysRiskInformation(referral, request, user)
    return DraftOasysRiskInformationDTO.from(draftOasysRiskInformation)
  }

  @GetMapping("/draft-referral/{id}/oasys-risk-information")
  fun getDraftReferralOasysRiskInformation(
    authentication: JwtAuthenticationToken,
    @PathVariable id: UUID
  ): DraftOasysRiskInformationDTO {
    // check that user has access to referral
    val referral = getDraftReferralForAuthenticatedUser(authentication, id)
    return draftOasysRiskInformationService.getDraftOasysRiskInformation(referral.id)
      ?.let { DraftOasysRiskInformationDTO.from(it) }
      ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "draft oasys risk information not found [id=$id]")
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
    val sentReferral = getSentReferralAuthenticatedRequest(authentication, id)

    val supplierAssessment = getSupplierAssessment(sentReferral)
    return SupplierAssessmentDTO.from(supplierAssessment)
  }

  @GetMapping("/sent-referral/{id}/approved-action-plans")
  fun getReferralApprovedActionPlans(
    @PathVariable id: UUID,
  ): List<ActionPlanSummaryDTO> {
    val actionPlans = actionPlanService.getApprovedActionPlansByReferral(id)
    return ActionPlanSummaryDTO.from(actionPlans)
  }

  private fun getSupplierAssessment(sentReferral: Referral): SupplierAssessment {
    return sentReferral.supplierAssessment ?: throw ResponseStatusException(
      HttpStatus.NOT_FOUND,
      "Supplier assessment does not exist for referral[id=${sentReferral.id}]"
    )
  }

  private fun getSentReferralAuthenticatedRequest(authentication: JwtAuthenticationToken, id: UUID) =
    if (clientApiAccessChecker.isClientRequestWithReadAllRole(authentication)) {
      referralService.getSentReferral(id)
        ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "sent referral not found [id=$id]")
    } else {
      getSentReferralForAuthenticatedUser(authentication, id)
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
