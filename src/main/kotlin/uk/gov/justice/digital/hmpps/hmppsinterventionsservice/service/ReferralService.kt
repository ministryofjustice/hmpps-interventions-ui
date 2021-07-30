package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import mu.KotlinLogging
import net.logstash.logback.argument.StructuredArguments.kv
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import org.springframework.web.reactive.function.client.WebClientResponseException
import org.springframework.web.server.ServerWebInputException
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.authorization.ReferralAccessChecker
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.authorization.ReferralAccessFilter
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.authorization.ServiceProviderAccessScopeMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.authorization.ServiceUserAccessChecker
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.authorization.UserTypeChecker
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.config.AccessError
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.config.Code
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.config.FieldError
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.config.ValidationError
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.DraftReferralDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ReferralEventPublisher
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.CancellationReason
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.EndOfServiceReport
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Referral
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ReferralAssignment
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.SelectedDesiredOutcomesMapping
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ServiceProviderSentReferralSummary
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ServiceUserData
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ActionPlanSessionRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.AuthUserRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.CancellationReasonRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.InterventionRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ReferralRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ServiceCategoryRepository
import java.time.LocalDate
import java.time.OffsetDateTime
import java.util.UUID
import javax.transaction.Transactional

data class ContactableProbationPractitioner(
  val firstName: String,
  val email: String,
)

