package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.ReferralFactory

class ReferralDTOTest {
  val referralFactory = ReferralFactory()

  @Nested
  inner class EndedReferral {
    @Test
    fun `endedReferralFields are populated when referral has endedAt`() {
      val endedReferral = referralFactory.createEnded()
      val referralDTO = ReferralDTO.from(endedReferral)
      assertThat(referralDTO.endedFields).isNotNull()
      assertThat(referralDTO.endedFields!!.endedAt).isEqualTo(endedReferral.endedAt)
    }

    @Test
    fun `endedReferralFields are not populated when referral has null endedAt`() {
      val referralDTO = ReferralDTO.from(referralFactory.createDraft())
      assertThat(referralDTO.endedFields).isNull()
    }

    @Test
    fun `an ended referral must always have certain fields populated`() {
      var endedReferral = referralFactory.createEnded()
      endedReferral.endedBy = null
      assertThrows<RuntimeException> {
        ReferralDTO.from(endedReferral)
      }
      endedReferral = referralFactory.createEnded()
      endedReferral.cancellationReason = null
      assertThrows<RuntimeException> {
        ReferralDTO.from(endedReferral)
      }
    }
  }

  @Nested
  inner class SentReferral {
    @Test
    fun `sentReferralFields are populated when referral has sentAt`() {
      val sentReferral = referralFactory.createSent()
      val referralDTO = ReferralDTO.from(sentReferral)
      assertThat(referralDTO.sentFields).isNotNull()
      assertThat(referralDTO.sentFields!!.sentAt).isEqualTo(sentReferral.sentAt)
    }

    @Test
    fun `sentReferralFields are not populated when referral has null sentAt`() {
      val referralDTO = ReferralDTO.from(referralFactory.createDraft())
      assertThat(referralDTO.sentFields).isNull()
    }

    @Test
    fun `a sent referral must always have certain fields populated`() {
      var sentReferral = referralFactory.createSent()
      sentReferral.sentBy = null
      assertThrows<RuntimeException> {
        ReferralDTO.from(sentReferral)
      }
      sentReferral = referralFactory.createSent()
      sentReferral.referenceNumber = null
      assertThrows<RuntimeException> {
        ReferralDTO.from(sentReferral)
      }
    }
  }
}
