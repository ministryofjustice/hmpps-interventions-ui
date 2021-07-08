package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.exception

import org.springframework.http.HttpStatus

/**
User Recoverable Bad Requests
=============================
1) Historic appointment booking
res.body={"status":400,"errorCode":null,"userMessage":"Contact type 'CRSSAA' requires an outcome type as the contact date is in the past '2021-06-29'","developerMessage":"Contact type 'CRSSAA' requires an outcome type as the contact date is in the past '2021-06-29'","moreInfo":null}
2) Appointment spanning midnight
res.body={"status":400,"errorCode":null,"userMessage":"Validation failure: startTime endTime must be after or equal to startTime, endTime endTime must be after or equal to startTime","developerMessage":"Validation failed for argument [0] in public org.springframework.http.ResponseEntity<uk.gov.justice.digital.hmpps.deliusapi.dto.v1.contact.ContactDto> uk.gov.justice.digital.hmpps.deliusapi.controller.v1.ContactController.createContact(uk.gov.justice.digital.hmpps.deliusapi.dto.v1.contact.NewContact) with 2 errors: [Field error in object 'newContact' on field 'startTime': rejected value [13:00]; codes [TimeRanges.newContact.startTime,TimeRanges.startTime,TimeRanges.java.time.LocalTime,TimeRanges]; arguments [org.springframework.context.support.DefaultMessageSourceResolvable: codes [newContact.startTime,startTime]; arguments []; default message [startTime]]; default message [endTime must be after or equal to startTime]] [Field error in object 'newContact' on field 'endTime': rejected value [01:00]; codes [TimeRanges.newContact.endTime,TimeRanges.endTime,TimeRanges.java.time.LocalTime,TimeRanges]; arguments [org.springframework.context.support.DefaultMessageSourceResolvable: codes [newCon...
3) Sentence with multiple RARs
res.body={"status":400,"developerMessage":"CRN: E376578 EventId: 1502929161 has multiple referral requirements"}
4) Cannot find NSI
res.body={"status":400,"developerMessage":"Cannot find NSI for CRN: M190420 Sentence: 1503032340 and ContractType ACC"}
5) Schedule appointment conflict
res.body=409 Conflict from POST https://community-api-secure.probation.service.justice.gov.uk/secure/offenders/crn/E188275/sentence/1503090023/appointments/context/commissioned-rehabilitation-services
6) Reschedule appointment conflict
res.body=409 Conflict from POST https://community-api-secure.probation.service.justice.gov.uk/secure/offenders/crn/D889766/appointments/1761440075/reschedule/context/commissioned-rehabilitation-services

Error categories after (Replace [A-Z]*[0-9]+ with _ and Replace '[A-Z0-9]*' with '_')
=====================================================================================
1) Contact type '_' requires an outcome type as the contact date is in the past '_-_-_'
2) Validation failure: startTime endTime must be after or equal to startTime, endTime endTime must be after or equal to startTime"
3) CRN: _ EventId: _ has multiple referral requirements
4) Cannot find NSI for CRN: _ Sentence: _ and ContractType ACC
5) _ Conflict from POST https://community-api-secure.probation.service.justice.gov.uk/secure/offenders/crn/_/sentence/_/appointments/context/commissioned-rehabilitation-services
6) _ Conflict from POST https://community-api-secure.probation.service.justice.gov.uk/secure/offenders/crn/_/appointments/_/reschedule/context/commissioned-rehabilitation-services*/

class CommunityApiCallError(val httpStatus: HttpStatus, causeMessage: String, val responseBody: String, val exception: Throwable) :
  RuntimeException(
    exception
  ) {
  val category = errorCategoryByRemovingIdentifiers(causeMessage)
  val userMessage = when {
    httpStatus.is4xxClientError -> {
      when {
        category.contains("Contact type .* requires an outcome type as the contact date is in the past".toRegex()) -> {
          "Delius requires an appointment to only be made for today or in the future. Please amend and try again"
        }
        category.contains("endTime must be after or equal to startTime".toRegex()) -> {
          "Delius requires that an appointment must end on the same day it starts. Please amend and try again"
        }
        category.contains("CRN: _ EventId: _ has multiple referral requirements".toRegex()) -> {
          "The Service User Sentence must not contain more than one active rehabilitation activity requirement. Please correct in Delius and try again"
        }
        category.contains("Cannot find NSI for CRN: _ Sentence: _ and ContractType".toRegex()) -> {
          "There has been an error during creating the Delius NSI. We are aware of this issue. For follow-up, please contact support"
        }
        category.contains("Multiple existing matching NSIs found".toRegex()) -> {
          "There has been an error during creating the Delius NSI. We are aware of this issue. For follow-up, please contact support"
        }
        category.contains("Conflict.*appointments".toRegex()) -> {
          "The appointment conflicts with another. Please contact the service user's probation practitioner for an available slot and try again"
        }
        category.contains("Conflict.*reschedule".toRegex()) -> {
          "The appointment conflicts with another. Please contact the service user's probation practitioner for an available slot and try again"
        }
        else -> {
          "Delius reported \"$causeMessage\". Please correct, if possible, otherwise contact support"
        }
      }
    }
    else -> {
      "System is experiencing issues. Please try again later and if the issue persists contact Support"
    }
  }

  private fun errorCategoryByRemovingIdentifiers(message: String): String {
    return "[A-Z]*[0-9]+".toRegex().replace(message, "_")
  }
}
