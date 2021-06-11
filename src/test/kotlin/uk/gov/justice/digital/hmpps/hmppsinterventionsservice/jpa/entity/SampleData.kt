package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity

import com.microsoft.applicationinsights.boot.dependencies.apachecommons.lang3.RandomStringUtils
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.AuthUserFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.ServiceCategoryFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.ServiceProviderFactory
import java.time.LocalDate
import java.time.OffsetDateTime
import java.util.UUID

// this class contains sample data, as well as methods to persist the
class SampleData {
  companion object {
    // there are tonnes of related tables that need to exist to successfully persist an intervention,
    // this is a helper method that persists them all
    fun persistIntervention(em: TestEntityManager, intervention: Intervention): Intervention {
      intervention.dynamicFrameworkContract.contractType.serviceCategories.forEach {
        ServiceCategoryFactory(em).create(
          id = it.id,
          name = it.name,
          complexityLevels = it.complexityLevels,
          desiredOutcomes = it.desiredOutcomes,
          created = it.created,
        )
      }

      intervention.dynamicFrameworkContract.primeProvider.let {
        ServiceProviderFactory(em).create(
          id = it.id,
          name = it.name,
        )
      }

      em.persist(intervention.dynamicFrameworkContract.contractType)
      em.persist(intervention.dynamicFrameworkContract)
      return em.persistAndFlush(intervention)
    }

    fun persistReferral(em: TestEntityManager, referral: Referral): Referral {
      persistIntervention(em, referral.intervention)

      // we need to ensure any users associated with the referral have been created.
      // we can use the new-style factory class to do this; it looks a bit strange, but
      // the rest of this code will soon be refactored to make use of these factories
      // so it will all become neater and look more sensible.
      AuthUserFactory(em).create(
        referral.createdBy.id,
        referral.createdBy.authSource,
        referral.createdBy.userName
      )
      referral.sentBy?.let {
        AuthUserFactory(em).create(it.id, it.authSource, it.userName)
      }
      return em.persistAndFlush(referral)
    }

    fun sampleReferral(
      crn: String,
      serviceProviderName: String,
      id: UUID = UUID.randomUUID(),
      referenceNumber: String? = null,
      completionDeadline: LocalDate? = null,
      relevantSentenceId: Long? = null,
      createdAt: OffsetDateTime = OffsetDateTime.now(),
      createdBy: AuthUser = AuthUser("123456", "delius", "bernard.beaks"),
      sentAt: OffsetDateTime? = null,
      sentBy: AuthUser? = null,
      assignedTo: AuthUser? = null,
      assignedAt: OffsetDateTime = OffsetDateTime.now(),
      assignedBy: AuthUser? = null,
      actionPlan: ActionPlan? = null,
      endOfServiceReport: EndOfServiceReport? = null,
      concludedAt: OffsetDateTime? = null,
      intervention: Intervention = sampleIntervention(
        dynamicFrameworkContract = sampleContract(
          primeProvider = sampleServiceProvider(id = serviceProviderName, name = serviceProviderName),
        )
      ),
    ): Referral {
      return Referral(
        serviceUserCRN = crn,
        id = id,
        createdAt = createdAt,
        createdBy = createdBy,
        completionDeadline = completionDeadline,
        relevantSentenceId = relevantSentenceId,
        referenceNumber = referenceNumber,
        sentAt = sentAt,
        sentBy = sentBy,
        assignedTo = assignedTo,
        assignedAt = assignedAt,
        assignedBy = assignedBy,
        intervention = intervention,
        selectedServiceCategories = intervention.dynamicFrameworkContract.contractType.serviceCategories.toMutableSet(),
        actionPlan = actionPlan,
        endOfServiceReport = endOfServiceReport,
        concludedAt = concludedAt,
      )
    }

    fun sampleIntervention(
      title: String = "Accommodation Service",
      description: String = """Help find sheltered housing

        • Bulleted list
        • With indentation and unicode
      """,
      incomingReferralDistributionEmail: String = "acc-inbox@provider.example.com",
      dynamicFrameworkContract: DynamicFrameworkContract,
      id: UUID? = null,
      createdAt: OffsetDateTime? = null,
    ): Intervention {
      return Intervention(
        id = id ?: UUID.randomUUID(),
        createdAt = createdAt ?: OffsetDateTime.now(),
        title = title,
        description = description,
        incomingReferralDistributionEmail = incomingReferralDistributionEmail,
        dynamicFrameworkContract = dynamicFrameworkContract,
      )
    }

    fun sampleContract(
      id: UUID? = null,
      startDate: LocalDate = LocalDate.of(2020, 12, 1),
      endDate: LocalDate = LocalDate.of(2021, 12, 1),
      contractType: ContractType? = null,
      primeProvider: ServiceProvider,
      npsRegion: NPSRegion? = null,
      pccRegion: PCCRegion? = null,
      contractReference: String = RandomStringUtils.randomAlphanumeric(8),
    ): DynamicFrameworkContract {
      return DynamicFrameworkContract(
        id = id ?: UUID.randomUUID(),
        contractType = contractType ?: sampleContractType(),
        primeProvider = primeProvider,
        startDate = startDate,
        endDate = endDate,
        minimumAge = 18,
        maximumAge = null,
        allowsMale = true,
        allowsFemale = true,
        npsRegion = npsRegion,
        pccRegion = pccRegion,
        contractReference = contractReference,
      )
    }

    fun sampleContractType(
      id: UUID? = null,
      name: String? = null,
      code: String? = null,
      serviceCategories: Set<ServiceCategory>? = null
    ): ContractType {
      return ContractType(
        id = id ?: UUID.randomUUID(),
        name = name ?: "Accommodation",
        code = code ?: "ACC",
        serviceCategories = serviceCategories ?: setOf(sampleServiceCategory())
      )
    }

    fun sampleEndOfServiceReport(
      id: UUID? = null,
      referral: Referral,
      createdAt: OffsetDateTime = OffsetDateTime.now(),
      createdBy: AuthUser = AuthUser("CRN123", "auth", "user"),
      submittedAt: OffsetDateTime? = null,
      submittedBy: AuthUser? = null,
      furtherInformation: String? = null,
      outcomes: Set<EndOfServiceReportOutcome> = setOf(sampleEndOfServiceReportOutcome())
    ): EndOfServiceReport {
      return EndOfServiceReport(
        id = id ?: UUID.randomUUID(),
        referral = referral,
        createdAt = createdAt,
        createdBy = createdBy,
        submittedAt = submittedAt,
        submittedBy = submittedBy,
        furtherInformation = furtherInformation,
        outcomes = outcomes.toMutableSet()
      )
    }

    fun sampleEndOfServiceReportOutcome(
      desiredOutcome: DesiredOutcome? = null,
      achievementLevel: AchievementLevel = AchievementLevel.ACHIEVED,
      progressionComments: String? = null,
      additionalTaskComments: String? = null
    ): EndOfServiceReportOutcome {
      return EndOfServiceReportOutcome(
        desiredOutcome = desiredOutcome ?: sampleDesiredOutcome(),
        achievementLevel = achievementLevel,
        progressionComments = progressionComments,
        additionalTaskComments = additionalTaskComments,
      )
    }

    fun sampleActionPlan(
      id: UUID? = null,
      referral: Referral = sampleReferral("CRN123", "Service Provider"),
      numberOfSessions: Int? = 1,
      createdBy: AuthUser = AuthUser("CRN123", "auth", "user"),
      createdAt: OffsetDateTime = OffsetDateTime.now(),
      submittedBy: AuthUser? = null,
      submittedAt: OffsetDateTime? = null,
      desiredOutcome: DesiredOutcome = sampleDesiredOutcome(),
      activityCreatedAt: OffsetDateTime = OffsetDateTime.now(),
      activityId: UUID = UUID.randomUUID(),
      activities: List<ActionPlanActivity> = listOf(sampleActionPlanActivity(activityId, desiredOutcome, activityCreatedAt)),
    ): ActionPlan {
      return ActionPlan(
        id = id ?: UUID.randomUUID(),
        referral = referral,
        numberOfSessions = numberOfSessions,
        createdBy = createdBy,
        createdAt = createdAt,
        submittedBy = submittedBy,
        submittedAt = submittedAt,
        activities = activities.toMutableList()
      )
    }

    fun sampleActionPlanActivity(
      id: UUID = UUID.randomUUID(),
      desiredOutcome: DesiredOutcome,
      createdAt: OffsetDateTime = OffsetDateTime.now()
    ): ActionPlanActivity {
      return ActionPlanActivity(
        id = id,
        description = "Some text to describe activity",
        createdAt = createdAt,
        desiredOutcome = desiredOutcome
      )
    }

    fun sampleServiceProvider(
      id: AuthGroupID = "HARMONY_LIVING",
      name: String = "Harmony Living",
    ): ServiceProvider {
      return ServiceProvider(id, name)
    }

    fun sampleServiceCategory(
      desiredOutcomes: List<DesiredOutcome> = emptyList(),
      name: String = "Accommodation",
      id: UUID = UUID.randomUUID(),
      created: OffsetDateTime = OffsetDateTime.now(),
      complexityLevels: List<ComplexityLevel> = emptyList(),
    ): ServiceCategory {

      return ServiceCategory(
        name = name,
        id = id,
        created = created,
        complexityLevels = complexityLevels,
        desiredOutcomes = desiredOutcomes
      )
    }

    fun sampleNPSRegion(
      id: Char = 'G',
      name: String = "South West"
    ): NPSRegion {
      return NPSRegion(
        id = id,
        name = name
      )
    }

    fun samplePCCRegion(
      id: String = "avon-and-somerset",
      name: String = "Avon & Somerset",
      npsRegion: NPSRegion = sampleNPSRegion(),
    ): PCCRegion {
      return PCCRegion(
        id = id,
        name = name,
        npsRegion = npsRegion
      )
    }

    fun sampleDesiredOutcome(
      id: UUID = UUID.randomUUID(),
      description: String = "Outcome 1",
      serviceCategoryId: UUID = UUID.randomUUID()
    ): DesiredOutcome {
      return DesiredOutcome(id, description, serviceCategoryId)
    }

    fun sampleAuthUser(
      id: String = "CRN123",
      authSource: String = "auth",
      userName: String = "user"
    ): AuthUser {
      return AuthUser(id, authSource, userName)
    }

    fun sampleCancellationReason(
      id: String = "MIS",
      description: String = "Referral was made by mistake"
    ): CancellationReason {
      return CancellationReason(id, description)
    }

    fun persistPCCRegion(em: TestEntityManager, pccRegion: PCCRegion): PCCRegion {
      em.persist(pccRegion.npsRegion)
      return em.persistAndFlush(pccRegion)
    }
  }
}
