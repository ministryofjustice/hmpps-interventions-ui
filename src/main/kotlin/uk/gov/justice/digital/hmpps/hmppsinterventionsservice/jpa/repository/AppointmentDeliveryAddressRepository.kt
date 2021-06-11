package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository

import org.springframework.data.jpa.repository.JpaRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AppointmentDeliveryAddress
import java.util.UUID

interface AppointmentDeliveryAddressRepository : JpaRepository<AppointmentDeliveryAddress, UUID>
