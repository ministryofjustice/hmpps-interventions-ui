package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.json.JsonTest
import org.springframework.boot.test.json.JacksonTester
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Referral
import java.time.LocalDate
import java.time.OffsetDateTime
import java.util.UUID

@JsonTest
class DraftReferralDTOTest(@Autowired private val json: JacksonTester<DraftReferralDTO>) {
  @Test
  fun `empty input cannot create draft referral`() {
    assertThrows<RuntimeException> {
      DraftReferralDTO.from(Referral())
    }
  }

  @Test
  fun `empty referral id cannot create draft referral`() {
    val createdDate = OffsetDateTime.parse("2020-12-04T10:42:43+00:00")

    assertThrows<RuntimeException> {
      DraftReferralDTO.from(Referral(createdAt = createdDate))
    }
  }

  @Test
  fun `empty referral creation date cannot create draft referral`() {
    val id = UUID.fromString("70d3a47c-d539-4f76-8fc9-1c50e34aea29")

    assertThrows<RuntimeException> {
      DraftReferralDTO.from(Referral(id = id))
    }
  }

  @Test
  fun `test serialization of newly created referral`() {
    val referral = Referral(
      id = UUID.fromString("3B9ED289-8412-41A9-8291-45E33E60276C"),
      createdAt = OffsetDateTime.parse("2020-12-04T10:42:43+00:00"),
      createdByUserID = "123456",
      createdByUserAuthSource = "delius",
    )
    val out = json.write(DraftReferralDTO.from(referral))
    assertThat(out).isEqualToJson(
      """
      {
        "id": "3b9ed289-8412-41a9-8291-45e33e60276c", 
        "createdAt": "2020-12-04T10:42:43Z",
        "createdByUserId": "123456"
      }
    """
    )
  }

  @Test
  fun `test serialization of referral with completionDeadline`() {
    val referral = Referral(
      id = UUID.fromString("3B9ED289-8412-41A9-8291-45E33E60276C"),
      createdAt = OffsetDateTime.parse("2020-12-04T10:42:43+00:00"),
      createdByUserID = "123456",
      createdByUserAuthSource = "delius",
      completionDeadline = LocalDate.of(2021, 2, 12)
    )
    val out = json.write(DraftReferralDTO.from(referral))
    assertThat(out).isEqualToJson(
      """
      {
        "id": "3b9ed289-8412-41a9-8291-45e33e60276c", 
        "createdAt": "2020-12-04T10:42:43Z",
        "createdByUserId": "123456",
        "completionDeadline": "2021-02-12"
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
