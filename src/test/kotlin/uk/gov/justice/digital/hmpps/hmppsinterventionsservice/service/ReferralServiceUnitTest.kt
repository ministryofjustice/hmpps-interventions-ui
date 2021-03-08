package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.whenever
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ReferralEventPublisher
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.AuthUserRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.InterventionRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ReferralRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.AuthUserFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.ReferralFactory

class ReferralServiceUnitTest {
  private val authUserRepository: AuthUserRepository = mock()
  private val referralRepository: ReferralRepository = mock()
  private val interventionRepository: InterventionRepository = mock()
  private val referralEventPublisher: ReferralEventPublisher = mock()
  private val referralReferenceGenerator: ReferralReferenceGenerator = mock()

  private val referralFactory = ReferralFactory()
  private val authUserFactory = AuthUserFactory()

  private val referralService = ReferralService(referralRepository, authUserRepository, interventionRepository, referralEventPublisher, referralReferenceGenerator)

  @Test
  fun `set cancellation fields on a sent referral`() {
    val referral = referralFactory.createSent()
    val authUser = authUserFactory.create()

    whenever(authUserRepository.save(authUser)).thenReturn(authUser)
    whenever(referralRepository.save(any())).thenReturn(referralFactory.createCancelled())

    val cancelledReferral = referralService.cancelSentReferral(referral, authUser)
    assertThat(cancelledReferral.cancelledAt).isNotNull
    assertThat(cancelledReferral.cancelledBy).isEqualTo(authUser)
  }
}
