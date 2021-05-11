package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.DynamicFrameworkContractFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.RepositoryTest
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.ServiceProviderFactory

@RepositoryTest
class DynamicFrameworkContractRepositoryTest @Autowired constructor(
  val entityManager: TestEntityManager,
  val actionPlanRepository: ActionPlanRepository,
  val actionPlanAppointmentRepository: ActionPlanAppointmentRepository,
  val interventionRepository: InterventionRepository,
  val referralRepository: ReferralRepository,
  val authUserRepository: AuthUserRepository,
  val endOfServiceReportRepository: EndOfServiceReportRepository,
  val dynamicFrameworkContractRepository: DynamicFrameworkContractRepository,
) {
  private val dynamicFrameworkContractFactory = DynamicFrameworkContractFactory(entityManager)
  private val serviceProviderFactory = ServiceProviderFactory(entityManager)

  @BeforeEach
  fun setup() {
    actionPlanAppointmentRepository.deleteAll()
    actionPlanRepository.deleteAll()
    endOfServiceReportRepository.deleteAll()
    referralRepository.deleteAll()
    interventionRepository.deleteAll()
    authUserRepository.deleteAll()
  }

  @Test
  fun `can store and retrieve a contract with a subcontractor`() {
    val serviceProvider = serviceProviderFactory.create()
    val contract = dynamicFrameworkContractFactory.create(subcontractor = setOf(serviceProvider))

    val savedContract = dynamicFrameworkContractRepository.findById(contract.id).get()
    assertThat(savedContract.id).isEqualTo(contract.id)
    assertThat(savedContract.subContractors.size).isEqualTo(1)
  }
}
