package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util

import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser

class AuthUserFactory(em: TestEntityManager? = null) : EntityFactory(em) {
  fun create(
    id: String = "123456",
    authSource: String = "delius",
    userName: String = "bernard.beaks"
  ): AuthUser {
    return save(AuthUser(id, authSource, userName))
  }
}
