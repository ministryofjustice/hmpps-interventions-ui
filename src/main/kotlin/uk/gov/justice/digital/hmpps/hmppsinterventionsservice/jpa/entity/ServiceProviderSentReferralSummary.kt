package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity

import java.time.Instant
import java.util.UUID

data class ServiceProviderSentReferralSummary(
  val referralId: String,
  val sentAt: Instant,
  val referenceNumber: String,
  val interventionTitle: String,
  val dynamicFrameWorkContractId: String,
  val assignedToUserName: String?,
  val serviceUserFirstName: String?,
  val serviceUserLastName: String?,
  val endOfServiceReportId: UUID?,
  val endOfServiceReportSubmittedAt: Instant?
)