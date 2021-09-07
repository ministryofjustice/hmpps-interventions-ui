package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util

import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser

class AuthUserFactory(em: TestEntityManager? = null) : EntityFactory(em) {
  fun createSP(userName: String = "sp_user", id: String = "sp_id"): AuthUser {
    return create(authSource = "auth", userName = userName, id = id)
  }

  fun createPP(userName: String = "pp_user", id: String = "pp_id"): AuthUser {
    return create(authSource = "delius", userName = userName, id = id)
  }

  fun create(
    id: String = "123456",
    authSource: String = "delius",
    userName: String = "bernard.beaks"
  ): AuthUser {
    return save(AuthUser(id, authSource, userName))
  }
}
