package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import org.springframework.stereotype.Service
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.EndOfServiceReport
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Referral
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.AuthUserRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.EndOfServiceReportRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ReferralRepository
import java.time.OffsetDateTime
import java.util.UUID
import javax.persistence.EntityNotFoundException

@Service
class EndOfServiceReportService(
  val authUserRepository: AuthUserRepository,
  val referralRepository: ReferralRepository,
  val endOfServiceReportRepository: EndOfServiceReportRepository,
) {

  fun createEndOfServiceReport(
    referralId: UUID,
    createdByUser: AuthUser
  ): EndOfServiceReport {
    val referral = getReferral(referralId)

    val endOfServiceReport = EndOfServiceReport(
      id = UUID.randomUUID(),
      createdBy = authUserRepository.save(createdByUser),
      createdAt = OffsetDateTime.now(),
    )

    val savedEndOfServiceReport = endOfServiceReportRepository.save(endOfServiceReport)
    referral.endOfServiceReport = endOfServiceReport
    referralRepository.save(referral)

    return savedEndOfServiceReport
  }

  fun getEndOfServiceReport(endOfServiceReportId: UUID): EndOfServiceReport {
    return endOfServiceReportRepository.findById(endOfServiceReportId).orElseThrow {
      throw EntityNotFoundException("End of service report not found [id=$endOfServiceReportId]")
    }
  }

  private fun getReferral(referralId: UUID): Referral {
    return referralRepository.findById(referralId).orElseThrow {
      throw EntityNotFoundException("referral not found [id=$referralId]")
    }
  }
}
