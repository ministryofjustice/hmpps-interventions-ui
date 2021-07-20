package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository

import com.microsoft.applicationinsights.boot.dependencies.apachecommons.lang3.RandomStringUtils
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.EndOfServiceReport
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Referral
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ReferralAssignment
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ServiceProviderSentReferralSummary
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.AuthUserFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.DynamicFrameworkContractFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.EndOfServiceReportFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.InterventionFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.ReferralFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.RepositoryTest
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.ServiceProviderFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.ServiceUserFactory
import java.time.Instant
import java.time.OffsetDateTime
import java.util.UUID
import javax.transaction.Transactional

@Transactional
@RepositoryTest
class ReferralRepositoryTest @Autowired constructor(
  val entityManager: TestEntityManager,
  val endOfServiceReportRepository: EndOfServiceReportRepository,
  val referralRepository: ReferralRepository,
  val interventionRepository: InterventionRepository,
  val authUserRepository: AuthUserRepository,
) {
  private val authUserFactory = AuthUserFactory(entityManager)
  private val referralFactory = ReferralFactory(entityManager)
  private val dynamicFrameworkContractFactory = DynamicFrameworkContractFactory(entityManager)
  private val interventionFactory = InterventionFactory(entityManager)
  private val serviceProviderFactory = ServiceProviderFactory(entityManager)
  private val serviceUserFactory = ServiceUserFactory(entityManager)
  private val endOfServiceReport = EndOfServiceReportFactory(entityManager)

  @Nested
  inner class ServiceProviderSelection {

    @Test
    fun `can obtain a single referral summary using prime provider`() {
      val referralWithPrimeSp = createReferral(true)
      val referralWithAnotherPrimeSp = createReferral(true)

      val serviceProviderSearchId = referralWithPrimeSp.intervention.dynamicFrameworkContract.primeProvider.id
      val summaries = referralRepository.referralSummaryForServiceProviders(listOf(serviceProviderSearchId))

      assertThat(summaries.size).isEqualTo(1)
      assertThat(contains(summaries, expectedSummary(referralWithPrimeSp)))
    }

    @Test
    fun `can obtain a single referral summary using subcontractor provider`() {
      val referralWithSubConSp = createReferral(false)
      val referralWithAnotherSubConSp = createReferral(false)

      val serviceProviderSearchId = referralWithSubConSp.intervention.dynamicFrameworkContract.subcontractorProviders.firstOrNull()!!.id
      val summaries = referralRepository.referralSummaryForServiceProviders(listOf(serviceProviderSearchId))

      assertThat(summaries.size).isEqualTo(1)
      assertThat(contains(summaries, expectedSummary(referralWithSubConSp)))
    }

    @Test
    fun `can obtain a multiple referral summaries as subcontractor and as prime provider`() {

      val referralWithPrimeSp = createReferral(true)
      val referralWithAnotherPrimeSp = createReferral(true)
      val referralWithSubConSp = createReferral(false)
      val referralWithAnotherSubConSp = createReferral(false)

      val serviceProviderSearchIds = listOf(
        referralWithPrimeSp.intervention.dynamicFrameworkContract.primeProvider.id,
        referralWithSubConSp.intervention.dynamicFrameworkContract.subcontractorProviders.firstOrNull()!!.id
      )
      val summaries = referralRepository.referralSummaryForServiceProviders(serviceProviderSearchIds)

      assertThat(summaries.size).isEqualTo(2)
      assertThat(contains(summaries, expectedSummary(referralWithPrimeSp)))
      assertThat(contains(summaries, expectedSummary(referralWithSubConSp)))
    }

    @Test
    fun `cannot obtain a single referral summary when provider doesn't match`() {

      val referralWithPrimeSp = createReferral(true)
      val referralWithSubConSp = createReferral(false)

      val summaries = referralRepository.referralSummaryForServiceProviders(listOf("NON_EXISTENT_SP"))

      assertThat(summaries.size).isEqualTo(0)
    }
  }

  @Nested
  inner class AssignedToReferralSelection {

    @Test
    fun `can determine assigned user when only one`() {
      val referralWithSingleAssignee = createReferral(true, 1)

      val serviceProviderSearchId = referralWithSingleAssignee.intervention.dynamicFrameworkContract.primeProvider.id
      val summaries = referralRepository.referralSummaryForServiceProviders(listOf(serviceProviderSearchId))

      assertThat(summaries.size).isEqualTo(1)
      assertThat(contains(summaries, expectedSummary(referralWithSingleAssignee)))
    }

    @Test
    fun `can determine latest assigned user when changed`() {
      val referralWithChangedAssignee = createReferral(true, 2)

      val serviceProviderSearchId = referralWithChangedAssignee.intervention.dynamicFrameworkContract.primeProvider.id
      val summaries = referralRepository.referralSummaryForServiceProviders(listOf(serviceProviderSearchId))

      assertThat(summaries.size).isEqualTo(1)
      assertThat(contains(summaries, expectedSummary(referralWithChangedAssignee)))
    }

    @Test
    fun `can obtain multiple referrals wih latest assigned`() {
      val referralWithChangedAssignee = createReferral(true, 2)
      val referralWithMultipleChangedAssignee = createReferral(true, 10)

      val serviceProviderSearchIds = listOf(
        referralWithChangedAssignee.intervention.dynamicFrameworkContract.primeProvider.id,
        referralWithMultipleChangedAssignee.intervention.dynamicFrameworkContract.primeProvider.id
      )
      val summaries = referralRepository.referralSummaryForServiceProviders(serviceProviderSearchIds)

      assertThat(summaries.size).isEqualTo(2)
      assertThat(contains(summaries, expectedSummary(referralWithChangedAssignee)))
      assertThat(contains(summaries, expectedSummary(referralWithMultipleChangedAssignee)))
      summaries.contains(expectedSummary(referralWithChangedAssignee))
    }

    @Test
    fun `will not exclude referral when not assigned`() {
      val referralWithNoAssignee = createReferral(true, 0)

      val serviceProviderSearchId = referralWithNoAssignee.intervention.dynamicFrameworkContract.primeProvider.id
      val summaries = referralRepository.referralSummaryForServiceProviders(listOf(serviceProviderSearchId))

      assertThat(summaries.size).isEqualTo(1)
      assertThat(summaries[0].assignedToUserName).isNull()
      assertThat(contains(summaries, expectedSummary(referralWithNoAssignee)))
    }
  }

  @Nested
  inner class StatusExclusion {

    @Test
    fun `will exclude cancelled referrals`() {
      val referral = createEndedReferral(
        true,
        endRequestedAt = OffsetDateTime.now(),
        concludedAt = OffsetDateTime.now(),
        eosR = null,
      )

      val serviceProviderSearchId = referral.intervention.dynamicFrameworkContract.primeProvider.id
      val summaries = referralRepository.referralSummaryForServiceProviders(listOf(serviceProviderSearchId))

      assertThat(summaries.size).isEqualTo(0)
    }

    @Test
    fun `can obtain those requested to be ended and not concluded`() {
      val referral = createEndedReferral(
        true,
        endRequestedAt = OffsetDateTime.now(),
        concludedAt = null,
        eosR = null,
      )

      val serviceProviderSearchId = referral.intervention.dynamicFrameworkContract.primeProvider.id
      val summaries = referralRepository.referralSummaryForServiceProviders(listOf(serviceProviderSearchId))

      assertThat(summaries.size).isEqualTo(1)
      assertThat(contains(summaries, expectedSummary(referral)))
    }

    @Test
    fun `can obtain prematurely or completely ended referral`() {
      val referral = createEndedReferral(
        true,
        endRequestedAt = null,
        concludedAt = OffsetDateTime.now(),
        eosR = endOfServiceReport.create(),
      )

      val serviceProviderSearchId = referral.intervention.dynamicFrameworkContract.primeProvider.id
      val summaries = referralRepository.referralSummaryForServiceProviders(listOf(serviceProviderSearchId))

      assertThat(summaries.size).isEqualTo(1)
      assertThat(contains(summaries, expectedSummary(referral)))
    }

    @Test
    fun `will exclude referral if draft`() {
      val referralWithNoAssignee = createDraftReferral(true)

      val serviceProviderSearchId = referralWithNoAssignee.intervention.dynamicFrameworkContract.primeProvider.id
      val summaries = referralRepository.referralSummaryForServiceProviders(listOf(serviceProviderSearchId))

      assertThat(summaries.size).isEqualTo(0)
    }
  }

  private fun createReferral(
    asPrime: Boolean,
    numberOfAssignedUsers: Int = 1
  ): Referral {

    val assignedUsers = mutableListOf<AuthUser>().apply {
      repeat(numberOfAssignedUsers) { this.add(element = authUserFactory.create(random(6), random(5), random(12))) }
    }

    val serviceProvider = serviceProviderFactory.create(random(13), random(14))
    val contract = when {
      asPrime -> dynamicFrameworkContractFactory.create(primeProvider = serviceProvider, contractReference = random(10))
      else -> dynamicFrameworkContractFactory.create(subcontractorProviders = setOf(serviceProvider), contractReference = random(10))
    }
    val intervention = interventionFactory.create(contract = contract)
    val referral = referralFactory.createSent(
      intervention = intervention,
      assignments = assignedUsers.map { ReferralAssignment(OffsetDateTime.now(), assignedBy = it, assignedTo = it) }
    )
    val serviceUser = serviceUserFactory.create(random(15), random(16), referral)

    return entityManager.refresh(referral)
  }

  private fun createEndedReferral(
    asPrime: Boolean,
    endRequestedAt: OffsetDateTime? = null,
    concludedAt: OffsetDateTime? = null,
    eosR: EndOfServiceReport? = null,
  ): Referral {

    val user = authUserFactory.create(random(6), random(5), random(12))
    val serviceProvider = serviceProviderFactory.create(random(13), random(14))
    val contract = when {
      asPrime -> dynamicFrameworkContractFactory.create(primeProvider = serviceProvider, contractReference = random(10))
      else -> dynamicFrameworkContractFactory.create(subcontractorProviders = setOf(serviceProvider), contractReference = random(10))
    }
    val intervention = interventionFactory.create(contract = contract)
    val referral = referralFactory.createEnded(
      intervention = intervention,
      assignments = listOf(ReferralAssignment(OffsetDateTime.now(), assignedBy = user, assignedTo = user)),
      endRequestedAt = endRequestedAt,
      concludedAt = concludedAt,
      endOfServiceReport = eosR
    )
    val serviceUser = serviceUserFactory.create(random(15), random(16), referral)

    return entityManager.refresh(referral)
  }

  private fun createDraftReferral(
    asPrime: Boolean
  ): Referral {

    val serviceProvider = serviceProviderFactory.create(random(13), random(14))
    val contract = when {
      asPrime -> dynamicFrameworkContractFactory.create(primeProvider = serviceProvider, contractReference = random(10))
      else -> dynamicFrameworkContractFactory.create(subcontractorProviders = setOf(serviceProvider), contractReference = random(10))
    }
    val intervention = interventionFactory.create(contract = contract)
    val referral = referralFactory.createDraft(intervention = intervention)
    val serviceUser = serviceUserFactory.create(random(15), random(16), referral)

    return entityManager.refresh(referral)
  }

  private fun random(length: Int): String {
    return RandomStringUtils.randomAlphabetic(length)
  }

  private fun contains(summaries: List<ServiceProviderSentReferralSummary>, summary: Summary): Boolean {
    return summaries.any {
      it.referralId == summary.referralId &&
        it.sentAt == summary.sentAt &&
        it.referenceNumber == summary.referenceNumber &&
        it.interventionTitle == summary.interventionTitle &&
        it.dynamicFrameWorkContractId == summary.dynamicFrameWorkContractId &&
        it.assignedToUserName == summary.assignedToUserName &&
        it.serviceUserFirstName == summary.serviceUserFirstName &&
        it.serviceUserLastName == summary.serviceUserLastName
    }
  }

  private fun expectedSummary(referral: Referral) =
    Summary(
      referral.id,
      referral.sentAt!!.toInstant(),
      referral.referenceNumber!!,
      referral.intervention.title,
      referral.intervention.dynamicFrameworkContract.contractReference,
      referral.currentAssignee?.id,
      referral.serviceUserData!!.firstName,
      referral.serviceUserData!!.lastName
    )
}

data class Summary(
  override val referralId: UUID,
  override val sentAt: Instant,
  override val referenceNumber: String,
  override val interventionTitle: String,
  override val dynamicFrameWorkContractId: String,
  override val assignedToUserName: String?,
  override val serviceUserFirstName: String?,
  override val serviceUserLastName: String?
) : ServiceProviderSentReferralSummary
