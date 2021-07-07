package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.exception

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.http.HttpStatus.BAD_REQUEST
import org.springframework.http.HttpStatus.CONFLICT
import org.springframework.http.HttpStatus.GONE
import org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE

internal class DownstreamApiCallErrorTest {

  @Test
  fun `maps user message to category`() {

    assertThat(
      DownstreamApiCallError(
        BAD_REQUEST,
        "Contact type '_' requires an outcome type as the contact date is in the past '_-_-_'",
        "{}",
        RuntimeException()
      ).userMessage
    ).isEqualTo("An appointment must only be made for today or in the future. Please try again")

    assertThat(
      DownstreamApiCallError(
        BAD_REQUEST,
        "Validation failure: startTime endTime must be after or equal to startTime, endTime endTime must be after or equal to startTime",
        "{}",
        RuntimeException()
      ).userMessage
    ).isEqualTo("An appointment must complete within the same day. Please try again")

    assertThat(
      DownstreamApiCallError(
        BAD_REQUEST,
        "CRN: _ EventId: _ has multiple referral requirements",
        "{}",
        RuntimeException()
      ).userMessage
    ).isEqualTo("The Service User Sentence must not contain more than one active rehabilitation activity requirement. Please correct and try again")

    assertThat(
      DownstreamApiCallError(
        BAD_REQUEST,
        "Cannot find NSI for CRN: _ Sentence: _ and ContractType ACC",
        "{}",
        RuntimeException()
      ).userMessage
    ).isEqualTo("The intervention cannot be found for the Service User Sentence. Please contact support")

    assertThat(
      DownstreamApiCallError(
        CONFLICT,
        "_ Conflict from POST https://community-api-secure.probation.service.justice.gov.uk/secure/offenders/crn/_/sentence/_/appointments/context/commissioned-rehabilitation-services",
        "{}",
        RuntimeException()
      ).userMessage
    ).isEqualTo("The appointment conflicts with another. Please try again")

    assertThat(
      DownstreamApiCallError(
        CONFLICT,
        "_ Conflict from POST https://community-api-secure.probation.service.justice.gov.uk/secure/offenders/crn/_/appointments/_/reschedule/context/commissioned-rehabilitation-services",
        "{}",
        RuntimeException()
      ).userMessage
    ).isEqualTo("The appointment conflicts with another. Please try again")

    assertThat(
      DownstreamApiCallError(
        GONE,
        "An unrecognised issue",
        "{}",
        RuntimeException()
      ).userMessage
    ).isEqualTo("A problem has occurred. Please contact support")

    assertThat(
      DownstreamApiCallError(
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
      DownstreamApiCallError(
        BAD_REQUEST,
        "Contact type '_' requires an outcome type as the contact date is in the past '_-_-_'",
        "{}",
        RuntimeException()
      ).logError
    ).isFalse

    assertThat(
      DownstreamApiCallError(
        BAD_REQUEST,
        "Validation failure: startTime endTime must be after or equal to startTime, endTime endTime must be after or equal to startTime",
        "{}",
        RuntimeException()
      ).logError
    ).isFalse

    assertThat(
      DownstreamApiCallError(
        BAD_REQUEST,
        "CRN: _ EventId: _ has multiple referral requirements",
        "{}",
        RuntimeException()
      ).logError
    ).isTrue

    assertThat(
      DownstreamApiCallError(
        BAD_REQUEST,
        "Cannot find NSI for CRN: _ Sentence: _ and ContractType ACC",
        "{}",
        RuntimeException()
      ).logError
    ).isTrue

    assertThat(
      DownstreamApiCallError(
        CONFLICT,
        "_ Conflict from POST https://community-api-secure.probation.service.justice.gov.uk/secure/offenders/crn/_/sentence/_/appointments/context/commissioned-rehabilitation-services",
        "{}",
        RuntimeException()
      ).logError
    ).isFalse

    assertThat(
      DownstreamApiCallError(
        CONFLICT,
        "_ Conflict from POST https://community-api-secure.probation.service.justice.gov.uk/secure/offenders/crn/_/appointments/_/reschedule/context/commissioned-rehabilitation-services",
        "{}",
        RuntimeException()
      ).logError
    ).isFalse

    assertThat(
      DownstreamApiCallError(
        GONE,
        "An unrecognised issue",
        "{}",
        RuntimeException()
      ).logError
    ).isTrue

    assertThat(
      DownstreamApiCallError(
        SERVICE_UNAVAILABLE,
        "Any message",
        "{}",
        RuntimeException()
      ).logError
    ).isTrue
  }
}