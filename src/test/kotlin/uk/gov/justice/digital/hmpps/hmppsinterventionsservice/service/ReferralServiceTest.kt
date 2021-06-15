package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.spy
import com.nhaarman.mockitokotlin2.verify
import com.nhaarman.mockitokotlin2.whenever
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertDoesNotThrow
import org.junit.jupiter.api.assertThrows
import org.mockito.AdditionalAnswers
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken
import org.springframework.web.reactive.function.client.WebClientResponseException
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.authorization.ReferralAccessChecker
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.authorization.ReferralAccessFilter
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.authorization.ServiceProviderAccessScope
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.authorization.ServiceProviderAccessScopeMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.authorization.ServiceUserAccessChecker
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.authorization.UserTypeChecker
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.config.ValidationError
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.DraftReferralDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ReferralEventPublisher
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.DesiredOutcome
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Intervention
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Referral
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.SampleData
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ActionPlanRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ActionPlanSessionRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.AuthUserRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.CancellationReasonRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.EndOfServiceReportRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.InterventionRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ReferralRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ServiceCategoryRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.AuthUserFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.ContractTypeFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.DynamicFrameworkContractFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.InterventionFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.ReferralFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.RepositoryTest
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.ServiceCategoryFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.ServiceProviderFactory
import java.time.LocalDate
import java.time.LocalTime
import java.time.OffsetDateTime
import java.time.ZoneOffset
import java.util.UUID

