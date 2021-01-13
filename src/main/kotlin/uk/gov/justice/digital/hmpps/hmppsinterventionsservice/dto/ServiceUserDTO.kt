package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto

import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ServiceUserData
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Sex
import java.util.Date

data class ServiceUserDTO(
  var pncNumber: String? = null,
  var crn: String? = null,
  var nomisNumber: String? = null,
  var dob: Date? = null,
  var sex: Sex? = null,
  var ethnicity: String? = null,
  var title: String? = null,
  var firstName: String? = null,
  var lastName: String? = null,
  var otherNames: String? = null,
  var address: String? = null,
  var needs: String? = null,
  var preferredLanguage: String? = null,
  var religionOrBelief: String? = null,
  var sexualOrientation: String? = null,
  var disabilities: String? = null,
) {
  companion object {
    fun from(crn: String, serviceUserData: ServiceUserData?): ServiceUserDTO {
      val dto = ServiceUserDTO(crn = crn)
      serviceUserData?.let {
        dto.crn = crn
        dto.pncNumber = serviceUserData.pncNumber
        dto.nomisNumber = serviceUserData.nomisNumber
        dto.dob = serviceUserData.dob
        dto.sex = serviceUserData.sex
        dto.ethnicity = serviceUserData.ethnicity
        dto.title = serviceUserData.title
        dto.firstName = serviceUserData.firstName
        dto.lastName = serviceUserData.lastName
        dto.otherNames = serviceUserData.otherNames
        dto.address = serviceUserData.address
        dto.needs = serviceUserData.needs
        dto.preferredLanguage = serviceUserData.preferredLanguage
        dto.religionOrBelief = serviceUserData.religionOrBelief
        dto.sexualOrientation = serviceUserData.sexualOrientation
        dto.disabilities = serviceUserData.disabilities
      }
      return dto
    }
  }
}
