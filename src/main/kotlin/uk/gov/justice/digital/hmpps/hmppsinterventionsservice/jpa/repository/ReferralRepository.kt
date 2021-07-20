package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Referral
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ServiceProvider
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ServiceProviderSentReferralSummary
import java.util.UUID

interface ReferralRepository : JpaRepository<Referral, UUID> {
  @Query(
    value = """select sentAt,
			referenceNumber,
			assignedToUserName,
			interventionTitle,
			serviceUserFirstName,
			serviceUserLastName from (	
	select
			cast(r.id as varchar) AS referralId,
			cast(r.sent_at as TIMESTAMP WITH TIME ZONE) as sentAt,
			r.reference_number as referenceNumber,
      dfc.id as dynamicFrameworkContractId,
			au.user_name as assignedToUserName,
			i.title as interventionTitle,
			rsud.first_name as serviceUserFirstName,
			rsud.last_name as serviceUserLastName,
			row_number() over(partition by r.id order by ra.assigned_at desc) as assigned_at_desc_seq		
	from referral r
			 inner join intervention i on i.id = r.intervention_id
			 inner join referral_service_user_data rsud on rsud.referral_id = r.id
			 inner join dynamic_framework_contract dfc on dfc.id = i.dynamic_framework_contract_id
			 left join dynamic_framework_contract_sub_contractor dfcsc on dfcsc.dynamic_framework_contract_id = dfc.id
			 left join referral_assignments ra on ra.referral_id = r.id
			 left join auth_user au on au.id = ra.assigned_to_id
			 left join end_of_service_report eosr on eosr.referral_id = r.id
	where
		  r.sent_at is not null
		  and not (r.concluded_At is not null
			and r.end_Requested_At is not null
			and eosr.id is null)
		and ( dfc.prime_provider_id in :serviceProviders or dfcsc.subcontractor_provider_id in :serviceProviders )
) a where assigned_at_desc_seq = 1""",
    nativeQuery = true
  )
  fun referralSummaryForServiceProviders(serviceProviders: List<String>): List<ServiceProviderSentReferralSummary>

  // queries for service providers
  fun findAllByInterventionDynamicFrameworkContractPrimeProviderInAndSentAtIsNotNull(providers: Iterable<ServiceProvider>): List<Referral>
  fun findAllByInterventionDynamicFrameworkContractSubcontractorProvidersInAndSentAtIsNotNull(providers: Iterable<ServiceProvider>): List<Referral>

  // queries for sent referrals
  fun findByIdAndSentAtIsNotNull(id: UUID): Referral?
  fun findByCreatedByAndSentAtIsNotNull(user: AuthUser): List<Referral>
  fun existsByReferenceNumber(reference: String): Boolean
  fun findByServiceUserCRNAndSentAtIsNotNull(crn: String): List<Referral>

  // queries for draft referrals
  fun findByIdAndSentAtIsNull(id: UUID): Referral?
  fun findByCreatedByIdAndSentAtIsNull(userId: String): List<Referral>
}
