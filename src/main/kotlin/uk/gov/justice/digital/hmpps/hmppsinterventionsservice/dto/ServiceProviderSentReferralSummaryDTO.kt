import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ServiceProviderSentReferralSummary
import java.time.OffsetDateTime
import java.time.ZoneOffset
import java.util.UUID

class ServiceProviderSentReferralSummaryDTO(
  val referralId: UUID,
  val sentAt: OffsetDateTime,
  val referenceNumber: String,
  val interventionTitle: String,
  val assignedToUserName: String?,
  val serviceUserFirstName: String?,
  val serviceUserLastName: String?,
) {
  companion object {
    fun from(sentReferralSummary: ServiceProviderSentReferralSummary): ServiceProviderSentReferralSummaryDTO {
      return ServiceProviderSentReferralSummaryDTO(
        referralId = sentReferralSummary.referralId,
        sentAt = OffsetDateTime.ofInstant(sentReferralSummary.sentAt, ZoneOffset.UTC),
        referenceNumber = sentReferralSummary.referenceNumber,
        interventionTitle = sentReferralSummary.interventionTitle,
        assignedToUserName = sentReferralSummary.assignedToUserName,
        serviceUserFirstName = sentReferralSummary.serviceUserFirstName,
        serviceUserLastName = sentReferralSummary.serviceUserLastName,
      )
    }
  }
}
