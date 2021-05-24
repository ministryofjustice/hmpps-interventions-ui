package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.verify
import com.nhaarman.mockitokotlin2.whenever
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.springframework.web.server.ServerWebInputException
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.authorization.ReferralAccessChecker
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.authorization.ReferralAccessFilter
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.authorization.ServiceProviderAccessScopeMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.authorization.UserTypeChecker
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ReferralEventPublisher
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.CancellationReason
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ComplexityLevel
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ActionPlanAppointmentRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.AuthUserRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.CancellationReasonRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.InterventionRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ReferralRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ServiceCategoryRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.AuthUserFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.CancellationReasonFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.ReferralFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.ServiceCategoryFactory
import java.util.Optional
import java.util.UUID

class ReferralServiceUnitTest {
  private val authUserRepository: AuthUserRepository = mock()
  private val referralRepository: ReferralRepository = mock()
  private val interventionRepository: InterventionRepository = mock()
  private val referralEventPublisher: ReferralEventPublisher = mock()
  private val referralConcluder: ReferralConcluder = mock()
  private val referralReferenceGenerator: ReferralReferenceGenerator = mock()
  private val cancellationReasonRepository: CancellationReasonRepository = mock()
  private val actionPlanAppointmentRepository: ActionPlanAppointmentRepository = mock()
  private val referralAccessChecker: ReferralAccessChecker = mock()
  private val serviceProviderAccessScopeMapper: ServiceProviderAccessScopeMapper = mock()
  private val referralAccessFilter: ReferralAccessFilter = mock()
  private val userTypeChecker: UserTypeChecker = mock()
  private val serviceCategoryRepository: ServiceCategoryRepository = mock()

  private val referralFactory = ReferralFactory()
  private val authUserFactory = AuthUserFactory()
  private val cancellationReasonFactory = CancellationReasonFactory()
  private val serviceCategoryFactory = ServiceCategoryFactory()

  private val referralService = ReferralService(
    referralRepository, authUserRepository, interventionRepository, referralConcluder,
    referralEventPublisher, referralReferenceGenerator, cancellationReasonRepository,
    actionPlanAppointmentRepository, referralAccessChecker, userTypeChecker, serviceProviderAccessScopeMapper,
    referralAccessFilter, serviceCategoryRepository,
  )

  @Test
  fun `set ended fields on a sent referral`() {
    val referral = referralFactory.createSent()
    val authUser = authUserFactory.create()
    val cancellationReason = cancellationReasonFactory.create()
    val cancellationComments = "comment"

    whenever(authUserRepository.save(authUser)).thenReturn(authUser)
    whenever(referralRepository.save(any())).thenReturn(referralFactory.createEnded(endRequestedComments = cancellationComments))

    val endedReferral = referralService.requestReferralEnd(referral, authUser, cancellationReason, cancellationComments)
    assertThat(endedReferral.endRequestedAt).isNotNull
    assertThat(endedReferral.endRequestedBy).isEqualTo(authUser)
    assertThat(endedReferral.endRequestedReason).isEqualTo(cancellationReason)
    assertThat(endedReferral.endRequestedComments).isEqualTo(cancellationComments)
  }

  @Test
  fun `referral is concluded if eligible on a sent referral`() {
    val referral = referralFactory.createSent()
    val authUser = authUserFactory.create()
    val cancellationReason = cancellationReasonFactory.create()
    val cancellationComments = "comment"

    whenever(authUserRepository.save(authUser)).thenReturn(authUser)
    whenever(referralRepository.save(any())).thenReturn(referralFactory.createEnded(endRequestedComments = cancellationComments))

    referralService.requestReferralEnd(referral, authUser, cancellationReason, cancellationComments)

    verify(referralConcluder).concludeIfEligible(referral)
  }

  @Test
  fun `get all cancellation reasons`() {
    val cancellationReasons = listOf(
      CancellationReason(code = "aaa", description = "reason 1"),
      CancellationReason(code = "bbb", description = "reason 2")
    )
    whenever(cancellationReasonRepository.findAll()).thenReturn(cancellationReasons)
    val result = referralService.getCancellationReasons()
    assertThat(result).isNotNull
  }

