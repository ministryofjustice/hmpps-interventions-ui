package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository

import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Intervention
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.NPSRegion
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.PCCRegion
import javax.persistence.EntityManager
import javax.persistence.PersistenceContext
import javax.persistence.criteria.CriteriaBuilder
import javax.persistence.criteria.Predicate
import javax.persistence.criteria.Root

class InterventionFilterRepositoryImpl(
  private val pccRegionRepository: PCCRegionRepository
) : InterventionFilterRepository {

  @PersistenceContext
  private lateinit var entityManager: EntityManager

  override fun findByCriteria(locations: List<String>): List<Intervention> {
    return findByCriteria(locations, null, null)
  }

  private fun findByCriteria(locations: List<String>, gender: String?, ageCategory: String?): List<Intervention> {

    val criteriaBuilder = entityManager.criteriaBuilder
    val criteriaQuery = criteriaBuilder.createQuery(Intervention::class.java)
    val root = criteriaQuery.from(Intervention::class.java)

    val locationPredicate: Predicate? = getRegionPredicate(criteriaBuilder, root, locations)
    val genderPredicate: Predicate? = getGenderPredicate(criteriaBuilder, root, gender)
    val ageCategoryPredicate: Predicate? = getAgeCategoryPredicate(criteriaBuilder, root, ageCategory)

    val predicates = listOfNotNull(locationPredicate, genderPredicate, ageCategoryPredicate)
    val finalPredicate: Predicate = criteriaBuilder.and(*predicates.toTypedArray())

    criteriaQuery.where(finalPredicate)
    return entityManager.createQuery(criteriaQuery).resultList
  }

  private fun getRegionPredicate(criteriaBuilder: CriteriaBuilder, root: Root<Intervention>, locations: List<String>): Predicate? {

    if (locations.isNullOrEmpty()) {
      return null
    }

    val pccRegionPredicate = getPccRegionPredicate(root, locations)
    val npsRegionPredicate = getNpsRegionPredicate(root, locations)
    return criteriaBuilder.or(pccRegionPredicate, npsRegionPredicate)
  }

  private fun getPccRegionPredicate(root: Root<Intervention>, locations: List<String>): Predicate {

    val expression = root.get<Any>("dynamicFrameworkContract").get<PCCRegion>("pccRegion").get<String>("id")
    return expression.`in`(locations)
  }

  private fun getNpsRegionPredicate(root: Root<Intervention>, locations: List<String>): Predicate {

    val expression = root.get<Any>("dynamicFrameworkContract").get<NPSRegion>("npsRegion").get<Char>("id")
    val npsRegions = pccRegionRepository.findAllByIdIn(locations).map { it.npsRegion.id }.distinct()
    return expression.`in`(npsRegions)
  }

  private fun getGenderPredicate(criteriaBuilder: CriteriaBuilder?, root: Root<Intervention>?, gender: String?): Predicate? {

    if (gender.isNullOrEmpty()) {
      return null
    }

    TODO("Not yet implemented")
  }

  private fun getAgeCategoryPredicate(criteriaBuilder: CriteriaBuilder?, root: Root<Intervention>?, ageCategory: String?): Predicate? {

    if (ageCategory.isNullOrEmpty()) {
      return null
    }

    TODO("Not yet implemented")
  }
}
