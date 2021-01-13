package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity

import java.util.Date
import java.util.UUID
import javax.persistence.Column
import javax.persistence.Entity
import javax.persistence.EnumType
import javax.persistence.Enumerated
import javax.persistence.Id
import javax.persistence.JoinColumn
import javax.persistence.MapsId
import javax.persistence.OneToOne

// this is enumerated in this way since the only use for this data is to
// refer service users to male or female specific services. the nuance of
// 21st century gender identity does not yet play a role in this process.
enum class Sex {
  MALE, FEMALE
}

@Entity
data class ServiceUser(
  var title: String? = null,
  var firstName: String? = null,
  var lastName: String? = null,
  var otherNames: String? = null,
  @Column(name = "dob", columnDefinition = "DATE") var dob: Date? = null,
  @Enumerated(EnumType.STRING) var sex: Sex? = null,
  var address: String? = null,
  var needs: String? = null,
  var preferredLanguage: String? = null,
  var religionOrBelief: String? = null,
  var sexualOrientation: String? = null,
  var disabilities: String? = null,
  var ethnicity: String? = null,
  var pncNumber: String? = null,
  var crn: String? = null,
  var nomisNumber: String? = null,

  @OneToOne @MapsId @JoinColumn(name = "referral_id") var referral: Referral? = null,
  @Id @Column(name = "referral_id") var id: UUID? = null,
)
