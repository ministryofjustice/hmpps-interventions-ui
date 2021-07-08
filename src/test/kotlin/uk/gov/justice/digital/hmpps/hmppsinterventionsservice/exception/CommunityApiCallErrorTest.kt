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
        "Contact type 'CRSSAA' requires an outcome type as the contact date is in the past '2021-06-29'",
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
        "CRN: E376578 EventId: 1502929161 has multiple referral requirements",
        "{}",
        RuntimeException()
      ).userMessage
    ).isEqualTo("The Service User Sentence must not contain more than one active rehabilitation activity requirement. Please correct in Delius and try again")

    assertThat(
      CommunityApiCallError(
        BAD_REQUEST,
        "Cannot find NSI for CRN: M190420 Sentence: 1503032340 and ContractType ACC",
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
        "409 Conflict from POST https://community-api-secure.probation.service.justice.gov.uk/secure/offenders/crn/E188275/sentence/1503090023/appointments/context/commissioned-rehabilitation-services",
        "{}",
        RuntimeException()
      ).userMessage
    ).isEqualTo("The appointment conflicts with another. Please contact the service user's probation practitioner for an available slot and try again")

    assertThat(
      CommunityApiCallError(
        CONFLICT,
        "409 Conflict from POST https://community-api-secure.probation.service.justice.gov.uk/secure/offenders/crn/D889766/appointments/1761440075/reschedule/context/commissioned-rehabilitation-services",
        "{}",
        RuntimeException()
      ).userMessage
    ).isEqualTo("The appointment conflicts with another. Please contact the service user's probation practitioner for an available slot and try again")

    assertThat(
      CommunityApiCallError(
        GONE,
        "An unrecognised issue 'A123' and 234566",
        "{}",
        RuntimeException()
      ).userMessage
    ).isEqualTo("Delius reported \"An unrecognised issue 'A123' and 234566\". Please correct, if possible, otherwise contact support")

    assertThat(
      CommunityApiCallError(
        SERVICE_UNAVAILABLE,
        "Any message",
        "{}",
        RuntimeException()
      ).userMessage
    ).isEqualTo("System is experiencing issues. Please try again later and if the issue persists contact Support")
  }
}
