package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
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
  fun `test serialization of newly created referral`() {
    val referral = SampleData.sampleReferral(
      "X123456",
      "Provider",
      id = UUID.fromString("3B9ED289-8412-41A9-8291-45E33E60276C"),
      createdAt = OffsetDateTime.parse("2020-12-04T10:42:43+00:00"),
    )

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
    val referral = SampleData.sampleReferral(
      "X123456",
      "Provider",
      id = UUID.fromString("3B9ED289-8412-41A9-8291-45E33E60276C"),
      createdAt = OffsetDateTime.parse("2020-12-04T10:42:43+00:00"),
      completionDeadline = LocalDate.of(2021, 2, 12),
    )

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
