package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository

import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ServiceProviderSentReferralSummary
import java.sql.Timestamp
import java.time.Instant
import java.util.UUID
import javax.persistence.EntityManager
import javax.persistence.PersistenceContext

class ReferralSummaryRepositoryImpl : ReferralSummaryRepository {

  @PersistenceContext
  private lateinit var entityManager: EntityManager

  private fun summariesQuery(customCriteria: String?): String {
    val dashboardRestrictionCriteria = customCriteria?.let { " $customCriteria " } ?: ""
    return """select 
      referralId, 
      sentAt,
			referenceNumber,
			interventionTitle,
      dynamicFrameworkContractId,
			assignedToUserName,
			serviceUserFirstName,
			serviceUserLastName,
      endOfServiceReportId,
      endOfServiceReportSubmittedAt from (	
	select
			cast(r.id as varchar) AS referralId,
			cast(r.sent_at as TIMESTAMP WITH TIME ZONE) as sentAt,
			r.reference_number as referenceNumber,
      cast(dfc.id as varchar) as dynamicFrameworkContractId,
			au.user_name as assignedToUserName,
			i.title as interventionTitle,
			rsud.first_name as serviceUserFirstName,
			rsud.last_name as serviceUserLastName,
      cast(eosr.id as varchar) as endOfServiceReportId,
      cast(eosr.submitted_at as TIMESTAMP WITH TIME ZONE) as endOfServiceReportSubmittedAt,
			row_number() over(partition by r.id order by ra.assigned_at desc) as assigned_at_desc_seq		
	from referral r
			 inner join intervention i on i.id = r.intervention_id
			 left join referral_service_user_data rsud on rsud.referral_id = r.id
			 inner join dynamic_framework_contract dfc on dfc.id = i.dynamic_framework_contract_id
			 left join dynamic_framework_contract_sub_contractor dfcsc on dfcsc.dynamic_framework_contract_id = dfc.id
			 left join referral_assignments ra on ra.referral_id = r.id
			 left join auth_user au on au.id = ra.assigned_to_id
			 left join end_of_service_report eosr on eosr.referral_id = r.id
	where
		  r.sent_at is not null
		  and ( dfc.prime_provider_id in :serviceProviders or dfcsc.subcontractor_provider_id in :serviceProviders )
      and not (r.concluded_At is not null and r.end_Requested_At is not null and eosr.id is null)
      $dashboardRestrictionCriteria
) a where assigned_at_desc_seq = 1"""
  }

  override fun getSentReferralSummaries(serviceProviders: List<String>): List<ServiceProviderSentReferralSummary> {
    val query = entityManager.createNativeQuery(summariesQuery(null))
    query.setParameter("serviceProviders", serviceProviders)
    val result = query.resultList as List<Array<Any>>
    val summaries: MutableList<ServiceProviderSentReferralSummary> = mutableListOf()
    result.forEach { row ->
      val referralId = row[0] as String
      val sentAt = (row[1] as Timestamp).toInstant()
      val referenceNumber = row[2] as String
      val interventionTitle = row[3] as String
      val dynamicFrameWorkContractId = row[4] as String
      val assignedToUserName = row[5] as String?
      val serviceUserFirstName = row[6] as String?
      val serviceUserLastName = row[7] as String?
      val endOfServiceReportId = (row[8] as String?)?.let { UUID.fromString(it) }
      val endOfServiceReportSubmittedAt = (row[9] as Timestamp?)?.toInstant()
      summaries.add(ServiceProviderSentReferralSummary(referralId, sentAt, referenceNumber, interventionTitle, dynamicFrameWorkContractId, assignedToUserName, serviceUserFirstName, serviceUserLastName, endOfServiceReportId, endOfServiceReportSubmittedAt))
    }
    return summaries
  }


}
