package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import org.springframework.stereotype.Component

@Component
class ReferralReferenceGenerator {
  fun generate(): String {
    return "HDJ2123F"
  }
}