@Service
@Transactional
class ReferralService(
  val referralRepository: ReferralRepository,
  val authUserRepository: AuthUserRepository,
  val interventionRepository: InterventionRepository,
  val referralConcluder: ReferralConcluder,
  val eventPublisher: ReferralEventPublisher,
  val referenceGenerator: ReferralReferenceGenerator,
  val cancellationReasonRepository: CancellationReasonRepository,
  val actionPlanSessionRepository: ActionPlanSessionRepository,
  val serviceCategoryRepository: ServiceCategoryRepository,
  val referralAccessChecker: ReferralAccessChecker,
  val userTypeChecker: UserTypeChecker,
  val serviceProviderUserAccessScopeMapper: ServiceProviderAccessScopeMapper,
  val referralAccessFilter: ReferralAccessFilter,
  val communityAPIReferralService: CommunityAPIReferralService,
  val serviceUserAccessChecker: ServiceUserAccessChecker,
  val assessRisksAndNeedsService: RisksAndNeedsService,
  val communityAPIOffenderService: CommunityAPIOffenderService,
  val supplierAssessmentService: SupplierAssessmentService,
  val hmppsAuthService: HMPPSAuthService,
  val telemetryService: TelemetryService,
) {
  companion object {
    private val logger = KotlinLogging.logger {}
    private const val maxReferenceNumberTries = 10
  }

  fun getSentReferralForUser(id: UUID, user: AuthUser): Referral? {
    val referral = referralRepository.findByIdAndSentAtIsNotNull(id)

    referral?.let {
      referralAccessChecker.forUser(it, user)
    }

    return referral
  }

  fun getDraftReferralForUser(id: UUID, user: AuthUser): Referral? {
    if (!userTypeChecker.isProbationPractitionerUser(user)) {
      throw AccessError(user, "unsupported user type", listOf("only probation practitioners can access draft referrals"))
    }

    val referral = referralRepository.findByIdAndSentAtIsNull(id)
    referral?.let {
      referralAccessChecker.forUser(it, user)
    }
    return referral
  }

  fun assignSentReferral(referral: Referral, assignedBy: AuthUser, assignedTo: AuthUser): Referral {
    val assignment = ReferralAssignment(
      OffsetDateTime.now(),
      authUserRepository.save(assignedBy),
      authUserRepository.save(assignedTo)
    )
    referral.assignments.add(assignment)

    val assignedReferral = referralRepository.save(referral)
    eventPublisher.referralAssignedEvent(assignedReferral)
    return assignedReferral
  }

  fun getSentReferralsForUser(user: AuthUser): List<Referral> {
    if (userTypeChecker.isServiceProviderUser(user)) {
      return getSentReferralsForServiceProviderUser(user)
    }

    if (userTypeChecker.isProbationPractitionerUser(user)) {
      return getSentReferralsForProbationPractitionerUser(user)
    }

    throw AccessError(user, "unsupported user type", listOf("logins from ${user.authSource} are not supported"))
  }

  fun getServiceProviderSummaries(user: AuthUser): List<ServiceProviderSentReferralSummary> {
    if (userTypeChecker.isServiceProviderUser(user)) {
      return getSentReferralSummariesForServiceProviderUser(user)
    }
    throw AccessError(user, "unsupported user type", listOf("logins from ${user.authSource} are not supported"))
  }

  private fun getSentReferralsForServiceProviderUser(user: AuthUser): List<Referral> {
    val serviceProviders = serviceProviderUserAccessScopeMapper.fromUser(user).serviceProviders

    val referrals = referralRepository.findAllByInterventionDynamicFrameworkContractPrimeProviderInAndSentAtIsNotNull(serviceProviders)
      // todo: query for referrals where the service provider has been granted nominated access only
      .union(referralRepository.findAllByInterventionDynamicFrameworkContractSubcontractorProvidersInAndSentAtIsNotNull(serviceProviders))
      .filterNot { it.cancelled() }

    return referralAccessFilter.serviceProviderReferrals(referrals.toList(), user)
  }

  private fun getSentReferralSummariesForServiceProviderUser(user: AuthUser): List<ServiceProviderSentReferralSummary> {
    val serviceProviders = serviceProviderUserAccessScopeMapper.fromUser(user).serviceProviders

    val referralSummaries = referralRepository.referralSummaryForServiceProviders(serviceProviders = serviceProviders.map { serviceProvider -> serviceProvider.id })
    return referralAccessFilter.serviceProviderReferralSummaries(referralSummaries, user)
  }

  private fun getSentReferralsForProbationPractitionerUser(user: AuthUser): List<Referral> {
    val referralsStartedByPP = referralRepository.findByCreatedByAndSentAtIsNotNull(user)
    val referralsManagedByPP = try {
      communityAPIOffenderService.getManagedOffendersForDeliusUser(user)
    } catch (e: WebClientResponseException) {
      // don't stop users seeing their own referrals just because delius is not playing nice
      logger.error(
        "failed to get managed offenders for user {}",
        e,
        kv("username", user.userName),
      )
      emptyList()
    }.flatMap { referralRepository.findByServiceUserCRNAndSentAtIsNotNull(it.crnNumber) }

    val ppReferrals = referralsStartedByPP.union(referralsManagedByPP).sortedBy { it.createdAt }
    return referralAccessFilter.probationPractitionerReferrals(ppReferrals, user)
  }

  fun requestReferralEnd(referral: Referral, user: AuthUser, reason: CancellationReason, comments: String?): Referral {
    val now = OffsetDateTime.now()
    referral.endRequestedAt = now
    referral.endRequestedBy = authUserRepository.save(user)
    referral.endRequestedReason = reason
    comments?.let { referral.endRequestedComments = it }

    val savedReferral = referralRepository.save(referral)
    referralConcluder.concludeIfEligible(referral)

    return savedReferral
  }

  fun sendDraftReferral(referral: Referral, user: AuthUser): Referral {
    referral.sentAt = OffsetDateTime.now()
    referral.sentBy = authUserRepository.save(user)
    referral.referenceNumber = generateReferenceNumber(referral)

    /*
     * This is a temporary solution until a robust asynchronous link is created between Interventions
     * and Delius/ARN. Once the asynchronous link is implemented, this feature can be turned off, and instead
     * Delius/ARN will be notified via the normal asynchronous route
     */
    communityAPIReferralService.send(referral)
    submitAdditionalRiskInformation(referral, user)

    val sentReferral = referralRepository.save(referral)
    eventPublisher.referralSentEvent(sentReferral)
    supplierAssessmentService.createSupplierAssessment(referral)
    return sentReferral
  }

  private fun submitAdditionalRiskInformation(referral: Referral, user: AuthUser) {
    val riskInformation = referral.additionalRiskInformation
      ?: throw ServerWebInputException("can't submit a referral without risk information")

    val riskSubmittedAt = referral.additionalRiskInformationUpdatedAt
      ?: run {
        logger.warn("no additionalRiskInformationUpdatedAt on referral; setting to current time")
        OffsetDateTime.now()
      }

    val riskId = assessRisksAndNeedsService.createSupplementaryRisk(
      referral.id,
      referral.serviceUserCRN,
      user,
      riskSubmittedAt,
      riskInformation,
    )

    referral.supplementaryRiskId = riskId
    // we do not store _any_ risk information in interventions once it has been sent to ARN
    referral.additionalRiskInformation = null
  }

  fun createDraftReferral(
    user: AuthUser,
    crn: String,
    interventionId: UUID,
    overrideID: UUID? = null,
    overrideCreatedAt: OffsetDateTime? = null,
    endOfServiceReport: EndOfServiceReport? = null,
  ): Referral {
    if (!userTypeChecker.isProbationPractitionerUser(user)) {
      throw AccessError(user, "user cannot create referral", listOf("only probation practitioners can create draft referrals"))
    }

    // PPs can't create referrals for service users they are not allowed to see
    serviceUserAccessChecker.forProbationPractitionerUser(crn, user)

    val intervention = interventionRepository.getById(interventionId)
    val serviceCategories = intervention.dynamicFrameworkContract.contractType.serviceCategories
    val selectedServiceCategories = if (serviceCategories.size == 1) serviceCategories.toMutableSet() else null

    return referralRepository.save(
      Referral(
        id = overrideID ?: UUID.randomUUID(),
        createdAt = overrideCreatedAt ?: OffsetDateTime.now(),
        createdBy = authUserRepository.save(user),
        serviceUserCRN = crn,
        intervention = interventionRepository.getById(interventionId),
        endOfServiceReport = endOfServiceReport,
        selectedServiceCategories = selectedServiceCategories,
      )
    )
  }

  private fun validateDraftReferralUpdate(referral: Referral, update: DraftReferralDTO) {
    val errors = mutableListOf<FieldError>()

    update.completionDeadline?.let {
      if (it.isBefore(LocalDate.now())) {
        errors.add(FieldError(field = "completionDeadline", error = Code.DATE_MUST_BE_IN_THE_FUTURE))
      }

      // fixme: error if completion deadline is after sentence end date
    }

    update.needsInterpreter?.let {
      if (it && update.interpreterLanguage == null) {
        errors.add(FieldError(field = "needsInterpreter", error = Code.CONDITIONAL_FIELD_MUST_BE_SET))
      }
    }

    update.hasAdditionalResponsibilities?.let {
      if (it && update.whenUnavailable == null) {
        errors.add(FieldError(field = "hasAdditionalResponsibilities", error = Code.CONDITIONAL_FIELD_MUST_BE_SET))
      }
    }

    update.serviceUser?.let {
      if (it.crn != referral.serviceUserCRN) {
        errors.add(FieldError(field = "serviceUser.crn", error = Code.FIELD_CANNOT_BE_CHANGED))
      }
    }

    update.serviceCategoryIds?.let {
      if (!referral.intervention.dynamicFrameworkContract.contractType.serviceCategories.map {
        serviceCategory ->
        serviceCategory.id
      }.containsAll(it)
      ) {
        errors.add(FieldError(field = "serviceCategoryIds", error = Code.INVALID_SERVICE_CATEGORY_FOR_CONTRACT))
      }
    }

    if (errors.isNotEmpty()) {
      throw ValidationError("draft referral update invalid", errors)
    }
  }

  fun updateDraftReferral(referral: Referral, update: DraftReferralDTO): Referral {
    validateDraftReferralUpdate(referral, update)

    update.completionDeadline?.let {
      referral.completionDeadline = it
    }

    update.furtherInformation?.let {
      referral.furtherInformation = it
    }

    update.additionalNeedsInformation?.let {
      referral.additionalNeedsInformation = it
    }

    update.accessibilityNeeds?.let {
      referral.accessibilityNeeds = it
    }

    update.needsInterpreter?.let {
      referral.needsInterpreter = it
      referral.interpreterLanguage = if (it) update.interpreterLanguage else null
    }

    update.hasAdditionalResponsibilities?.let {
      referral.hasAdditionalResponsibilities = it
      referral.whenUnavailable = if (it) update.whenUnavailable else null
    }

    update.additionalRiskInformation?.let {
      referral.additionalRiskInformation = it
      referral.additionalRiskInformationUpdatedAt = OffsetDateTime.now()
    }

    update.maximumEnforceableDays?.let {
      referral.maximumEnforceableDays = it
    }

    update.relevantSentenceId?.let {
      referral.relevantSentenceId = it
    }

    update.serviceUser?.let {
      referral.serviceUserData = ServiceUserData(
        referral = referral,
        title = it.title,
        firstName = it.firstName,
        lastName = it.lastName,
        dateOfBirth = it.dateOfBirth,
        gender = it.gender,
        ethnicity = it.ethnicity,
        preferredLanguage = it.preferredLanguage,
        religionOrBelief = it.religionOrBelief,
        disabilities = it.disabilities,
      )
    }

    // The selected complexity levels and desired outcomes need to be removed if the user has unselected service categories that are linked to them
    update.serviceCategoryIds?.let { serviceCategoryIds ->
      referral.complexityLevelIds = referral.complexityLevelIds?.filterKeys { serviceCategoryId -> serviceCategoryIds.contains(serviceCategoryId) }?.toMutableMap()
      referral.selectedDesiredOutcomes = referral.selectedDesiredOutcomes?.filter { desiredOutcome -> serviceCategoryIds.contains(desiredOutcome.serviceCategoryId) }?.toMutableList()
    }

    // Need to save and flush the entity before removing selected service categories due to constraint violations being thrown from selected complexity levels and desired outcomes
    referralRepository.saveAndFlush(referral)

    update.serviceCategoryIds?.let { serviceCategoryIds ->
      val updatedServiceCategories = serviceCategoryRepository.findByIdIn(serviceCategoryIds)
      // the following code looks like a strange way to do this ...
      // however we have to be very intentional about updating the service categories,
      // rather than replacing the collection entirely. in the former case, hibernate
      // runs an update as you would expect. in the latter case, hibernate deletes the
      // entity entirely and creates a new one. this causes SQL constraint violations
      // because these service category ids are referenced in the selected complexity
      // level and desired outcomes tables.
      referral.selectedServiceCategories?.let {
        it.removeIf { true }
        it.addAll(updatedServiceCategories)
      } ?: run {
        referral.selectedServiceCategories = updatedServiceCategories.toMutableSet()
      }
    }
    return referralRepository.save(referral)
  }

  fun updateDraftReferralComplexityLevel(referral: Referral, serviceCategoryId: UUID, complexityLevelId: UUID): Referral {
    if (referral.selectedServiceCategories.isNullOrEmpty()) {
      throw ServerWebInputException("complexity level cannot be updated: no service categories selected for this referral")
    }

    if (!referral.selectedServiceCategories!!.map { it.id }.contains(serviceCategoryId)) {
      throw ServerWebInputException("complexity level cannot be updated: specified service category not selected for this referral")
    }

    val validComplexityLevelIds = serviceCategoryRepository.findByIdOrNull(serviceCategoryId)?.complexityLevels?.map { it.id }
      ?: throw ServerWebInputException("complexity level cannot be updated: specified service category not found")

    if (!validComplexityLevelIds.contains(complexityLevelId)) {
      throw ServerWebInputException("complexity level cannot be updated: complexity level not valid for this service category")
    }

    if (referral.complexityLevelIds == null) {
      referral.complexityLevelIds = mutableMapOf()
    }

    referral.complexityLevelIds!![serviceCategoryId] = complexityLevelId
    return referralRepository.save(referral)
  }

  fun updateDraftReferralDesiredOutcomes(referral: Referral, serviceCategoryId: UUID, desiredOutcomeIds: List<UUID>): Referral {
    if (desiredOutcomeIds.isEmpty()) {
      throw ServerWebInputException("desired outcomes cannot be empty")
    }

    if (referral.selectedServiceCategories.isNullOrEmpty()) {
      throw ServerWebInputException("desired outcomes cannot be updated: no service categories selected for this referral")
    }

    if (!referral.selectedServiceCategories!!.map { it.id }.contains(serviceCategoryId)) {
      throw ServerWebInputException("desired outcomes cannot be updated: specified service category not selected for this referral")
    }

    val validDesiredOutcomeIds = serviceCategoryRepository.findByIdOrNull(serviceCategoryId)?.desiredOutcomes?.map { it.id }
      ?: throw ServerWebInputException("desired outcomes cannot be updated: specified service category not found")

    if (!validDesiredOutcomeIds.containsAll(desiredOutcomeIds)) {
      throw ServerWebInputException("desired outcomes cannot be updated: at least one desired outcome is not valid for this service category")
    }

    if (referral.selectedDesiredOutcomes == null) {
      referral.selectedDesiredOutcomes = mutableListOf()
    }

    referral.selectedDesiredOutcomes!!.removeIf { desiredOutcome -> desiredOutcome.serviceCategoryId == serviceCategoryId }
    desiredOutcomeIds.forEach { desiredOutcomeId -> referral.selectedDesiredOutcomes!!.add(SelectedDesiredOutcomesMapping(serviceCategoryId, desiredOutcomeId)) }
    return referralRepository.save(referral)
  }

  fun getDraftReferralsForUser(user: AuthUser): List<Referral> {
    if (!userTypeChecker.isProbationPractitionerUser(user)) {
      throw AccessError(user, "user does not have access to referrals", listOf("only probation practitioners can access draft referrals"))
    }

    val referrals = referralRepository.findByCreatedByIdAndSentAtIsNull(user.id)
    return referralAccessFilter.probationPractitionerReferrals(referrals, user)
  }

  fun getCancellationReasons(): List<CancellationReason> {
    return cancellationReasonRepository.findAll()
  }

  private fun generateReferenceNumber(referral: Referral): String? {
    val type = referral.intervention.dynamicFrameworkContract.contractType.name

    for (i in 1..maxReferenceNumberTries) {
      val candidate = referenceGenerator.generate(type)
      if (!referralRepository.existsByReferenceNumber(candidate))
        return candidate
      else
        logger.warn("Clash found for referral number {}", kv("candidate", candidate))
    }

    logger.error("Unable to generate a referral number {} {}", kv("tries", maxReferenceNumberTries), kv("referral_id", referral.id))
    return null
  }

  fun getResponsibleProbationPractitioner(referral: Referral): ContactableProbationPractitioner {
    val responsibleOfficer = communityAPIOffenderService.getResponsibleOfficer(referral.serviceUserCRN)
    if (responsibleOfficer.email != null) {
      return ContactableProbationPractitioner(
        responsibleOfficer.firstName ?: "",
        responsibleOfficer.email,
      )
    }

    telemetryService.reportInvalidAssumption(
      "all responsible officers have email addresses",
      mapOf("staffId" to responsibleOfficer.staffId.toString())
    )

    logger.warn("no email address for responsible officer; falling back to referring probation practitioner")

    val referringProbationPractitioner = hmppsAuthService.getUserDetail(referral.sentBy ?: referral.createdBy)
    return ContactableProbationPractitioner(
      referringProbationPractitioner.firstName,
      referringProbationPractitioner.email
    )
  }
}
