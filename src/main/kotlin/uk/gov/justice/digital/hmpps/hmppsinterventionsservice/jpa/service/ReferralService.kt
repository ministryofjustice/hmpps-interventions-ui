package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.service

import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.config.Code
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.config.FieldError
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.config.ValidationError
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.DraftReferralDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Referral
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ServiceUserData
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ReferralRepository
import java.time.LocalDate
import java.util.UUID

@Service
class ReferralService(val repository: ReferralRepository) {
  fun createDraftReferral(userID: String, authSource: String): Referral {
    val dummyCRN = "X320741"
    return repository.save(
      Referral(
        serviceUserCRN = dummyCRN,
        createdByUserID = userID,
        createdByUserAuthSource = authSource
      )
    )
  }

  fun getDraftReferral(id: UUID): Referral? {
    return repository.findByIdOrNull(id)
  }

  private fun validateDraftReferralUpdate(referral: Referral, update: DraftReferralDTO) {
    val errors = mutableListOf<FieldError>()

    update.serviceCategoryId?.let {
      if (referral.serviceCategoryID != null && it != referral.serviceCategoryID) {
        errors.add(FieldError(field = "serviceCategoryId", error = Code.FIELD_CANNOT_BE_CHANGED))
      }
    }

    update.completionDeadline?.let {
      if (it.isBefore(LocalDate.now())) {
        errors.add(FieldError(field = "completionDeadline", error = Code.DATE_MUST_BE_IN_THE_FUTURE))
      }

      // fixme: error if completion deadline is after sentence end date
    }

    update.complexityLevelId?.let {
      if (referral.serviceCategoryID == null && update.serviceCategoryId == null) {
        errors.add(FieldError(field = "complexityLevelId", error = Code.SERVICE_CATEGORY_MUST_BE_SET))
      }

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

    update.desiredOutcomeIds?.let {
      if (it.isEmpty()) {
        errors.add(FieldError(field = "desiredOutcomeIds", error = Code.CANNOT_BE_EMPTY))
      }
      if (referral.serviceCategoryID == null && update.serviceCategoryId == null) {
        errors.add(FieldError(field = "desiredOutcomeIds", error = Code.SERVICE_CATEGORY_MUST_BE_SET))
      }

      // fixme: error if desiredOutcomeIds not valid for service category
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

    update.serviceCategoryId?.let {
      referral.serviceCategoryID = it
    }

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

    update.desiredOutcomeIds?.let {
      referral.desiredOutcomeIDs = it
    }

    update.serviceUser?.let {
      referral.serviceUserData = ServiceUserData(
        referral = referral,
        title = it.title,
        firstName = it.firstName,
        lastName = it.lastName,
        dob = it.dob,
        gender = it.gender,
        ethnicity = it.ethnicity,
        preferredLanguage = it.preferredLanguage,
        religionOrBelief = it.religionOrBelief,
        disabilities = it.disabilities,
      )
    }

    return repository.save(referral)
  }

  fun getDraftReferralsCreatedByUserID(userID: String): List<DraftReferralDTO> {
    return repository.findByCreatedByUserID(userID).map { DraftReferralDTO.from(it) }
  }
}
