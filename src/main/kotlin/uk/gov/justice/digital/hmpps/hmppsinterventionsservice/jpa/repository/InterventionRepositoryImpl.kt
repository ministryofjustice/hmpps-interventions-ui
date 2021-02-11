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

class InterventionRepositoryImpl(
  val pccRegionRepository: PCCRegionRepository
) : InterventionFilterRepository {

  @PersistenceContext
  private lateinit var entityManager: EntityManager

  override fun findByCriteria(criteria: MutableMap<String, Array<String>>): List<Intervention>{
    val locations: List<String> = listOf("avon-and-somerset", "devon-and-cornwall")

    val criteriaBuilder: CriteriaBuilder = entityManager.getCriteriaBuilder()
    val criteriaQuery: CriteriaQuery<Intervention> = criteriaBuilder.createQuery(Intervention::class.java)
    val root: Root<Intervention> = criteriaQuery.from(Intervention::class.java)
    val predicateList: MutableList<Predicate> = mutableListOf()

    if(criteria.containsKey("location")) {
      val predicateForLocation: Predicate = getLocationPredicate(criteriaBuilder, root, locations)
      predicateList.add(predicateForLocation)
    }

    //Example of how more filters could be appended
    if(criteria.containsKey("description")) {
      val predicateForDescription: Predicate = criteriaBuilder.equal(root.get<Any>("description"), "The service aims are to support in securing settled accommodation.")
      predicateList.add(predicateForDescription)
    }

    val finalPredicate: Predicate = criteriaBuilder.and(*predicateList.toTypedArray())

    criteriaQuery.where(finalPredicate)
    return entityManager.createQuery(criteriaQuery).resultList
  }

  private fun getLocationPredicate(criteriaBuilder: CriteriaBuilder, root: Root<Intervention>, locations: List<String>): Predicate {
    val pccRegions: List<PCCRegion> = pccRegionRepository.findAllByIdIn(locations)

    val npsRegionList: MutableList<Char> = mutableListOf()
    for(region in pccRegions){
      if (!npsRegionList.contains(region.npsRegion.id)){
        npsRegionList.add(region.npsRegion.id)
      }
    }

    val exp1: Expression<String> = root.get<Any>("dynamicFrameworkContract").get<PCCRegion>("pccRegion").get<String>("id")
    val pccRegionPredicate: Predicate = exp1.`in`(locations)

    val exp2: Expression<Char> = root.get<Any>("dynamicFrameworkContract").get<NPSRegion>("npsRegion").get<Char>("id")
    val npsRegionPredicate: Predicate = exp2.`in`(npsRegionList)

    return criteriaBuilder.or(pccRegionPredicate, npsRegionPredicate)
  }


}