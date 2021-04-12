package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.integration.pact

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.whenever
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ActionPlan
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ActionPlanActivity
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ActionPlanAppointment
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Attended
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthGroupID
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.DesiredOutcome
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Intervention
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Referral
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ServiceCategory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ServiceUserData
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ActionPlanAppointmentRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ActionPlanRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.AuthUserRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.DesiredOutcomeRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.DynamicFrameworkContractRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.InterventionRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.NPSRegionRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ReferralRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ServiceCategoryRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ServiceProviderRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.HMPPSAuthService
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.DynamicFrameworkContractFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.InterventionFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.ReferralFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.ServiceProviderFactory
import java.time.LocalDate
import java.time.OffsetDateTime
import java.util.Random
import java.util.UUID

// allows random selection of service category, region etc
val random = Random()
fun <T, U> Map<T, U>.random(): Map.Entry<T, U> = entries.elementAt(random.nextInt(size))
fun <T> Collection<T>.random(): T = elementAt(random.nextInt(size))

class SetupAssistant(
  private val authUserRepository: AuthUserRepository,
  private val referralRepository: ReferralRepository,
  private val interventionRepository: InterventionRepository,
  private val actionPlanRepository: ActionPlanRepository,
  private val actionPlanAppointmentRepository: ActionPlanAppointmentRepository,
  private val serviceCategoryRepository: ServiceCategoryRepository,
  private val serviceProviderRepository: ServiceProviderRepository,
  private val npsRegionRepository: NPSRegionRepository,
  private val dynamicFrameworkContractRepository: DynamicFrameworkContractRepository,
  private val desiredOutcomeRepository: DesiredOutcomeRepository,
  private val mockHMPPSAuthService: HMPPSAuthService,
) {
  private val dynamicFrameworkContractFactory = DynamicFrameworkContractFactory()
  private val interventionFactory = InterventionFactory()
  private val referralFactory = ReferralFactory()
  private val serviceProviderFactory = ServiceProviderFactory()

  private val serviceCategories = serviceCategoryRepository.findAll().associateBy { it.name }
  private val npsRegions = npsRegionRepository.findAll().associateBy { it.id }

  fun cleanAll() {
    // order of cleanup is important here to avoid breaking foreign key constraints
    actionPlanAppointmentRepository.deleteAll()
    actionPlanRepository.deleteAll()

    referralRepository.deleteAll()
    interventionRepository.deleteAll()
    dynamicFrameworkContractRepository.deleteAll()

    serviceProviderRepository.deleteAll()
    authUserRepository.deleteAll()
  }

  fun mockServiceProviderOrganization(organization: AuthGroupID) {
    whenever(mockHMPPSAuthService.getServiceProviderOrganizationForUser(any())).thenReturn(organization)
  }

  fun randomServiceCategory(): ServiceCategory {
    return serviceCategories.random().value
  }

  fun randomDesiredOutcome(): DesiredOutcome {
    return desiredOutcomeRepository.findAll().random()
  }

  fun desiredOutcomesForServiceCategory(serviceCategoryId: UUID): List<DesiredOutcome> {
    return desiredOutcomeRepository.findByServiceCategoryId(serviceCategoryId)
  }

  fun createPPUser(): AuthUser {
    val user = AuthUser("8751622134", "delius", "BERNARD.BEAKS")
    return authUserRepository.save(user)
  }

  fun createSPUser(): AuthUser {
    val user = AuthUser("608955ae-52ed-44cc-884c-011597a77949", "auth", "AUTH_USER")
    return authUserRepository.save(user)
  }

  fun createIntervention(id: UUID = UUID.randomUUID()): Intervention {
    val accommodationServiceCategory = serviceCategories["Accommodation"]!!
    val region = npsRegions['C']!!

    val serviceProvider = serviceProviderRepository.save(serviceProviderFactory.create())

    val contract = dynamicFrameworkContractRepository.save(
      dynamicFrameworkContractFactory.create(
        serviceCategory = accommodationServiceCategory,
        serviceProvider = serviceProvider,
        npsRegion = region,
      )
    )

    return interventionRepository.save(interventionFactory.create(id = id, contract = contract))
  }

  fun createDraftReferral(
    id: UUID = UUID.randomUUID(),
    intervention: Intervention = createIntervention(),
    createdBy: AuthUser = createPPUser(),
    createdAt: OffsetDateTime = OffsetDateTime.now(),
    serviceUserCRN: String = "X123456",
  ): Referral {
    return referralRepository.save(
      referralFactory.createDraft(
        id = id,
        intervention = intervention,
        createdAt = createdAt,
        createdBy = createdBy,
        serviceUserCRN = serviceUserCRN,
      )
    )
  }

  fun createSentReferral(id: UUID = UUID.randomUUID(), intervention: Intervention = createIntervention()): Referral {
    val user = createPPUser()
    return referralRepository.save(referralFactory.createSent(id = id, intervention = intervention, createdBy = user, sentBy = user))
  }

  fun createAssignedReferral(id: UUID = UUID.randomUUID(), intervention: Intervention? = null): Referral {
    val intervention = intervention ?: createIntervention()
    val ppUser = createPPUser()
    val spUser = createSPUser()
    return referralRepository.save(
      referralFactory.createSent(
        id = id, intervention = intervention, createdBy = ppUser, sentBy = ppUser,
        assignedTo = spUser, assignedBy = spUser, assignedAt = OffsetDateTime.now()
      )
    )
  }

  fun createActionPlan(
    referral: Referral = createSentReferral(),
    id: UUID = UUID.randomUUID(),
    numberOfSessions: Int? = null,
    activities: MutableList<ActionPlanActivity> = mutableListOf(),
    createdAt: OffsetDateTime = OffsetDateTime.now(),
    createdBy: AuthUser = createSPUser(),
    submittedAt: OffsetDateTime? = null,
    submittedBy: AuthUser? = null
  ): ActionPlan {
    return actionPlanRepository.save(
      ActionPlan(
        id = id,
        createdAt = createdAt,
        createdBy = createdBy,
        referral = referral,
        activities = activities,
        numberOfSessions = numberOfSessions,
        submittedAt = submittedAt,
        submittedBy = submittedBy,
      )
    )
  }

  fun createActionPlanAppointment(
    actionPlan: ActionPlan,
    sessionNumber: Int,
    duration: Int,
    appointmentTime: OffsetDateTime,
    attended: Attended? = null,
    attendanceInfo: String? = null,
    behaviour: String? = null,
    notifyPPOfBehaviour: Boolean? = null
  ): ActionPlanAppointment {
    val now = OffsetDateTime.now()
    val user = createSPUser()
    return actionPlanAppointmentRepository.save(
      ActionPlanAppointment(
        id = UUID.randomUUID(),
        sessionNumber = sessionNumber,
        attended = attended,
        additionalAttendanceInformation = attendanceInfo,
        attendanceSubmittedAt = now,
        attendanceBehaviour = behaviour,
        attendanceBehaviourSubmittedAt = now,
        notifyPPOfAttendanceBehaviour = notifyPPOfBehaviour,
        appointmentTime = appointmentTime,
        durationInMinutes = duration,
        createdBy = user,
        createdAt = now,
        actionPlan = actionPlan,
      )
    )
  }

  fun fillReferralFields(
    referral: Referral,
    desiredOutcomes: List<DesiredOutcome> = emptyList(),
    serviceUserData: ServiceUserData = ServiceUserData(
      referral = referral,
      title = "Mr",
      firstName = "Alex",
      lastName = "River",
      dateOfBirth = LocalDate.of(1980, 1, 1),
      gender = "Male",
      preferredLanguage = "English",
      ethnicity = "British",
      religionOrBelief = "Agnostic",
      disabilities = listOf("Autism spectrum condition"),
    ),
    accessibilityNeeds: String = "She uses a wheelchair",
    additionalNeedsInformation: String = "Alex is currently sleeping on her aunt's sofa",
    additionalRiskInformation: String = "A danger to the elderly",
    completionDeadline: LocalDate = LocalDate.of(2021, 4, 1),
    complexityLevelId: UUID = UUID.fromString("c86be5ec-31fa-4dfa-8c0c-8fe13451b9f6"),
    furtherInformation: String = "Some information about the service user",
    hasAdditionalResponsibilities: Boolean = true,
    interpreterLanguage: String = "Spanish",
    maximumRarDays: Int = 10,
    needsInterpreter: Boolean = true,
    relevantSentenceId: Long = 2600295124,
    usingRarDays: Boolean = true,
    whenUnavailable: String = "She works Mondays 9am - midday",
  ): Referral {
    referral.serviceUserData = serviceUserData
    referral.desiredOutcomesIDs = desiredOutcomes.map { it.id }
    referral.accessibilityNeeds = accessibilityNeeds
    referral.additionalNeedsInformation = additionalNeedsInformation
    referral.additionalRiskInformation = additionalRiskInformation
    referral.completionDeadline = completionDeadline
    referral.complexityLevelID = complexityLevelId
    referral.furtherInformation = furtherInformation
    referral.hasAdditionalResponsibilities = hasAdditionalResponsibilities
    referral.interpreterLanguage = interpreterLanguage
    referral.maximumRarDays = maximumRarDays
    referral.needsInterpreter = needsInterpreter
    referral.relevantSentenceId = relevantSentenceId
    referral.usingRarDays = usingRarDays
    referral.whenUnavailable = whenUnavailable

    return referralRepository.save(referral)
  }
}
