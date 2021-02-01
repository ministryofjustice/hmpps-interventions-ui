package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertDoesNotThrow
import org.junit.jupiter.api.assertThrows
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.json.JsonTest
import org.springframework.boot.test.json.JacksonTester
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.SampleData
import java.time.LocalDate
import java.time.OffsetDateTime
import java.util.UUID

@JsonTest
class DraftReferralDTOTest(@Autowired private val json: JacksonTester<DraftReferralDTO>) {
  @Test
  fun `a DraftReferralDTO cannot be created without id and createdAt`() {
    val referral = SampleData.sampleReferral("X123456", "Provider")
    val timestamp = OffsetDateTime.parse("2020-12-04T10:42:43+00:00")
    val id = UUID.fromString("70d3a47c-d539-4f76-8fc9-1c50e34aea29")

    assertThrows<RuntimeException> {
      DraftReferralDTO.from(referral)
    }

    referral.createdAt = timestamp
    assertThrows<RuntimeException> {
      DraftReferralDTO.from(referral)
    }

    referral.createdAt = null
    referral.id = id
    assertThrows<RuntimeException> {
      DraftReferralDTO.from(referral)
    }

    referral.createdAt = timestamp
    referral.id = id
    assertDoesNotThrow { DraftReferralDTO.from(referral) }
  }

  @Test
  fun `test serialization of newly created referral`() {
    val referral = SampleData.sampleReferral("X123456", "Provider")
    referral.id = UUID.fromString("3B9ED289-8412-41A9-8291-45E33E60276C")
    referral.createdAt = OffsetDateTime.parse("2020-12-04T10:42:43+00:00")

    val out = json.write(DraftReferralDTO.from(referral))
    assertThat(out).isEqualToJson(
      """
      {
        "id": "3b9ed289-8412-41a9-8291-45e33e60276c",
        "createdAt": "2020-12-04T10:42:43Z",
        "serviceUser": {
          "crn": "X123456"
        },
        "serviceProvider": {
          "name": "Provider"
        }
      }
    """
    )
  }

  @Test
  fun `test serialization of referral with completionDeadline`() {
    val referral = SampleData.sampleReferral("X123456", "Provider")
    referral.id = UUID.fromString("3B9ED289-8412-41A9-8291-45E33E60276C")
    referral.createdAt = OffsetDateTime.parse("2020-12-04T10:42:43+00:00")
    referral.completionDeadline = LocalDate.of(2021, 2, 12)

    val out = json.write(DraftReferralDTO.from(referral))
    assertThat(out).isEqualToJson(
      """
      {
        "id": "3b9ed289-8412-41a9-8291-45e33e60276c",
        "createdAt": "2020-12-04T10:42:43Z",
        "completionDeadline": "2021-02-12",
        "serviceUser": {
          "crn": "X123456"
        },
        "serviceProvider": {
          "name": "Provider"
        }
      }
    """
    )
  }

  @Test
  fun `test deserialization of partial referral`() {
    val draftReferral = json.parseObject(
      """
      {"completionDeadline": "2021-02-10"}
    """
    )
    assertThat(draftReferral.completionDeadline).isEqualTo(LocalDate.of(2021, 2, 10))
  }
}
