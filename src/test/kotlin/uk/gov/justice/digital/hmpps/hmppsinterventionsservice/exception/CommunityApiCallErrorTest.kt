package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.exception

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.http.HttpStatus.BAD_REQUEST
import org.springframework.http.HttpStatus.CONFLICT
import org.springframework.http.HttpStatus.GONE
import org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE

internal class CommunityApiCallErrorTest {

  @Test
  fun `maps user message to category`() {

    assertThat(
      CommunityApiCallError(
        BAD_REQUEST,
        "Contact type '_' requires an outcome type as the contact date is in the past '_-_-_'",
        "{}",
        RuntimeException()
      ).userMessage
    ).isEqualTo("Delius requires an appointment to only be made for today or in the future. Please amend and try again")

    assertThat(
      CommunityApiCallError(
        BAD_REQUEST,
        "Validation failure: startTime endTime must be after or equal to startTime, endTime endTime must be after or equal to startTime",
        "{}",
        RuntimeException()
      ).userMessage
    ).isEqualTo("Delius requires that an appointment must end on the same day it starts. Please amend and try again")

    assertThat(
      CommunityApiCallError(
        BAD_REQUEST,
        "CRN: _ EventId: _ has multiple referral requirements",
        "{}",
        RuntimeException()
      ).userMessage
    ).isEqualTo("The Service User Sentence must not contain more than one active rehabilitation activity requirement. Please correct in Delius and try again")

    assertThat(
      CommunityApiCallError(
        BAD_REQUEST,
        "Cannot find NSI for CRN: _ Sentence: _ and ContractType ACC",
        "{}",
        RuntimeException()
      ).userMessage
    ).isEqualTo("There has been an error during creating the Delius NSI. We are aware of this issue. For follow-up, please contact support")

    assertThat(
      CommunityApiCallError(
        BAD_REQUEST,
        "Multiple existing matching NSIs found",
        "{}",
        RuntimeException()
      ).userMessage
    ).isEqualTo("There has been an error during creating the Delius NSI. We are aware of this issue. For follow-up, please contact support")

    assertThat(
      CommunityApiCallError(
        CONFLICT,
        "_ Conflict from POST https://community-api-secure.probation.service.justice.gov.uk/secure/offenders/crn/_/sentence/_/appointments/context/commissioned-rehabilitation-services",
        "{}",
        RuntimeException()
      ).userMessage
    ).isEqualTo("The appointment conflicts with another. Please contact the service user's probation practitioner for an available slot and try again")

    assertThat(
      CommunityApiCallError(
        CONFLICT,
        "_ Conflict from POST https://community-api-secure.probation.service.justice.gov.uk/secure/offenders/crn/_/appointments/_/reschedule/context/commissioned-rehabilitation-services",
        "{}",
        RuntimeException()
      ).userMessage
    ).isEqualTo("The appointment conflicts with another. Please contact the service user's probation practitioner for an available slot and try again")

    assertThat(
      CommunityApiCallError(
        GONE,
        "An unrecognised issue 'A123'",
        "{}",
        RuntimeException()
      ).userMessage
    ).isEqualTo("Delius reported \"An unrecognised issue '_'\". Please correct, if possible, otherwise contact support")

    assertThat(
      CommunityApiCallError(
        SERVICE_UNAVAILABLE,
        "Any message",
        "{}",
        RuntimeException()
      ).userMessage
    ).isEqualTo("System is experiencing issues. Please try again later and if the issue persists contact Support")
  }

  @Test
  fun `determines whether to log`() {

    assertThat(
      CommunityApiCallError(
        BAD_REQUEST,
        "Contact type '_' requires an outcome type as the contact date is in the past '_-_-_'",
        "{}",
        RuntimeException()
      ).logError
    ).isTrue

    assertThat(
      CommunityApiCallError(
        BAD_REQUEST,
        "Validation failure: startTime endTime must be after or equal to startTime, endTime endTime must be after or equal to startTime",
        "{}",
        RuntimeException()
      ).logError
    ).isTrue

    assertThat(
      CommunityApiCallError(
        BAD_REQUEST,
        "CRN: _ EventId: _ has multiple referral requirements",
        "{}",
        RuntimeException()
      ).logError
    ).isTrue

    assertThat(
      CommunityApiCallError(
        BAD_REQUEST,
        "Cannot find NSI for CRN: _ Sentence: _ and ContractType ACC",
        "{}",
        RuntimeException()
      ).logError
    ).isTrue

    assertThat(
      CommunityApiCallError(
        BAD_REQUEST,
        "Multiple existing matching NSIs found",
        "{}",
        RuntimeException()
      ).logError
    ).isTrue

    assertThat(
      CommunityApiCallError(
        CONFLICT,
        "_ Conflict from POST https://community-api-secure.probation.service.justice.gov.uk/secure/offenders/crn/_/sentence/_/appointments/context/commissioned-rehabilitation-services",
        "{}",
        RuntimeException()
      ).logError
    ).isTrue

    assertThat(
      CommunityApiCallError(
        CONFLICT,
        "_ Conflict from POST https://community-api-secure.probation.service.justice.gov.uk/secure/offenders/crn/_/appointments/_/reschedule/context/commissioned-rehabilitation-services",
        "{}",
        RuntimeException()
      ).logError
    ).isTrue

    assertThat(
      CommunityApiCallError(
        GONE,
        "An unrecognised issue",
        "{}",
        RuntimeException()
      ).logError
    ).isTrue

    assertThat(
      CommunityApiCallError(
        SERVICE_UNAVAILABLE,
        "Any message",
        "{}",
        RuntimeException()
      ).logError
    ).isTrue
  }
}
