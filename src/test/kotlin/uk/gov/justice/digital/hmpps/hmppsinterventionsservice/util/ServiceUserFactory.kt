package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util

import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Referral
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ServiceUserData

class ServiceUserFactory(em: TestEntityManager? = null) : EntityFactory(em) {
  private val referralFactory = ReferralFactory(em)
  fun create(
    firstName: String? = null,
    lastName: String? = null,
    referral: Referral = referralFactory.createSent()
  ): ServiceUserData {
    return save(
      ServiceUserData(
        firstName = firstName,
        lastName = lastName,
        referral = referral,
        referralID = referral.id
      )
    )
  }
}
