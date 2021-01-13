import { Request } from 'express'
import NeedsAndRequirementsForm from './needsAndRequirementsForm'
import draftReferralFactory from '../../../testutils/factories/draftReferral'

describe('NeedsAndRequirementsForm', () => {
  const referral = draftReferralFactory
    .serviceCategorySelected()
    .serviceUserSelected()
    .build({ serviceUser: { firstName: 'Alex' } })

  describe('errors', () => {
    it('returns no error with all fields populated', async () => {
      const form = await NeedsAndRequirementsForm.createForm(
        {
          body: {
            'additional-needs-information': 'Alex is currently sleeping on his aunt’s sofa',
            'accessibility-needs': 'He uses a wheelchair',
            'needs-interpreter': 'yes',
            'interpreter-language': 'Spanish',
            'has-additional-responsibilities': 'yes',
            'when-unavailable': 'He works on Fridays 7am - midday',
          },
        } as Request,
        referral
      )

      expect(form.error).toBeNull()
    })

    it('returns no error with the optional fields empty', async () => {
      const form = await NeedsAndRequirementsForm.createForm(
        {
          body: {
            'additional-needs-information': '',
            'accessibility-needs': '',
            'needs-interpreter': 'yes',
            'interpreter-language': 'Spanish',
            'has-additional-responsibilities': 'yes',
            'when-unavailable': 'He works on Fridays 7am - midday',
          },
        } as Request,
        referral
      )

      expect(form.error).toBeNull()
    })

    it('returns multiple errors when there are multiple errors in the input', async () => {
      const form = await NeedsAndRequirementsForm.createForm(
        {
          body: {
            'additional-needs-information': '',
            'accessibility-needs': '',
          },
        } as Request,
        referral
      )

      expect(form.error).toEqual({
        errors: [
          {
            formFields: ['needs-interpreter'],
            errorSummaryLinkedField: 'needs-interpreter',
            message: 'Select yes if Alex needs an interpreter',
          },
          {
            formFields: ['has-additional-responsibilities'],
            errorSummaryLinkedField: 'has-additional-responsibilities',
            message: 'Select yes if Alex has caring or employment responsibilities',
          },
        ],
      })
    })

    it('returns an error when needs-interpreter is not answered', async () => {
      const form = await NeedsAndRequirementsForm.createForm(
        {
          body: {
            'additional-needs-information': '',
            'accessibility-needs': '',
            'interpreter-language': '',
            'has-additional-responsibilities': 'yes',
            'when-unavailable': 'He works on Fridays 7am - midday',
          },
        } as Request,
        referral
      )

      expect(form.error).toEqual({
        errors: [
          {
            formFields: ['needs-interpreter'],
            errorSummaryLinkedField: 'needs-interpreter',
            message: 'Select yes if Alex needs an interpreter',
          },
        ],
      })
    })

    it('returns an error when needs-interpreter is yes and interpreter-language is empty', async () => {
      const form = await NeedsAndRequirementsForm.createForm(
        {
          body: {
            'additional-needs-information': '',
            'accessibility-needs': '',
            'needs-interpreter': 'yes',
            'interpreter-language': '',
            'has-additional-responsibilities': 'yes',
            'when-unavailable': 'He works on Fridays 7am - midday',
          },
        } as Request,
        referral
      )

      expect(form.error).toEqual({
        errors: [
          {
            formFields: ['interpreter-language'],
            errorSummaryLinkedField: 'interpreter-language',
            message: 'Enter the language for which Alex needs an interpreter',
          },
        ],
      })
    })

    it('returns no error when needs-interpreter is no and interpreter-language is empty', async () => {
      const form = await NeedsAndRequirementsForm.createForm(
        {
          body: {
            'additional-needs-information': '',
            'accessibility-needs': '',
            'needs-interpreter': 'no',
            'interpreter-language': '     ',
            'has-additional-responsibilities': 'yes',
            'when-unavailable': 'He works on Fridays 7am - midday',
          },
        } as Request,
        referral
      )

      expect(form.error).toBeNull()
    })

    it('returns an error when has-additional-responsibilities is not answered', async () => {
      const form = await NeedsAndRequirementsForm.createForm(
        {
          body: {
            'additional-needs-information': '',
            'accessibility-needs': '',
            'needs-interpreter': 'yes',
            'interpreter-language': 'Spanish',
            'when-unavailable': '',
          },
        } as Request,
        referral
      )

      expect(form.error).toEqual({
        errors: [
          {
            formFields: ['has-additional-responsibilities'],
            errorSummaryLinkedField: 'has-additional-responsibilities',
            message: 'Select yes if Alex has caring or employment responsibilities',
          },
        ],
      })
    })

    it('returns an error when has-additional-responsibilities is yes and when-unavailable is empty', async () => {
      const form = await NeedsAndRequirementsForm.createForm(
        {
          body: {
            'additional-needs-information': '',
            'accessibility-needs': '',
            'needs-interpreter': 'yes',
            'interpreter-language': 'Spanish',
            'has-additional-responsibilities': 'yes',
            'when-unavailable': '   ',
          },
        } as Request,
        referral
      )

      expect(form.error).toEqual({
        errors: [
          {
            formFields: ['when-unavailable'],
            errorSummaryLinkedField: 'when-unavailable',
            message: 'Enter details of when Alex will not be able to attend sessions',
          },
        ],
      })
    })

    it('returns no error when has-additional-responsibilities is no and when-unavailable is empty', async () => {
      const form = await NeedsAndRequirementsForm.createForm(
        {
          body: {
            'additional-needs-information': '',
            'accessibility-needs': '',
            'needs-interpreter': 'no',
            'interpreter-language': '',
            'has-additional-responsibilities': 'no',
            'when-unavailable': '',
          },
        } as Request,
        referral
      )

      expect(form.error).toBeNull()
    })
  })

  describe('paramsForUpdate', () => {
    it('returns an object to be used for updating the draft referral via the interventions service', async () => {
      const form = await NeedsAndRequirementsForm.createForm(
        {
          body: {
            'additional-needs-information': 'Alex is currently sleeping on his aunt’s sofa',
            'accessibility-needs': 'He uses a wheelchair',
            'needs-interpreter': 'yes',
            'interpreter-language': 'Spanish',
            'has-additional-responsibilities': 'yes',
            'when-unavailable': 'He works on Fridays 7am - midday',
          },
        } as Request,
        referral
      )

      expect(form.paramsForUpdate).toEqual({
        additionalNeedsInformation: 'Alex is currently sleeping on his aunt’s sofa',
        accessibilityNeeds: 'He uses a wheelchair',
        needsInterpreter: true,
        interpreterLanguage: 'Spanish',
        hasAdditionalResponsibilities: true,
        whenUnavailable: 'He works on Fridays 7am - midday',
      })
    })

    it('returns an empty string for additionalNeedsInformation when an empty additional-needs-information is submitted', async () => {
      const form = await NeedsAndRequirementsForm.createForm(
        {
          body: {
            'additional-needs-information': '',
            'accessibility-needs': '',
            'needs-interpreter': 'no',
            'interpreter-language': '',
            'has-additional-responsibilities': 'no',
            'when-unavailable': '',
          },
        } as Request,
        referral
      )

      expect(form.paramsForUpdate.additionalNeedsInformation).toBe('')
    })

    it('returns an empty string for accessibilityNeeds when an empty accessibility-needs is submitted', async () => {
      const form = await NeedsAndRequirementsForm.createForm(
        {
          body: {
            'additional-needs-information': '',
            'accessibility-needs': '',
            'needs-interpreter': 'no',
            'interpreter-language': '',
            'has-additional-responsibilities': 'no',
            'when-unavailable': '',
          },
        } as Request,
        referral
      )

      expect(form.paramsForUpdate.accessibilityNeeds).toBe('')
    })

    it('returns needsInterpreter true and a non-null interpreterLanguage when needs-interpreter is yes', async () => {
      const form = await NeedsAndRequirementsForm.createForm(
        {
          body: {
            'additional-needs-information': '',
            'accessibility-needs': '',
            'needs-interpreter': 'yes',
            'interpreter-language': 'Spanish',
            'has-additional-responsibilities': 'no',
            'when-unavailable': '',
          },
        } as Request,
        referral
      )

      expect(form.paramsForUpdate.needsInterpreter).toBe(true)
      expect(form.paramsForUpdate.interpreterLanguage).toBe('Spanish')
    })

    it('returns needsInterpreter false and a null interpreterLanguage when needs-interpreter is no', async () => {
      const form = await NeedsAndRequirementsForm.createForm(
        {
          body: {
            'additional-needs-information': '',
            'accessibility-needs': '',
            'needs-interpreter': 'no',
            'interpreter-language': '',
            'has-additional-responsibilities': 'no',
            'when-unavailable': '',
          },
        } as Request,
        referral
      )

      expect(form.paramsForUpdate.needsInterpreter).toBe(false)
      expect(form.paramsForUpdate.interpreterLanguage).toBeNull()
    })

    it('returns hasAdditionalResponsibilities true and a non-null whenUnavailable when has-additional-responsibilities is yes', async () => {
      const form = await NeedsAndRequirementsForm.createForm(
        {
          body: {
            'additional-needs-information': '',
            'accessibility-needs': '',
            'needs-interpreter': 'no',
            'interpreter-language': '',
            'has-additional-responsibilities': 'yes',
            'when-unavailable': 'He works on Fridays 7am - midday',
          },
        } as Request,
        referral
      )

      expect(form.paramsForUpdate.hasAdditionalResponsibilities).toBe(true)
      expect(form.paramsForUpdate.whenUnavailable).toBe('He works on Fridays 7am - midday')
    })

    it('returns hasAdditionalResponsibilities false and a null whenUnavailable when has-additional-responsibilities is no', async () => {
      const form = await NeedsAndRequirementsForm.createForm(
        {
          body: {
            'additional-needs-information': '',
            'accessibility-needs': '',
            'needs-interpreter': 'no',
            'interpreter-language': '',
            'has-additional-responsibilities': 'no',
            'when-unavailable': '',
          },
        } as Request,
        referral
      )

      expect(form.paramsForUpdate.hasAdditionalResponsibilities).toBe(false)
      expect(form.paramsForUpdate.whenUnavailable).toBeNull()
    })
  })
})