@RepositoryTest
class ReferralServiceTest @Autowired constructor(
  val entityManager: TestEntityManager,
  val referralRepository: ReferralRepository,
  val authUserRepository: AuthUserRepository,
  val interventionRepository: InterventionRepository,
  val cancellationReasonRepository: CancellationReasonRepository,
  val actionPlanSessionRepository: ActionPlanSessionRepository,
  val actionPlanRepository: ActionPlanRepository,
  val endOfServiceReportRepository: EndOfServiceReportRepository,
  val serviceCategoryRepository: ServiceCategoryRepository,
) {

  private val userFactory = AuthUserFactory(entityManager)
  private val interventionFactory = InterventionFactory(entityManager)
  private val contractFactory = DynamicFrameworkContractFactory(entityManager)
  private val serviceProviderFactory = ServiceProviderFactory(entityManager)
  private val referralFactory = ReferralFactory(entityManager)
  private val serviceCategoryFactory = ServiceCategoryFactory(entityManager)
  private val contractTypeFactory = ContractTypeFactory(entityManager)
  private val dynamicFrameworkContractFactory = DynamicFrameworkContractFactory(entityManager)

  private val referralEventPublisher: ReferralEventPublisher = mock()
  private val referenceGenerator: ReferralReferenceGenerator = spy(ReferralReferenceGenerator())
  private val referralConcluder: ReferralConcluder = mock()
  private val referralAccessChecker: ReferralAccessChecker = mock()
  private val userTypeChecker = UserTypeChecker()
  private val serviceProviderAccessScopeMapper: ServiceProviderAccessScopeMapper = mock()
  private val referralAccessFilter: ReferralAccessFilter = mock()
  private val communityAPIReferralService: CommunityAPIReferralService = mock()
  private val serviceUserAccessChecker: ServiceUserAccessChecker = mock()
  private val authentication: JwtAuthenticationToken = mock()
  private val assessRisksAndNeedsService: RisksAndNeedsService = mock()
  private val communityAPIOffenderService: CommunityAPIOffenderService = mock()

  private val referralService = ReferralService(
    referralRepository,
    authUserRepository,
    interventionRepository,
    referralConcluder,
    referralEventPublisher,
    referenceGenerator,
    cancellationReasonRepository,
    actionPlanSessionRepository,
    serviceCategoryRepository,
    referralAccessChecker,
    userTypeChecker,
    serviceProviderAccessScopeMapper,
    referralAccessFilter,
    communityAPIReferralService,
    serviceUserAccessChecker,
    assessRisksAndNeedsService,
    communityAPIOffenderService,
  )

  // reset before each test
  private lateinit var sampleReferral: Referral
  private lateinit var sampleIntervention: Intervention
  private lateinit var sampleCohortIntervention: Intervention

  @BeforeEach
  fun beforeEach() {
    sampleReferral = SampleData.persistReferral(
      entityManager,
      SampleData.sampleReferral("X123456", "Harmony Living")
    )
    sampleIntervention = sampleReferral.intervention

    sampleCohortIntervention = SampleData.persistIntervention(
      entityManager,
      SampleData.sampleIntervention(
        dynamicFrameworkContract = SampleData.sampleContract(
          primeProvider = sampleReferral.intervention.dynamicFrameworkContract.primeProvider,
          contractType = SampleData.sampleContractType(
            name = "Personal Wellbeing",
            code = "PWB",
            serviceCategories = mutableSetOf(
              SampleData.sampleServiceCategory(),
              SampleData.sampleServiceCategory(name = "Social inclusion")
            )
          )
        )
      )
    )
  }

  @Test
  fun `update cannot overwrite identifier fields`() {
    val draftReferral = DraftReferralDTO(
      id = UUID.fromString("ce364949-7301-497b-894d-130f34a98bff"),
      createdAt = OffsetDateTime.of(LocalDate.of(2020, 12, 1), LocalTime.MIN, ZoneOffset.UTC)
    )

    val updated = referralService.updateDraftReferral(sampleReferral, draftReferral)
    assertThat(updated.id).isEqualTo(sampleReferral.id)
    assertThat(updated.createdAt).isEqualTo(sampleReferral.createdAt)
  }

  @Test
  fun `null fields in the update do not overwrite original fields`() {
    sampleReferral.completionDeadline = LocalDate.of(2021, 6, 26)
    entityManager.persistAndFlush(sampleReferral)

    val draftReferral = DraftReferralDTO(completionDeadline = null)

    val updated = referralService.updateDraftReferral(sampleReferral, draftReferral)
    assertThat(updated.completionDeadline).isEqualTo(LocalDate.of(2021, 6, 26))
  }

  @Test
  fun `non-null fields in the update overwrite original fields`() {
    sampleReferral.completionDeadline = LocalDate.of(2021, 6, 26)
    entityManager.persistAndFlush(sampleReferral)

    val today = LocalDate.now()
    val draftReferral = DraftReferralDTO(completionDeadline = today)

    val updated = referralService.updateDraftReferral(sampleReferral, draftReferral)
    assertThat(updated.completionDeadline).isEqualTo(today)
  }

  @Test
  fun `update mutates the original object`() {
    sampleReferral.completionDeadline = LocalDate.of(2021, 6, 26)
    entityManager.persistAndFlush(sampleReferral)

    val today = LocalDate.now()
    val draftReferral = DraftReferralDTO(completionDeadline = today)

    val updated = referralService.updateDraftReferral(sampleReferral, draftReferral)
    assertThat(updated.completionDeadline).isEqualTo(today)
  }

  @Test
  fun `update successfully persists the updated draft referral`() {
    sampleReferral.completionDeadline = LocalDate.of(2021, 6, 26)
    entityManager.persistAndFlush(sampleReferral)

    val today = LocalDate.now()
    val draftReferral = DraftReferralDTO(completionDeadline = today)
    referralService.updateDraftReferral(sampleReferral, draftReferral)
    val savedDraftReferral = referralService.getDraftReferralForUser(sampleReferral.id, userFactory.create())
    assertThat(savedDraftReferral!!.id).isEqualTo(sampleReferral.id)
    assertThat(savedDraftReferral.createdAt).isEqualTo(sampleReferral.createdAt)
    assertThat(savedDraftReferral.completionDeadline).isEqualTo(draftReferral.completionDeadline)
  }

  @Test
  fun `create and persist non-cohort draft referral`() {
    val authUser = AuthUser("user_id", "delius", "user_name")
    val draftReferral = referralService.createDraftReferral(authUser, "X123456", sampleIntervention.id)
    entityManager.flush()

    val savedDraftReferral = referralService.getDraftReferralForUser(draftReferral.id, authUser)
    assertThat(savedDraftReferral!!.id).isNotNull
    assertThat(savedDraftReferral.createdAt).isNotNull
    assertThat(savedDraftReferral.createdBy).isEqualTo(authUser)
    assertThat(savedDraftReferral.serviceUserCRN).isEqualTo("X123456")
    assertThat(savedDraftReferral.selectedServiceCategories).hasSize(1)
    assertThat(savedDraftReferral.selectedServiceCategories!!.elementAt(0).id).isEqualTo(sampleIntervention.dynamicFrameworkContract.contractType.serviceCategories.elementAt(0).id)
  }

  @Test
  fun `create and persist cohort draft referral`() {
    val authUser = AuthUser("user_id", "delius", "user_name")
    val draftReferral = referralService.createDraftReferral(authUser, "X123456", sampleCohortIntervention.id)
    entityManager.flush()

    val savedDraftReferral = referralService.getDraftReferralForUser(draftReferral.id, authUser)
    assertThat(savedDraftReferral!!.id).isNotNull
    assertThat(savedDraftReferral.createdAt).isNotNull
    assertThat(savedDraftReferral.createdBy).isEqualTo(authUser)
    assertThat(savedDraftReferral.serviceUserCRN).isEqualTo("X123456")
    assertThat(savedDraftReferral.selectedServiceCategories).isNull()
  }

  @Test
  fun `get a draft referral`() {
    sampleReferral.completionDeadline = LocalDate.of(2021, 6, 26)
    entityManager.persistAndFlush(sampleReferral)

    val savedDraftReferral = referralService.getDraftReferralForUser(sampleReferral.id, userFactory.create())
    assertThat(savedDraftReferral!!.id).isEqualTo(sampleReferral.id)
    assertThat(savedDraftReferral.createdAt).isEqualTo(sampleReferral.createdAt)
    assertThat(savedDraftReferral.completionDeadline).isEqualTo(sampleReferral.completionDeadline)
  }

  @Test
  fun `find by userID returns list of draft referrals`() {
    val user1 = AuthUser("123", "delius", "bernie.b")
    val user2 = AuthUser("456", "delius", "sheila.h")
    val user3 = AuthUser("789", "delius", "tom.myers")
    referralService.createDraftReferral(user1, "X123456", sampleIntervention.id)
    referralService.createDraftReferral(user1, "X123456", sampleIntervention.id)
    referralService.createDraftReferral(user2, "X123456", sampleIntervention.id)
    entityManager.flush()

    whenever(referralAccessFilter.probationPractitionerReferrals(any(), any())).then(AdditionalAnswers.returnsFirstArg<List<Referral>>())

    val single = referralService.getDraftReferralsForUser(user2)
    assertThat(single).hasSize(1)

    val multiple = referralService.getDraftReferralsForUser(user1)
    assertThat(multiple).hasSize(2)

    val none = referralService.getDraftReferralsForUser(user3)
    assertThat(none).hasSize(0)
  }

  @Test
  fun `completion date must be in the future`() {
    val update = DraftReferralDTO(completionDeadline = LocalDate.of(2020, 1, 1))
    val error = assertThrows<ValidationError> {
      referralService.updateDraftReferral(sampleReferral, update)
    }
    assertThat(error.errors.size).isEqualTo(1)
    assertThat(error.errors[0].field).isEqualTo("completionDeadline")
  }

  @Test
  fun `when needsInterpreter is true, interpreterLanguage must be set`() {
    // this is fine
    referralService.updateDraftReferral(sampleReferral, DraftReferralDTO(needsInterpreter = false))

    val error = assertThrows<ValidationError> {
      // this throws ValidationError
      referralService.updateDraftReferral(sampleReferral, DraftReferralDTO(needsInterpreter = true))
    }
    assertThat(error.errors.size).isEqualTo(1)
    assertThat(error.errors[0].field).isEqualTo("needsInterpreter")

    // this is also fine
    referralService.updateDraftReferral(sampleReferral, DraftReferralDTO(needsInterpreter = true, interpreterLanguage = "German"))
  }

  @Test
  fun `when hasAdditionalResponsibilities is true, whenUnavailable must be set`() {
    // this is fine
    referralService.updateDraftReferral(sampleReferral, DraftReferralDTO(hasAdditionalResponsibilities = false))

    val error = assertThrows<ValidationError> {
      // this throws ValidationError
      referralService.updateDraftReferral(sampleReferral, DraftReferralDTO(hasAdditionalResponsibilities = true))
    }
    assertThat(error.errors.size).isEqualTo(1)
    assertThat(error.errors[0].field).isEqualTo("hasAdditionalResponsibilities")

    // this is also fine
    referralService.updateDraftReferral(sampleReferral, DraftReferralDTO(hasAdditionalResponsibilities = true, whenUnavailable = "wednesdays"))
  }

  @Test
  fun `multiple errors at once`() {
    val update = DraftReferralDTO(completionDeadline = LocalDate.of(2020, 1, 1), needsInterpreter = true)
    val error = assertThrows<ValidationError> {
      referralService.updateDraftReferral(sampleReferral, update)
    }
    assertThat(error.errors.size).isEqualTo(2)
  }

  @Test
  fun `the referral isn't actually updated if any of the fields contain validation errors`() {
    // any invalid fields should mean that no fields are written to the db
    val update = DraftReferralDTO(
      // valid field
      additionalNeedsInformation = "requires wheelchair access",
      // invalid field
      completionDeadline = LocalDate.of(2020, 1, 1),
    )
    val error = assertThrows<ValidationError> {
      referralService.updateDraftReferral(sampleReferral, update)
    }

    entityManager.flush()
    assertThat(referralService.getDraftReferralForUser(sampleReferral.id, userFactory.create())!!.additionalNeedsInformation).isNull()
  }

  @Test
  fun `once a draft referral is sent it's id is no longer is a valid draft referral`() {
    val user = AuthUser("user_id", "delius", "user_name")
    val draftReferral = referralService.createDraftReferral(user, "X123456", sampleIntervention.id)
    draftReferral.additionalRiskInformation = "risk"

    assertThat(referralService.getDraftReferralForUser(draftReferral.id, user)).isNotNull()

    val sentReferral = referralService.sendDraftReferral(draftReferral, user)

    assertThat(referralService.getDraftReferralForUser(draftReferral.id, user)).isNull()
    assertThat(referralService.getSentReferralForUser(draftReferral.id, user)).isNotNull()
  }

  @Test
  fun `sending a draft referral generates a referral reference number`() {
    val user = AuthUser("user_id", "delius", "user_name")
    val draftReferral = referralService.createDraftReferral(user, "X123456", sampleIntervention.id)
    draftReferral.additionalRiskInformation = "risk"

    assertThat(draftReferral.referenceNumber).isNull()

    val sentReferral = referralService.sendDraftReferral(draftReferral, user)
    assertThat(sentReferral.referenceNumber).isNotNull()
  }

  @Test
  fun `sending a draft referral generates a unique reference, even if the previous reference already exists`() {
    val user = AuthUser("user_id", "delius", "user_name")
    val draft1 = referralService.createDraftReferral(user, "X123456", sampleIntervention.id)
    val draft2 = referralService.createDraftReferral(user, "X123456", sampleIntervention.id)
    draft1.additionalRiskInformation = "risk"
    draft2.additionalRiskInformation = "risk"

    whenever(referenceGenerator.generate(sampleIntervention.dynamicFrameworkContract.contractType.name))
      .thenReturn("AA0000ZZ", "AA0000ZZ", "AA0000ZZ", "AA0000ZZ", "BB0000ZZ")

    val sent1 = referralService.sendDraftReferral(draft1, user)
    assertThat(sent1.referenceNumber).isEqualTo("AA0000ZZ")

    val sent2 = referralService.sendDraftReferral(draft2, user)
    assertThat(sent2.referenceNumber).isNotEqualTo("AA0000ZZ").isEqualTo("BB0000ZZ")
  }

  @Test
  fun `sending a draft referral triggers an event`() {
    val user = AuthUser("user_id", "delius", "user_name")
    val draftReferral = referralService.createDraftReferral(user, "X123456", sampleIntervention.id)
    draftReferral.additionalRiskInformation = "risk"

    referralService.sendDraftReferral(draftReferral, user)
    verify(communityAPIReferralService).send(draftReferral)
    verify(referralEventPublisher).referralSentEvent(draftReferral)
  }

  @Test
  fun `multiple draft referrals can be started by the same user`() {
    val user = AuthUser("multi_user_id", "delius", "user_name")
    whenever(referralAccessFilter.probationPractitionerReferrals(any(), any())).then(AdditionalAnswers.returnsFirstArg<List<Referral>>())

    for (i in 1..3) {
      assertDoesNotThrow { referralService.createDraftReferral(user, "X123456", sampleIntervention.id) }
    }
    assertThat(referralService.getDraftReferralsForUser(user)).hasSize(3)
  }

  @Test
  fun `get sent referrals for PP returns filtered referrals`() {
    val users = listOf(userFactory.create("pp_user_1", "delius"), userFactory.create("pp_user_2", "delius"))
    users.forEach {
      referralFactory.createSent(createdBy = it)
    }

    // this one should not be part of the result set - only referrals created by the pp!
    referralFactory.createSent(sentBy = users[0])

    whenever(referralAccessFilter.probationPractitionerReferrals(any(), any())).then(AdditionalAnswers.returnsFirstArg<List<Referral>>())

    val referrals = referralService.getSentReferralsForUser(users[0])
    assertThat(referrals.size).isEqualTo(1)
    assertThat(referrals[0].createdBy).isEqualTo(users[0])

    assertThat(referralService.getSentReferralsForUser(AuthUser("missing", "delius", "missing"))).isEmpty()
  }

  @Test
  fun `get sent referrals for PP handles errors from community-api`() {
    val user = userFactory.create("pp_user_1", "delius")
    referralFactory.createSent(createdBy = user)

    whenever(communityAPIOffenderService.getManagedOffendersForDeliusUser(user)).thenThrow(WebClientResponseException::class.java)
    whenever(referralAccessFilter.probationPractitionerReferrals(any(), any())).then(AdditionalAnswers.returnsFirstArg<List<Referral>>())

    val referrals = referralService.getSentReferralsForUser(user)
    assertThat(referrals.size).isEqualTo(1)
  }

  @Test
  fun `get sent referrals for PP includes referrals for managed offenders`() {
    val user = userFactory.create("pp_user_1", "delius")
    referralFactory.createSent(serviceUserCRN = "CRN129876234")

    whenever(communityAPIOffenderService.getManagedOffendersForDeliusUser(user)).thenReturn(listOf(Offender("CRN129876234")))
    whenever(referralAccessFilter.probationPractitionerReferrals(any(), any())).then(AdditionalAnswers.returnsFirstArg<List<Referral>>())

    val referrals = referralService.getSentReferralsForUser(user)
    assertThat(referrals.size).isEqualTo(1)
    assertThat(referrals[0].serviceUserCRN).isEqualTo("CRN129876234")
  }

  @Test
  fun `get sent referrals for prime provider returns filtered referrals`() {
    // setup 2 users and 2 providers with a contract and referral for each provider
    val users = listOf(userFactory.create("sp_user_1", "auth"), userFactory.create("sp_user_2", "auth"))
    val spOrgs = listOf(serviceProviderFactory.create("sp_org_1"), serviceProviderFactory.create("sp_org_2"))
    spOrgs.forEach {
      val intervention = interventionFactory.create(
        contract = contractFactory.create(
          primeProvider = it
        )
      )
      referralFactory.createSent(intervention = intervention)
    }

    // the first user works for the first provider
    whenever(serviceProviderAccessScopeMapper.fromUser(users[0])).thenReturn(ServiceProviderAccessScope(spOrgs[0], listOf()))
    // the second user works for a different provider entirely
    whenever(serviceProviderAccessScopeMapper.fromUser(users[1])).thenReturn(
      ServiceProviderAccessScope(serviceProviderFactory.create("missing"), listOf())
    )
    // no access restrictions for the purpose of this test
    whenever(referralAccessFilter.serviceProviderReferrals(any(), any())).then(AdditionalAnswers.returnsFirstArg<List<Referral>>())

    // the first user sees referrals for their provider
    val referrals = referralService.getSentReferralsForUser(users[0])
    assertThat(referrals.size).isEqualTo(1)
    assertThat(referrals[0].intervention.dynamicFrameworkContract.primeProvider).isEqualTo(spOrgs[0])

    // the second user doesn't see any referrals (because there aren't any for their provider)
    assertThat(referralService.getSentReferralsForUser(users[1])).isEmpty()
  }

  @Test
  fun `get sent referrals for subcontractor provider returns filtered referrals`() {
    // setup 2 users and 2 subcontractor providers with a contract and referral for each provider
    val users = listOf(userFactory.create("sp_user_1", "auth"), userFactory.create("sp_user_2", "auth"))
    val spPrimeOrg = serviceProviderFactory.create("prime_org")
    val spSubOrgs = listOf(serviceProviderFactory.create("sub_org_1"), serviceProviderFactory.create("sub_org_2"))
    spSubOrgs.forEach {
      val intervention = interventionFactory.create(
        contract = contractFactory.create(
          primeProvider = spPrimeOrg,
          subcontractorProviders = setOf(it)
        )
      )
      referralFactory.createSent(intervention = intervention)
    }

    // the first user works for the first provider
    whenever(serviceProviderAccessScopeMapper.fromUser(users[0])).thenReturn(ServiceProviderAccessScope(spSubOrgs[0], listOf()))
    // the second user works for a different provider entirely
    whenever(serviceProviderAccessScopeMapper.fromUser(users[1])).thenReturn(
      ServiceProviderAccessScope(serviceProviderFactory.create("missing"), listOf())
    )
    // no access restrictions for the purpose of this test
    whenever(referralAccessFilter.serviceProviderReferrals(any(), any())).then(AdditionalAnswers.returnsFirstArg<List<Referral>>())

    // the first user sees referrals for their provider
    val referrals = referralService.getSentReferralsForUser(users[0])
    assertThat(referrals.size).isEqualTo(1)
    assertThat(referrals[0].intervention.dynamicFrameworkContract.subcontractorProviders).contains(spSubOrgs[0])

    // the second user doesn't see any referrals (because there aren't any for their provider)
    assertThat(referralService.getSentReferralsForUser(users[1])).isEmpty()
  }

  @Test
  fun `ensure that desired outcomes are actually removed via orphan removal`() {

    val serviceCategoryId1 = UUID.randomUUID()
    val serviceCategoryId2 = UUID.randomUUID()
    val desiredOutcome1 = DesiredOutcome(UUID.randomUUID(), "title", serviceCategoryId = serviceCategoryId1)
    val desiredOutcome2 = DesiredOutcome(UUID.randomUUID(), "title", serviceCategoryId = serviceCategoryId2)
    val serviceCategory1 = serviceCategoryFactory.create(id = serviceCategoryId1, desiredOutcomes = mutableListOf(desiredOutcome1))
    val serviceCategory2 = serviceCategoryFactory.create(id = serviceCategoryId2, desiredOutcomes = mutableListOf(desiredOutcome2))

    val contractType = contractTypeFactory.create(serviceCategories = setOf(serviceCategory1, serviceCategory2))
    val referral = referralFactory.createDraft(
      intervention = interventionFactory.create(
        contract = dynamicFrameworkContractFactory.create(
          contractType = contractType
        )
      ),
      selectedServiceCategories = setOf(serviceCategory1).toMutableSet(),
      desiredOutcomes = listOf(desiredOutcome1).toMutableList()
    )
    referralService.updateDraftReferral(referral, DraftReferralDTO(serviceCategoryIds = listOf(serviceCategoryId2)))

    referralRepository.flush()
    val updatedReferral = referralRepository.findById(referral.id).get()
    assertThat(updatedReferral!!.selectedServiceCategories).hasSize(1)
    assertThat(updatedReferral.selectedServiceCategories!!.elementAt(0).id).isEqualTo(serviceCategoryId2)
    assertThat(updatedReferral.selectedDesiredOutcomes).hasSize(0)
  }

  @Test
  fun `ensure that service categories constraint is not thrown when service categories is reselected with an already selected desired outcome`() {
    val serviceCategoryId = UUID.randomUUID()
    val desiredOutcome = DesiredOutcome(UUID.randomUUID(), "title", serviceCategoryId = serviceCategoryId)
    val serviceCategory = serviceCategoryFactory.create(id = serviceCategoryId, desiredOutcomes = mutableListOf(desiredOutcome))

    val contractType = contractTypeFactory.create(serviceCategories = setOf(serviceCategory))
    val referral = referralFactory.createDraft(
      intervention = interventionFactory.create(
        contract = dynamicFrameworkContractFactory.create(
          contractType = contractType
        )
      ),
      selectedServiceCategories = setOf(serviceCategory).toMutableSet(),
      desiredOutcomes = listOf(desiredOutcome).toMutableList(),
    )
    referralService.updateDraftReferral(referral, DraftReferralDTO(serviceCategoryIds = listOf(serviceCategoryId)))

    referralRepository.flush()
    val updatedReferral = referralRepository.findById(referral.id).get()
    assertThat(updatedReferral!!.selectedServiceCategories).hasSize(1)
    assertThat(updatedReferral.selectedServiceCategories!!.elementAt(0).id).isEqualTo(serviceCategoryId)
    assertThat(updatedReferral.selectedDesiredOutcomes).hasSize(1)
  }
}
