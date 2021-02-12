package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository

import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Intervention
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.NPSRegion
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.PCCRegion
import javax.persistence.EntityManager
import javax.persistence.PersistenceContext
import javax.persistence.criteria.CriteriaBuilder
import javax.persistence.criteria.CriteriaQuery
import javax.persistence.criteria.Expression
import javax.persistence.criteria.Predicate
import javax.persistence.criteria.Root

class InterventionFilterRepositoryImpl(
  private val pccRegionRepository: PCCRegionRepository
) : InterventionFilterRepository {

  @PersistenceContext
  private lateinit var entityManager: EntityManager

  override fun findByCriteria(locations: List<String>): List<Intervention>{

    val criteriaBuilder: CriteriaBuilder = entityManager.criteriaBuilder
    val criteriaQuery: CriteriaQuery<Intervention> = criteriaBuilder.createQuery(Intervention::class.java)
    val root: Root<Intervention> = criteriaQuery.from(Intervention::class.java)
    val predicateList: MutableList<Predicate> = mutableListOf()

    if(locations.isNotEmpty()) {
      val predicateForLocation: Predicate = getLocationPredicate(criteriaBuilder, root, locations)
      predicateList.add(predicateForLocation)
    }

    val finalPredicate: Predicate = criteriaBuilder.and(*predicateList.toTypedArray())
    criteriaQuery.where(finalPredicate)
    return entityManager.createQuery(criteriaQuery).resultList
  }

  private fun getLocationPredicate(criteriaBuilder: CriteriaBuilder, root: Root<Intervention>, locations: List<String>): Predicate {

     val npsRegionList: MutableList<Char> = pccRegionRepository.findAllByIdIn(locations)
        .map { it.npsRegion.id }.distinct().toMutableList()

    val exp1: Expression<String> = root.get<Any>("dynamicFrameworkContract").get<PCCRegion>("pccRegion").get<String>("id")
    val pccRegionPredicate: Predicate = exp1.`in`(locations)

    val exp2: Expression<Char> = root.get<Any>("dynamicFrameworkContract").get<NPSRegion>("npsRegion").get<Char>("id")
    val npsRegionPredicate: Predicate = exp2.`in`(npsRegionList)

    return criteriaBuilder.or(pccRegionPredicate, npsRegionPredicate)
  }
}
