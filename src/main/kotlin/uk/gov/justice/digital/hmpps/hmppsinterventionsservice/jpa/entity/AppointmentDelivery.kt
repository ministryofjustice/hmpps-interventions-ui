package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity

import com.vladmihalcea.hibernate.type.basic.PostgreSQLEnumType
import org.hibernate.annotations.Type
import org.hibernate.annotations.TypeDef
import java.util.UUID
import javax.persistence.Entity
import javax.persistence.EnumType
import javax.persistence.Enumerated
import javax.persistence.Id
import javax.persistence.OneToOne
import javax.persistence.PrimaryKeyJoinColumn
import javax.validation.constraints.NotNull

@Entity
@TypeDef(name = "appointment_delivery_type", typeClass = PostgreSQLEnumType::class)
data class AppointmentDelivery(
  @Id
  var appointmentId: UUID,
  @Type(type = "appointment_delivery_type")
  @Enumerated(EnumType.STRING)
  @NotNull var appointmentDeliveryType: AppointmentDeliveryType,
  var npsOfficeCode: String? = null,
  @OneToOne
  @PrimaryKeyJoinColumn
  var appointmentDeliveryAddress: AppointmentDeliveryAddress? = null,
)

enum class AppointmentDeliveryType {
  PHONE_CALL,
  VIDEO_CALL,
  IN_PERSON_MEETING_PROBATION_OFFICE,
  IN_PERSON_MEETING_OTHER;
}
