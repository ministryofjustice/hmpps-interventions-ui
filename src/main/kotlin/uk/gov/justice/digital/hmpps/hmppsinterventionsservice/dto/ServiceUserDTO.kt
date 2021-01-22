package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto

import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ServiceUserData
import java.util.Date

data class ServiceUserDTO(
  var crn: String? = null,
  var title: String? = null,
  var firstName: String? = null,
  var lastName: String? = null,
  var dob: Date? = null,
  var gender: String? = null,
  var ethnicity: String? = null,
  var preferredLanguage: String? = null,
  var religionOrBelief: String? = null,
  var disabilities: List<String>? = null,
) {
  companion object {
    fun from(crn: String, serviceUserData: ServiceUserData?): ServiceUserDTO {
      val dto = ServiceUserDTO(crn = crn)
      serviceUserData?.let {
        dto.crn = crn
        dto.title = serviceUserData.title
        dto.firstName = serviceUserData.firstName
        dto.lastName = serviceUserData.lastName
        dto.dob = serviceUserData.dob
        dto.gender = serviceUserData.gender
        dto.ethnicity = serviceUserData.ethnicity
        dto.preferredLanguage = serviceUserData.preferredLanguage
        dto.religionOrBelief = serviceUserData.religionOrBelief
        dto.disabilities = serviceUserData.disabilities
      }
      return dto
    }
  }
}
