package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository

import org.springframework.data.jpa.repository.JpaRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.EndOfServiceReport
import java.util.UUID

interface EndOfServiceReportRepository : JpaRepository<EndOfServiceReport, UUID>
