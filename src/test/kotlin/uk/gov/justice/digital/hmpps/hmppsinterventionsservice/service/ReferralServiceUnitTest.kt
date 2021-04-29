package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.argumentCaptor
import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.verify
import com.nhaarman.mockitokotlin2.whenever
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ReferralEventPublisher
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.CancellationReason
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.SampleData
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ActionPlanAppointmentRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.AuthUserRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.CancellationReasonRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.InterventionRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ReferralRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.ActionPlanFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.AuthUserFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.CancellationReasonFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.ReferralFactory

class ReferralServiceUnitTest {
  private val authUserRepository: AuthUserRepository = mock()
  private val referralRepository: ReferralRepository = mock()
  private val interventionRepository: InterventionRepository = mock()
  private val referralEventPublisher: ReferralEventPublisher = mock()
  private val referralReferenceGenerator: ReferralReferenceGenerator = mock()
  private val cancellationReasonRepository: CancellationReasonRepository = mock()
  private val actionPlanAppointmentRepository: ActionPlanAppointmentRepository = mock()

  private val referralFactory = ReferralFactory()
  private val authUserFactory = AuthUserFactory()
  private val cancellationReasonFactory = CancellationReasonFactory()
  private val actionPlanFactory = ActionPlanFactory()

  private val referralService = ReferralService(
    referralRepository, authUserRepository, interventionRepository,
    referralEventPublisher, referralReferenceGenerator, cancellationReasonRepository,
    actionPlanAppointmentRepository,
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
  fun `concludedAt is set when there is no action plan`() {
    val referral = referralFactory.createSent()
    whenever(referralRepository.save(referral)).thenReturn(referral)

    val endedReferral = referralService.requestReferralEnd(referral, referral.createdBy, cancellationReasonFactory.create(), null)
    assertThat(endedReferral.concludedAt).isNotNull
  }

  @Test
  fun `concludedAt is set when there are no attended appointments`() {
    val referral = referralFactory.createSent()
    referral.actionPlan = actionPlanFactory.create()
    referralFactory.save(referral)

    whenever(referralRepository.save(referral)).thenReturn(referral)
    whenever(actionPlanAppointmentRepository.countByActionPlanIdAndAttendedIsNotNull(any())).thenReturn(0)

    val endedReferral =
      referralService.requestReferralEnd(referral, referral.createdBy, cancellationReasonFactory.create(), null)
    assertThat(endedReferral.concludedAt).isNotNull
  }

  @Test
  fun `concludedAt is not set when there are attended appointments`() {
    val referral = referralFactory.createSent()
    referral.actionPlan = actionPlanFactory.create()
    referralFactory.save(referral)

    whenever(referralRepository.save(referral)).thenReturn(referral)
    whenever(actionPlanAppointmentRepository.countByActionPlanIdAndAttendedIsNotNull(any())).thenReturn(2)

    val endedReferral =
      referralService.requestReferralEnd(referral, referral.createdBy, cancellationReasonFactory.create(), null)
    assertThat(endedReferral.concludedAt).isNull()
  }

  @Test
  fun `get sent referrals sent by current user`() {
    val referral = SampleData.sampleReferral("CRN123", "Service Provider")
    val authUser = SampleData.sampleAuthUser()

    whenever(referralRepository.findBySentBy(any())).thenReturn(listOf(referral))
    val argumentCaptor = argumentCaptor<AuthUser>()

    val result = referralService.getSentReferralsSentBy(authUser)

    assertThat(result).isEqualTo(listOf(referral))
    verify(referralRepository).findBySentBy(argumentCaptor.capture())
    assertThat(argumentCaptor.firstValue).isEqualTo(authUser)
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
}
