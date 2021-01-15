package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity

import java.util.Date
import java.util.UUID
import javax.persistence.Column
import javax.persistence.Entity
import javax.persistence.Id
import javax.persistence.JoinColumn
import javax.persistence.MapsId
import javax.persistence.OneToOne
import javax.persistence.Table

@Entity
@Table(name = "referral_service_user_data")
data class ServiceUserData(
  var title: String? = null,
  var firstName: String? = null,
  var lastName: String? = null,
  @Column(name = "dob", columnDefinition = "DATE") var dob: Date? = null,
  var gender: String? = null,
  var ethnicity: String? = null,
  var preferredLanguage: String? = null,
  var religionOrBelief: String? = null,
  var disabilities: String? = null,

  @OneToOne @MapsId @JoinColumn(name = "referral_id") var referral: Referral? = null,
  @Id @Column(name = "referral_id") var referralID: UUID? = null,
)
