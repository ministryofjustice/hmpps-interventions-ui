package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ReferralDetails
import java.util.UUID

interface ReferralDetailsRepository: JpaRepository<ReferralDetails, UUID> {
  @Query("select rd from ReferralDetails rd where rd.referralId = :referralId and rd.supersededById is null")
  fun findLatestByReferralId(referralId: UUID): ReferralDetails?

  @Query("select rd from ReferralDetails rd where rd.supersededById = :currentId")
  fun getPreviousVersion(currentId: UUID): ReferralDetails?
}