  @Nested
  inner class UpdateDraftReferralComplexityLevel() {
    @Test
    fun `cant set complexity level when no service categories have been selected`() {
      val referral = referralFactory.createDraft()
      val e = assertThrows<ServerWebInputException> {
        referralService.updateDraftReferralComplexityLevel(
          referral,
          referral.intervention.dynamicFrameworkContract.contractType.serviceCategories.first().id,
          UUID.randomUUID()
        )
      }

      assertThat(e.message.equals("complexity level cannot be updated: no service categories selected for this referral"))
    }

    @Test
    fun `cant set complexity level for an invalid service category`() {
      val serviceCategory1 = serviceCategoryFactory.create()
      val serviceCategory2 = serviceCategoryFactory.create()
      val referral = referralFactory.createDraft(selectedServiceCategories = setOf(serviceCategory1))
      val e = assertThrows<ServerWebInputException> {
        referralService.updateDraftReferralComplexityLevel(
          referral,
          serviceCategory2.id,
          UUID.randomUUID()
        )
      }

      assertThat(e.message.equals("complexity level cannot be updated: specified service category not selected for this referral"))
    }

    @Test
    fun `cant set complexity level when service category is not found`() {
      whenever(serviceCategoryRepository.findById(any())).thenReturn(Optional.empty())
      val serviceCategory = serviceCategoryFactory.create()
      val referral = referralFactory.createDraft(selectedServiceCategories = setOf(serviceCategory))
      val e = assertThrows<ServerWebInputException> {
        referralService.updateDraftReferralComplexityLevel(
          referral,
          serviceCategory.id,
          UUID.randomUUID()
        )
      }

      assertThat(e.message.equals("complexity level cannot be updated: specified service category not found"))
    }

    @Test
    fun `cant set complexity level when its invalid for the service category`() {
      val complexityLevel = ComplexityLevel(UUID.randomUUID(), "title", "description")
      val serviceCategory = serviceCategoryFactory.create(complexityLevels = listOf(complexityLevel))
      val referral = referralFactory.createDraft(selectedServiceCategories = setOf(serviceCategory))

      whenever(serviceCategoryRepository.findById(any())).thenReturn(Optional.of(serviceCategory))

      val e = assertThrows<ServerWebInputException> {
        referralService.updateDraftReferralComplexityLevel(
          referral,
          serviceCategory.id,
          UUID.randomUUID()
        )
      }

      assertThat(e.message.equals("complexity level cannot be updated: complexity level not valid for this service category"))
    }

    @Test
    fun `can set complexity level for the first time`() {
      val complexityLevel = ComplexityLevel(UUID.randomUUID(), "title", "description")
      val serviceCategory = serviceCategoryFactory.create(complexityLevels = listOf(complexityLevel))
      val referral = referralFactory.createDraft(selectedServiceCategories = setOf(serviceCategory))

      assertThat(referral.complexityLevelIds).isNull()

      whenever(serviceCategoryRepository.findById(any())).thenReturn(Optional.of(serviceCategory))
      whenever(referralRepository.save(referral)).thenReturn(referral)

      val updatedReferral = referralService.updateDraftReferralComplexityLevel(
        referral,
        serviceCategory.id,
        complexityLevel.id,
      )

      assertThat(updatedReferral.complexityLevelIds!!.size).isEqualTo(1)
    }

    @Test
    fun `can update an already selected complexity level`() {
      val complexityLevel1 = ComplexityLevel(UUID.randomUUID(), "1", "description")
      val complexityLevel2 = ComplexityLevel(UUID.randomUUID(), "2", "description")
      val serviceCategory = serviceCategoryFactory.create(complexityLevels = listOf(complexityLevel1, complexityLevel2))
      val referral = referralFactory.createDraft(
        selectedServiceCategories = setOf(serviceCategory),
        complexityLevelIds = mutableMapOf(serviceCategory.id to complexityLevel1.id)
      )

      whenever(serviceCategoryRepository.findById(any())).thenReturn(Optional.of(serviceCategory))
      whenever(referralRepository.save(referral)).thenReturn(referral)

      val updatedReferral = referralService.updateDraftReferralComplexityLevel(
        referral,
        serviceCategory.id,
        complexityLevel2.id,
      )

      assertThat(updatedReferral.complexityLevelIds!![serviceCategory.id]).isEqualTo(complexityLevel2.id)
    }
  }
}
