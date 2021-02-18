package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.config.Code
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.config.FieldError
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.config.ValidationError
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.DraftReferralDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.SentReferralDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ReferralEventPublisher
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthGroupID
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Referral
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ServiceCategory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ServiceUserData
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.AuthUserRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.InterventionRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ReferralRepository
import java.time.LocalDate
import java.time.OffsetDateTime
import java.util.UUID

@Service
class ReferralService(
  val referralRepository: ReferralRepository,
  val authUserRepository: AuthUserRepository,
  val interventionRepository: InterventionRepository,
  val eventPublisher: ReferralEventPublisher,
  val referenceGenerator: ReferralReferenceGenerator,
) {
  fun getSentReferral(id: UUID): Referral? {
    return referralRepository.findByIdAndSentAtIsNotNull(id)
  }

  fun getAllSentReferrals(): List<SentReferralDTO> {
    return referralRepository.findBySentAtIsNotNull().map { SentReferralDTO.from(it) }
  }

  fun getSentReferralsForServiceProviderID(serviceProviderID: AuthGroupID): List<SentReferralDTO> {
    return referralRepository.findByInterventionDynamicFrameworkContractServiceProviderIdAndSentAtIsNotNull(serviceProviderID)
      .map { SentReferralDTO.from(it) }
  }

  fun sendDraftReferral(referral: Referral, user: AuthUser): Referral {
    referral.sentAt = OffsetDateTime.now()
    referral.sentBy = authUserRepository.save(user)
    referral.referenceNumber = generateReferenceNumber(referral.intervention.dynamicFrameworkContract.serviceCategory)

    val sentReferral = referralRepository.save(referral)
    eventPublisher.referralSentEvent(sentReferral)
    return sentReferral
  }

  fun createDraftReferral(
    user: AuthUser,
    crn: String,
    interventionId: UUID,
    overrideID: UUID? = null,
    overrideCreatedAt: OffsetDateTime? = null
  ): Referral {
    return referralRepository.save(
      Referral(
        id = overrideID ?: UUID.randomUUID(),
        createdAt = overrideCreatedAt ?: OffsetDateTime.now(),
        createdBy = authUserRepository.save(user),
        serviceUserCRN = crn,
        intervention = interventionRepository.getOne(interventionId)
      )
    )
  }

  fun getDraftReferral(id: UUID): Referral? {
    return referralRepository.findByIdAndSentAtIsNull(id)
  }

  private fun validateDraftReferralUpdate(referral: Referral, update: DraftReferralDTO) {
    val errors = mutableListOf<FieldError>()

    update.completionDeadline?.let {
      if (it.isBefore(LocalDate.now())) {
        errors.add(FieldError(field = "completionDeadline", error = Code.DATE_MUST_BE_IN_THE_FUTURE))
      }

      // fixme: error if completion deadline is after sentence end date
    }

    update.complexityLevelId?.let {
      // fixme: error if complexity level not valid for service category
    }

    update.needsInterpreter?.let {
      if (it && update.interpreterLanguage == null) {
        errors.add(FieldError(field = "needsInterpreter", error = Code.CONDITIONAL_FIELD_MUST_BE_SET))
      }
    }

    update.hasAdditionalResponsibilities?.let {
      if (it && update.whenUnavailable == null) {
        errors.add(FieldError(field = "hasAdditionalResponsibilities", error = Code.CONDITIONAL_FIELD_MUST_BE_SET))
      }
    }

    update.usingRarDays?.let {
      if (it && update.maximumRarDays == null) {
        errors.add(FieldError(field = "usingRarDays", error = Code.CONDITIONAL_FIELD_MUST_BE_SET))
      }
    }

    update.desiredOutcomesIds?.let {
      if (it.isEmpty()) {
        errors.add(FieldError(field = "desiredOutcomesIds", error = Code.CANNOT_BE_EMPTY))
      }

      // fixme: error if desiredOutcomesIds not valid for service category
    }

    update.serviceUser?.let {
      if (it.crn != null && it.crn != referral.serviceUserCRN) {
        errors.add(FieldError(field = "serviceUser.crn", error = Code.FIELD_CANNOT_BE_CHANGED))
      }
    }

    if (errors.isNotEmpty()) {
      throw ValidationError("draft referral update invalid", errors)
    }
  }

  fun updateDraftReferral(referral: Referral, update: DraftReferralDTO): Referral {
    validateDraftReferralUpdate(referral, update)

    update.completionDeadline?.let {
      referral.completionDeadline = it
    }

    update.complexityLevelId?.let {
      referral.complexityLevelID = it
    }

    update.furtherInformation?.let {
      referral.furtherInformation = it
    }

    update.additionalNeedsInformation?.let {
      referral.additionalNeedsInformation = it
    }

    update.accessibilityNeeds?.let {
      referral.accessibilityNeeds = it
    }

    update.needsInterpreter?.let {
      referral.needsInterpreter = it
      referral.interpreterLanguage = if (it) update.interpreterLanguage else null
    }

    update.hasAdditionalResponsibilities?.let {
      referral.hasAdditionalResponsibilities = it
      referral.whenUnavailable = if (it) update.whenUnavailable else null
    }

    update.additionalRiskInformation?.let {
      referral.additionalRiskInformation = it
    }

    update.usingRarDays?.let {
      referral.usingRarDays = it
      referral.maximumRarDays = if (it) update.maximumRarDays else null
    }

    update.desiredOutcomesIds?.let {
      referral.desiredOutcomesIDs = it
    }

    update.serviceUser?.let {
      referral.serviceUserData = ServiceUserData(
        referral = referral,
        title = it.title,
        firstName = it.firstName,
        lastName = it.lastName,
        dateOfBirth = it.dateOfBirth,
        gender = it.gender,
        ethnicity = it.ethnicity,
        preferredLanguage = it.preferredLanguage,
        religionOrBelief = it.religionOrBelief,
        disabilities = it.disabilities,
      )
    }

    return referralRepository.save(referral)
  }

  fun getDraftReferralsCreatedByUserID(userID: String): List<DraftReferralDTO> {
    return referralRepository.findByCreatedByIdAndSentAtIsNull(userID).map { DraftReferralDTO.from(it) }
  }

  private fun generateReferenceNumber(category: ServiceCategory): String? {
    return generateSequence { referenceGenerator.generate(category.name) }
      .find { candidate ->
        referralRepository.existsByReferenceNumber(candidate)
          .also { exists -> if (exists) log.warn("Clash found for referral number: $candidate") }
          .not()
      }
  }

  companion object {
    private val log = LoggerFactory.getLogger(ReferralService::class.java)
  }
}
