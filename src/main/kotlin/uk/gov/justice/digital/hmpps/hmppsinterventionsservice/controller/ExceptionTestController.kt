package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller

import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RestController

@RestController
class ExceptionTestController {

  @GetMapping("/exception")
  fun getException() {
    throw Exception("testing - remove later")
  }
}
