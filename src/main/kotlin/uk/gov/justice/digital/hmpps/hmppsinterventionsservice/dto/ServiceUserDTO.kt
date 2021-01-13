package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto

import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ServiceUser
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
    fun from(serviceUser: ServiceUser?): ServiceUserDTO? {
      return serviceUser?.let {
        ServiceUserDTO(
          pncNumber = serviceUser.pncNumber,
          crn = serviceUser.crn,
          nomisNumber = serviceUser.nomisNumber,
          dob = serviceUser.dob,
          sex = serviceUser.sex,
          ethnicity = serviceUser.ethnicity,
          title = serviceUser.title,
          firstName = serviceUser.firstName,
          lastName = serviceUser.lastName,
          otherNames = serviceUser.otherNames,
          address = serviceUser.address,
          needs = serviceUser.needs,
          preferredLanguage = serviceUser.preferredLanguage,
          religionOrBelief = serviceUser.religionOrBelief,
          sexualOrientation = serviceUser.sexualOrientation,
          disabilities = serviceUser.disabilities,
        )
      }
    }
  }
}
