package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto

import org.assertj.core.api.Assertions
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.json.JsonTest
import org.springframework.boot.test.json.JacksonTester
import java.time.LocalDate

@JsonTest
class ServiceUserDTOTest(@Autowired private val json: JacksonTester<ServiceUserDTO>) {
  @Test
  fun `test deserialization of service user details`() {
    val serviceUser = json.parseObject(
      """
          {
            "crn": "CRN11",
            "title": "Accepted",
            "firstName": "KEN",
            "lastName": "BARLOW",
            "dateOfBirth": "2059-08-09",
            "gender": "Accepted",
            "ethnicity": "Accepted",
            "preferredLanguage": "Accepted",
            "religionOrBelief": "Accepted",
            "disabilities": [
              "prosthetic left leg",
              "blindness"
            ]
          }
      """
    )
    Assertions.assertThat(serviceUser.dateOfBirth).isEqualTo(LocalDate.of(2059, 8, 9))
    Assertions.assertThat(serviceUser.disabilities).isEqualTo(listOf("prosthetic left leg", "blindness"))
  }
}
