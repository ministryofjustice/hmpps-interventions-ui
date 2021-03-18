package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto

import org.assertj.core.api.Assertions
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertDoesNotThrow
import org.junit.jupiter.api.assertThrows
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.json.JsonTest
import org.springframework.boot.test.json.JacksonTester
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.SampleData
import java.time.OffsetDateTime
import java.util.UUID

@JsonTest
class SentReferralDTOTest(@Autowired private val json: JacksonTester<SentReferralDTO>) {
  @Test
  fun `sent referral requires reference number, sent timestamp, sentBy`() {
    val referral = SampleData.sampleReferral("X123456", "Provider")
    val timestamp = OffsetDateTime.now()

    assertThrows<RuntimeException> {
      SentReferralDTO.from(referral)
    }

    referral.sentAt = timestamp
    assertThrows<RuntimeException> {
      SentReferralDTO.from(referral)
    }

    referral.referenceNumber = "something"
    assertThrows<RuntimeException> {
      SentReferralDTO.from(referral)
    }

    referral.sentBy = AuthUser("id", "source", "username")
    assertDoesNotThrow { SentReferralDTO.from(referral) }
  }

  @Test
  fun `sent referral includes all draft referral fields`() {
    val id = UUID.fromString("3B9ED289-8412-41A9-8291-45E33E60276C")
    val createdAt = OffsetDateTime.parse("2020-12-04T10:42:43+00:00")
    val sentAt = OffsetDateTime.parse("2021-01-13T21:57:13+00:00")
    val sentBy = AuthUser("id", "source", "username")

    val referral = SampleData.sampleReferral(
      "X123456",
      "Provider",
      id = id,
      createdAt = createdAt,
    )

    referral.referenceNumber = "something"
    referral.needsInterpreter = true
    referral.interpreterLanguage = "french"
    referral.sentAt = sentAt
    referral.sentBy = sentBy

    val out = json.write(SentReferralDTO.from(referral))
    Assertions.assertThat(out).isEqualToJson(
      """
      {
        "sentAt": "2021-01-13T21:57:13Z",
        "sentBy": {
          "username": "username",
          "authSource": "source"
        },
        "referenceNumber": "something",
        "referral": {
          "id": "3b9ed289-8412-41a9-8291-45e33e60276c",
          "createdAt": "2020-12-04T10:42:43Z",
          "needsInterpreter": true,
          "interpreterLanguage": "french",
          "serviceUser": {"crn": "X123456"},
          "serviceProvider": {"name": "Provider"}
        },
        "actionPlanId": null
      }
    """
    )
  }

  @Test
  fun `sent referral includes all draft fields and action plan id`() {
    val id = UUID.fromString("3B9ED289-8412-41A9-8291-45E33E60276C")
    val createdAt = OffsetDateTime.parse("2020-12-04T10:42:43+00:00")
    val sentAt = OffsetDateTime.parse("2021-01-13T21:57:13+00:00")
    val sentBy = AuthUser("id", "source", "username")

    val referral = SampleData.sampleReferral(
      "X123456",
      "Provider",
      id = id,
      createdAt = createdAt,
      actionPlan = SampleData.sampleActionPlan()
    )

    referral.referenceNumber = "something"
    referral.needsInterpreter = true
    referral.interpreterLanguage = "french"
    referral.sentAt = sentAt
    referral.sentBy = sentBy

    val out = json.write(SentReferralDTO.from(referral))
    Assertions.assertThat(out).isEqualToJson(
      """
      {
        "sentAt": "2021-01-13T21:57:13Z",
        "sentBy": {
          "username": "username",
          "authSource": "source"
        },
        "referenceNumber": "something",
        "referral": {
          "id": "3b9ed289-8412-41a9-8291-45e33e60276c",
          "createdAt": "2020-12-04T10:42:43Z",
          "needsInterpreter": true,
          "interpreterLanguage": "french",
          "serviceUser": {"crn": "X123456"},
          "serviceProvider": {"name": "Provider"}
        },
        "actionPlanId": "${referral.actionPlan?.id}"
      }
    """
    )
  }

  @Test
  fun `sent referral includes end of service report`() {
    val id = UUID.fromString("3B9ED289-8412-41A9-8291-45E33E60276C")
    val createdAt = OffsetDateTime.parse("2020-12-04T10:42:43+00:00")
    val sentAt = OffsetDateTime.parse("2021-01-13T21:57:13+00:00")
    val sentBy = AuthUser("id", "source", "username")

    val referral = SampleData.sampleReferral(
      "X123456",
      "Provider",
      id = id,
      createdAt = createdAt,
      endOfServiceReport = SampleData.sampleEndOfServiceReport(
        createdAt = createdAt, id = id,
        outcomes = setOf(SampleData.sampleEndOfServiceReportOutcome(desiredOutcome = SampleData.sampleDesiredOutcome(id = id)))
      )
    )

    referral.referenceNumber = "something"
    referral.needsInterpreter = true
    referral.interpreterLanguage = "french"
    referral.sentAt = sentAt
    referral.sentBy = sentBy

    val out = json.write(SentReferralDTO.from(referral))
    Assertions.assertThat(out).isEqualToJson(
      """
      {
        "sentAt": "2021-01-13T21:57:13Z",
        "sentBy": {
          "username": "username",
          "authSource": "source"
        },
        "referenceNumber": "something",
        "referral": {
          "id": "3b9ed289-8412-41a9-8291-45e33e60276c",
          "createdAt": "2020-12-04T10:42:43Z",
          "needsInterpreter": true,
          "interpreterLanguage": "french",
          "serviceUser": {"crn": "X123456"},
          "serviceProvider": {"name": "Provider"}
        },
        "endOfServiceReport": {
        "id" : "3b9ed289-8412-41a9-8291-45e33e60276c",
        "createdAt" : "2020-12-04T10:42:43Z",
        "createdBy" :  {
          "username": "user",
          "authSource": "auth"
        },
        "submittedAt" : null,
        "submittedBy" :  null,
        "furtherInformation" : null,
        "outcomes" : [{
            "desiredOutcome" : {
                "id" : "3b9ed289-8412-41a9-8291-45e33e60276c",
                "description" : "Outcome 1"
            },
          "achievementLevel" : "ACHIEVED",
          "progressionComments" : null,
          "additionalTaskComments" : null
        }]
      }
    }
    """
    )
  }
}
