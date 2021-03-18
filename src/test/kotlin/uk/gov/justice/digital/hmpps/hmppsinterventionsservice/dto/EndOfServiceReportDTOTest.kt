package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto

import org.assertj.core.api.Assertions
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.json.JsonTest
import org.springframework.boot.test.json.JacksonTester
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.SampleData
import java.time.OffsetDateTime
import java.util.UUID

@JsonTest
class EndOfServiceReportDTOTest(@Autowired private val json: JacksonTester<EndOfServiceReportDTO>) {

  @Test
  fun `test serialization of an end of service report`() {
    val id = UUID.fromString("3B9ED289-8412-41A9-8291-45E33E60276C")
    val createdAt = OffsetDateTime.parse("2020-12-04T10:42:43+00:00")
    val endOfServiceReport = SampleData.sampleEndOfServiceReport(
      createdAt = createdAt, id = id,
      outcomes = setOf(SampleData.sampleEndOfServiceReportOutcome(desiredOutcome = SampleData.sampleDesiredOutcome(id = id)))
    )

    val out = json.write(EndOfServiceReportDTO.from(endOfServiceReport))
    Assertions.assertThat(out).isEqualToJson(
      """
      {
        "id": "3b9ed289-8412-41a9-8291-45e33e60276c",
        "createdAt": "2020-12-04T10:42:43Z",
        "createdBy": {
          "username": "user",
          "authSource": "auth"
        },
        "submittedAt": null,
        "submittedBy": null,
        "furtherInformation": null,
        "outcomes": [
          {
            "desiredOutcome": {
              "id": "3b9ed289-8412-41a9-8291-45e33e60276c",
              "description": "Outcome 1"
            },
            "achievementLevel": "ACHIEVED",
            "progressionComments": null,
            "additionalTaskComments": null
          }
        ]
      }
    """
    )
  }
}
