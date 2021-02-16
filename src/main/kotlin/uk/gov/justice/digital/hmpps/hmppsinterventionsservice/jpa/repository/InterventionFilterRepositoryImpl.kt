package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository

import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.DynamicFrameworkContract
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

  override fun findByCriteria(pccRegionIds: List<String>, allowsFemale: Boolean?, allowsMale: Boolean?, minimumAge: Int?, maximumAge: Int?): List<Intervention> {

    val criteriaBuilder = entityManager.criteriaBuilder
    val criteriaQuery = criteriaBuilder.createQuery(Intervention::class.java)
    val root = criteriaQuery.from(Intervention::class.java)

    val regionPredicate: Predicate? = getRegionPredicate(criteriaBuilder, root, pccRegionIds)
    val allowsFemalePredicate: Predicate? = getAllowsFemalePredicate(criteriaBuilder, root, allowsFemale)
    val allowsMalePredicate: Predicate? = getAllowsMalePredicate(criteriaBuilder, root, allowsMale)
    val minimumAgePredicate: Predicate? = getMinimumAgePredicate(criteriaBuilder, root, minimumAge)
    val maximumAgePredicate: Predicate? = getMaximumAgePredicate(criteriaBuilder, root, maximumAge)

    val predicates = listOfNotNull(regionPredicate, allowsFemalePredicate, allowsMalePredicate, minimumAgePredicate, maximumAgePredicate)
    val finalPredicate: Predicate = criteriaBuilder.and(*predicates.toTypedArray())

    criteriaQuery.where(finalPredicate)
    return entityManager.createQuery(criteriaQuery).resultList
  }

  private fun getRegionPredicate(criteriaBuilder: CriteriaBuilder, root: Root<Intervention>, pccRegionIds: List<String>): Predicate? {

    if (pccRegionIds.isNullOrEmpty()) {
      return null
    }

    val pccRegionPredicate = getPccRegionPredicate(root, pccRegionIds)
    val npsRegionPredicate = getNpsRegionPredicate(root, pccRegionIds)
    return criteriaBuilder.or(pccRegionPredicate, npsRegionPredicate)
  }

  private fun getPccRegionPredicate(root: Root<Intervention>, pccRegionIds: List<String>): Predicate {

    val expression = root.get<DynamicFrameworkContract>("dynamicFrameworkContract").get<PCCRegion>("pccRegion").get<String>("id")
    return expression.`in`(pccRegionIds)
  }

  private fun getNpsRegionPredicate(root: Root<Intervention>, pccRegionIds: List<String>): Predicate {

    val expression = root.get<DynamicFrameworkContract>("dynamicFrameworkContract").get<NPSRegion>("npsRegion").get<Char>("id")
    val npsRegions = pccRegionRepository.findAllByIdIn(pccRegionIds).map { it.npsRegion.id }.distinct()
    return expression.`in`(npsRegions)
  }

  private fun getAllowsFemalePredicate(criteriaBuilder: CriteriaBuilder, root: Root<Intervention>, allowsFemale: Boolean?): Predicate? {
    if (allowsFemale == null) {
      return null
    }
    return criteriaBuilder.equal(root.get<DynamicFrameworkContract>("dynamicFrameworkContract")?.get<Boolean>("allowsFemale"), allowsFemale)
  }

  private fun getAllowsMalePredicate(criteriaBuilder: CriteriaBuilder, root: Root<Intervention>, allowsMale: Boolean?): Predicate? {
    if (allowsMale == null) {
      return null
    }
    return criteriaBuilder.equal(root.get<DynamicFrameworkContract>("dynamicFrameworkContract")?.get<Boolean>("allowsMale"), allowsMale)
  }

  private fun getMinimumAgePredicate(criteriaBuilder: CriteriaBuilder, root: Root<Intervention>, minimumAge: Int?): Predicate? {

    return minimumAge?.let {
      val expression = root.get<DynamicFrameworkContract>("dynamicFrameworkContract").get<Int>("minimumAge")
      criteriaBuilder.equal(expression, minimumAge)
    }
  }

  private fun getMaximumAgePredicate(criteriaBuilder: CriteriaBuilder, root: Root<Intervention>, maximumAge: Int?): Predicate? {

    return maximumAge?.let {
      val expression = root.get<DynamicFrameworkContract>("dynamicFrameworkContract").get<Int>("maximumAge")
      criteriaBuilder.equal(expression, maximumAge)
    }
  }
}
