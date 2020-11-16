package uk.gov.justice.digital.hmpps.hmppsinterventionsservice

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication()
class HmppsInterventionsService

fun main(args: Array<String>) {
  runApplication<HmppsInterventionsService>(*args)
}
