package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util

import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager

open class EntityFactory(val em: TestEntityManager?) {
  inline fun <reified T> save(t: T): T {
    if (em == null) {
      return t
    }

    // if the entity exists, update it. otherwise, save it.
    if (em.find(T::class.java, em.entityManager.entityManagerFactory.persistenceUnitUtil.getIdentifier(t)) == null) {
      em.persist(t)
    } else {
      em.merge(t)
    }
    em.flush()
    return t
  }
}
