package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto

import org.assertj.core.api.Assertions
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.json.JsonTest
import org.springframework.boot.test.json.JacksonTester
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Referral
import java.time.OffsetDateTime
import java.util.UUID

@JsonTest
class SentReferralDTOTest(@Autowired private val json: JacksonTester<SentReferralDTO>) {
  @Test
  fun `sent referral requires id, reference number, and created and sent timestamps`() {
    val id = UUID.randomUUID()
    val timestamp = OffsetDateTime.now()

    assertThrows<RuntimeException> {
      SentReferralDTO.from(Referral(serviceUserCRN = "X123456"))
    }

    assertThrows<RuntimeException> {
      SentReferralDTO.from(Referral(id = id, serviceUserCRN = "X123456"))
    }

    assertThrows<RuntimeException> {
      SentReferralDTO.from(Referral(id = id, createdAt = timestamp, serviceUserCRN = "X123456"))
    }

    assertThrows<RuntimeException> {
      SentReferralDTO.from(Referral(id = id, createdAt = timestamp, serviceUserCRN = "X123456"))
    }

    SentReferralDTO.from(
      Referral(id = id, createdAt = timestamp, sentAt = timestamp, referenceNumber = "something", serviceUserCRN = "X123456")
    )
  }

  @Test
  fun `sent referral includes all draft referral fields`() {
    val id = UUID.fromString("3B9ED289-8412-41A9-8291-45E33E60276C")
    val createdAt = OffsetDateTime.parse("2020-12-04T10:42:43+00:00")
    val sentAt = OffsetDateTime.parse("2021-01-13T21:57:13+00:00")

    val referral = Referral(
      id = id,
      createdAt = createdAt,
      serviceUserCRN = "X123456",
      referenceNumber = "something",
      needsInterpreter = true,
      interpreterLanguage = "french",
      sentAt = sentAt,
    )

    val out = json.write(SentReferralDTO.from(referral))
    Assertions.assertThat(out).isEqualToJson(
      """
      {
        "sentAt": "2021-01-13T21:57:13Z",
        "referral": {
          "id": "3b9ed289-8412-41a9-8291-45e33e60276c", 
          "createdAt": "2020-12-04T10:42:43Z",
          "needsInterpreter": true,
          "interpreterLanguage": "french"
        }
      }
    """
    )
  }
}
