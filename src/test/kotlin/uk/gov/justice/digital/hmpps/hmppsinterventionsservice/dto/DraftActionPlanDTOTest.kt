package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.json.JsonTest
import org.springframework.boot.test.json.JacksonTester
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.SampleData
import java.time.OffsetDateTime
import java.util.UUID

@JsonTest
class DraftActionPlanDTOTest(@Autowired private val json: JacksonTester<DraftActionPlanDTO>) {
  @Test
  fun `test serialization of newly created draft action plan`() {

    val planCreatedAt = OffsetDateTime.parse("2020-12-04T10:42:43+00:00")
    val activityCreatedAt = OffsetDateTime.parse("2020-12-04T10:42:44+00:00")

    val actionPlan = SampleData.sampleActionPlan(
      id = UUID.fromString("111ED289-8412-41A9-8291-45E33E60276C"),
      referral = SampleData.sampleReferral(id = UUID.fromString("222ED289-8412-41A9-8291-45E33E60276C"), crn = "CRN123", serviceProviderName = "SP"),
      createdAt = planCreatedAt,
      desiredOutcome = SampleData.sampleDesiredOutcome(id = UUID.fromString("333ED289-8412-41A9-8291-45E33E60276C")),
      activityId = UUID.fromString("444ED289-8412-41A9-8291-45E33E60276C"),
      activityCreatedAt = activityCreatedAt
    )

    val out = json.write(DraftActionPlanDTO.from(actionPlan))
    assertThat(out).isEqualToJson(
      """
      {
        "id": "111ed289-8412-41a9-8291-45e33e60276c",
        "referralId": "222ed289-8412-41a9-8291-45e33e60276c",
        "numberOfSessions": 1,
        "activities": [
          {
            "id": "444ed289-8412-41a9-8291-45e33e60276c",
            "desiredOutcome": {
              "id": "333ed289-8412-41a9-8291-45e33e60276c",
              "description": "Outcome 1"
            },
            "description": "Some text to describe activity",
            "createdAt": "2020-12-04T10:42:44Z"
          }
        ],
        "createdBy": {
          "username": "user",
          "authSource": "auth"
        },
        "createdAt": "2020-12-04T10:42:43Z"
      }
    """
    )
  }
}
