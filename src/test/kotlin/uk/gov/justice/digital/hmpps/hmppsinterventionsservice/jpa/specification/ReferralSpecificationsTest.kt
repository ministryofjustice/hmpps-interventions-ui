package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.specification

import org.assertj.core.api.Assertions
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ReferralAssignment
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ActionPlanRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.AppointmentRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.AuthUserRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.CancellationReasonRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.DynamicFrameworkContractRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.EndOfServiceReportRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.InterventionRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ReferralRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.SupplierAssessmentRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.AuthUserFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.DynamicFrameworkContractFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.EndOfServiceReportFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.InterventionFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.ReferralFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.RepositoryTest
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.ServiceProviderFactory
import java.time.OffsetDateTime

@RepositoryTest
class ReferralSpecificationsTest @Autowired constructor(
  val entityManager: TestEntityManager,
  val referralRepository: ReferralRepository,
  val authUserRepository: AuthUserRepository,
  val interventionRepository: InterventionRepository,
  val endOfServiceReportRepository: EndOfServiceReportRepository,
  val actionPlanRepository: ActionPlanRepository,
  val appointmentRepository: AppointmentRepository,
  val cancellationReasonRepository: CancellationReasonRepository,
  val supplierAssessmentRepository: SupplierAssessmentRepository,
  val dynamicFrameworkContractRepository: DynamicFrameworkContractRepository,
) {

  private val referralFactory = ReferralFactory(entityManager)
  private val authUserFactory = AuthUserFactory(entityManager)
  private val endOfServiceReportFactory = EndOfServiceReportFactory(entityManager)
  private val interventionFactory = InterventionFactory(entityManager)
  private val dynamicFrameworkContractFactory = DynamicFrameworkContractFactory(entityManager)
  private val serviceProviderFactory = ServiceProviderFactory(entityManager)

  @BeforeEach
  fun setup() {
    cancellationReasonRepository.deleteAll()
    appointmentRepository.deleteAll()
    actionPlanRepository.deleteAll()
    endOfServiceReportRepository.deleteAll()
    supplierAssessmentRepository.deleteAll()
    entityManager.flush()

    referralRepository.deleteAll()
    interventionRepository.deleteAll()
    dynamicFrameworkContractRepository.deleteAll()
    authUserRepository.deleteAll()
    entityManager.flush()
  }

  @Nested
  inner class sent {
    @Test
    fun `only sent referrals are returned`() {
      val sent = referralFactory.createSent()
      val draft = referralFactory.createDraft()
      val result = referralRepository.findAll(ReferralSpecifications.sent())
      Assertions.assertThat(result).containsExactly(sent)
      Assertions.assertThat(result).doesNotContain(draft)
    }
  }

  @Nested
  inner class concluded {
    @Test
    fun `only concluded referrals are returned`() {
      val sent = referralFactory.createSent()
      val cancelled = referralFactory.createEnded(endRequestedAt = OffsetDateTime.now(), concludedAt = OffsetDateTime.now(), endOfServiceReport = null)
      val completed = referralFactory.createEnded(endRequestedAt = OffsetDateTime.now(), concludedAt = OffsetDateTime.now())
      endOfServiceReportFactory.create(referral = completed)
      val result = referralRepository.findAll(ReferralSpecifications.concluded())
      Assertions.assertThat(result).containsExactlyInAnyOrder(completed, cancelled)
      Assertions.assertThat(result).doesNotContain(sent)
    }
  }

  @Nested
  inner class cancelled {
    @Test
    fun `only cancelled referrals are returned`() {
      val cancelled = referralFactory.createEnded(endRequestedAt = OffsetDateTime.now(), concludedAt = OffsetDateTime.now(), endOfServiceReport = null)
      val completed = referralFactory.createEnded(endRequestedAt = OffsetDateTime.now(), concludedAt = OffsetDateTime.now())
      endOfServiceReportFactory.create(referral = completed)
      val result = referralRepository.findAll(ReferralSpecifications.cancelled())
      Assertions.assertThat(result).containsExactly(cancelled)
      Assertions.assertThat(result).doesNotContain(completed)
    }
  }

  @Nested
  inner class withSPAccess {
    @Test
    fun `sp with no contracts should never return a referral`() {
      referralFactory.createSent()
      referralFactory.createAssigned()

      val result = referralRepository.findAll(ReferralSpecifications.withSPAccess(setOf()))
      Assertions.assertThat(result).isEmpty()
    }

    @Test
    fun `only referrals that are part of the contract set are returned`() {
      val spContract = dynamicFrameworkContractFactory.create(contractReference = "spContractRef")
      val spIntervention = interventionFactory.create(contract = spContract)
      val referralWithSpContract = referralFactory.createSent(intervention = spIntervention)

      val unrelatedSpContract = dynamicFrameworkContractFactory.create(contractReference = "unrelatedSpContractRef")

      val someOtherContract = dynamicFrameworkContractFactory.create(contractReference = "someOtherContractRef")
      val someOtherIntervention = interventionFactory.create(contract = someOtherContract)
      val someOtherReferral = referralFactory.createSent(intervention = someOtherIntervention)

      val result = referralRepository.findAll(ReferralSpecifications.withSPAccess(setOf(spContract, unrelatedSpContract)))
      Assertions.assertThat(result).containsExactly(referralWithSpContract)
      Assertions.assertThat(result).doesNotContain(someOtherReferral)
    }
  }

  @Nested
  inner class matchingPrimeProviderReferrals {
    @Test
    fun `only referrals with that are prime providers of the service providers are returned`() {
      val userServiceProvider_1 = serviceProviderFactory.create("userServiceProvider_1")
      val grantedReferral = referralFactory.createSent(
        intervention = interventionFactory.create(contract = dynamicFrameworkContractFactory.create(primeProvider = userServiceProvider_1))
      )
      val userServiceProvider_2 = serviceProviderFactory.create("userServiceProvider_2 ${1 + 1}")
      interventionFactory.create(contract = dynamicFrameworkContractFactory.create(primeProvider = userServiceProvider_2))

      val someOtherServiceProvider = serviceProviderFactory.create("someOtherServiceProvider")
      val restrictedReferral = referralFactory.createSent(
        intervention = interventionFactory.create(contract = dynamicFrameworkContractFactory.create(primeProvider = someOtherServiceProvider))
      )

      val result = referralRepository.findAll(ReferralSpecifications.matchingPrimeProviderReferrals(setOf(userServiceProvider_1, userServiceProvider_2)))
      Assertions.assertThat(result).containsExactly(grantedReferral)
      Assertions.assertThat(result).doesNotContain(restrictedReferral)
    }
  }

  @Nested
  inner class matchingSubContractorReferrals {
    @Test
    fun `only referrals with that are sub contractors of the service providers are returned`() {
      val userServiceProvider_1 = serviceProviderFactory.create("userServiceProvider_1")
      val userServiceProvider_2 = serviceProviderFactory.create("userServiceProvider_2")
      val someOtherServiceProvider = serviceProviderFactory.create("someOtherServiceProvider")

      val grantedReferral = referralFactory.createSent(
        intervention = interventionFactory.create(
          contract = dynamicFrameworkContractFactory.create(
            primeProvider = serviceProviderFactory.create("randomServiceProvider_1"),
            subcontractorProviders = setOf(
              userServiceProvider_1, someOtherServiceProvider
            )
          )
        )
      )

      val restrictedReferral = referralFactory.createSent(
        intervention = interventionFactory.create(
          contract = dynamicFrameworkContractFactory.create(
            primeProvider = serviceProviderFactory.create("randomServiceProvider_2"),
            subcontractorProviders = setOf(
              someOtherServiceProvider
            )
          )
        )
      )

      val result = referralRepository.findAll(ReferralSpecifications.matchingSubContractorReferrals(setOf(userServiceProvider_1, userServiceProvider_2)))
      Assertions.assertThat(result).containsExactly(grantedReferral)
      Assertions.assertThat(result).doesNotContain(restrictedReferral)
    }
  }

  @Nested
  inner class assignedTo {
    @Test
    fun `returns referral if user is currently assigned`() {
      val user = authUserFactory.create(id = "loggedInUser")
      val someOtherUser = authUserFactory.create(id = "someOtherUser")

      val assignments: List<ReferralAssignment> = listOf(
        ReferralAssignment(OffsetDateTime.now(), assignedBy = someOtherUser, assignedTo = user),
        ReferralAssignment(OffsetDateTime.now().minusDays(1), assignedBy = someOtherUser, assignedTo = someOtherUser),
      )

      val assignedReferral = referralFactory.createAssigned(assignments = assignments)

      val result = referralRepository.findAll(ReferralSpecifications.currentlyAssignedTo(user.id))
      Assertions.assertThat(result).containsExactly(assignedReferral)
    }

    @Test
    fun `does not return referral if user is previously assigned`() {
      val user = authUserFactory.create(id = "loggedInUser")
      val someOtherUser = authUserFactory.create(id = "someOtherUser")

      val assignments: List<ReferralAssignment> = listOf(
        ReferralAssignment(OffsetDateTime.now(), assignedBy = someOtherUser, assignedTo = someOtherUser),
        ReferralAssignment(OffsetDateTime.now().minusDays(1), assignedBy = someOtherUser, assignedTo = user),
      )

      referralFactory.createAssigned(assignments = assignments)
      val result = referralRepository.findAll(ReferralSpecifications.currentlyAssignedTo(user.id))
      Assertions.assertThat(result).isEmpty()
    }

    @Test
    fun `does not return referral if user has never been assigned`() {
      val user = authUserFactory.create(id = "loggedInUser")
      val someOtherUser = authUserFactory.create(id = "someOtherUser")

      val assignments: List<ReferralAssignment> = listOf(
        ReferralAssignment(OffsetDateTime.now(), assignedBy = someOtherUser, assignedTo = someOtherUser)
      )

      referralFactory.createAssigned(assignments = assignments)
      referralFactory.createAssigned(assignments = emptyList())

      val result = referralRepository.findAll(ReferralSpecifications.currentlyAssignedTo(user.id))
      Assertions.assertThat(result).isEmpty()
    }
  }
}
