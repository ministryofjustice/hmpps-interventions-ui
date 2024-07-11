import ChangelogDetailPresenter from './changelogDetailPresenter'
import changelogDetail from '../../../../testutils/factories/changeLogDetail'
import { FormValidationError } from '../../../utils/formValidationError'
import SentReferral from '../../../models/sentReferral'
import sentReferral from '../../../../testutils/factories/sentReferral'
import deliusServerUserFactory from '../../../../testutils/factories/deliusServiceUser'
import DeliusServiceUser from '../../../models/delius/deliusServiceUser'
import prisonFactory from '../../../../testutils/factories/prison'
import securedChildAgency from '../../../../testutils/factories/secureChildAgency'
import PrisonAndSecuredChildAgency from '../../../models/prisonAndSecureChildAgency'

describe('ChangeLogPresenter', () => {
  const changeLog1 = changelogDetail.build({
    changelogId: '1',
    name: 'changelog 1 name',
    topic: 'COMPLEXITY_LEVEL',
    oldValue: ['low complexity'],
    newValue: ['high complexity'],
    reasonForChange: 'Error at complexity change',
  })
  const changeLog2 = changelogDetail.build({
    changelogId: '2',
    name: 'changelog 2 name',
    topic: 'DESIRED_OUTCOMES',
    oldValue: ['desired outcome1'],
    newValue: ['desired outcome2'],
    reasonForChange: 'Error at desired outcome change',
  })
  const changeLog3 = changelogDetail.build({
    changelogId: '3',
    name: 'changelog 3 name',
    topic: 'COMPLETION_DATETIME',
    oldValue: ['1/10/2022'],
    newValue: ['1/11/2022'],
    reasonForChange: 'Error at desired outcome change',
  })
  const changeLog4 = changelogDetail.build({
    changelogId: '4',
    name: 'changelog 4 name',
    topic: 'MAXIMUM_ENFORCEABLE_DAYS',
    oldValue: ['10'],
    newValue: ['20'],
    reasonForChange: 'Error at desired outcome change',
  })
  const changeLog5 = changelogDetail.build({
    changelogId: '5',
    name: 'changelog 5 name',
    topic: 'NEEDS_AND_REQUIREMENTS_ACCESSIBILITY_NEEDS',
    oldValue: ['wheelchair access'],
    newValue: ['hearing aid'],
    reasonForChange: 'Error at desired outcome change',
  })
  const changeLog6 = changelogDetail.build({
    changelogId: '6',
    name: 'changelog 6 name',
    topic: 'NEEDS_AND_REQUIREMENTS_ADDITIONAL_INFORMATION',
    oldValue: ['Additional Information1'],
    newValue: ['Additional Information2'],
    reasonForChange: 'Error at desired outcome change',
  })
  const changeLog7 = changelogDetail.build({
    changelogId: '7',
    name: 'changelog 7 name',
    topic: 'NEEDS_AND_REQUIREMENTS_INTERPRETER_REQUIRED',
    oldValue: ['No'],
    newValue: ['Yes-French'],
    reasonForChange: 'Error at desired outcome change',
  })
  const changeLog8 = changelogDetail.build({
    changelogId: '8',
    name: 'changelog 8 name',
    topic: 'NEEDS_AND_REQUIREMENTS_HAS_ADDITIONAL_RESPONSIBILITIES',
    oldValue: ['No'],
    newValue: ['Yes-cannot attend on wednesday afternoons'],
    reasonForChange: 'Error at desired outcome change',
  })
  const changeLog9 = changelogDetail.build({
    changelogId: '9',
    name: 'changelog 9 name',
    topic: 'PRISON_ESTABLISHMENT',
    oldValue: ['aaa'],
    newValue: ['bbb'],
    reasonForChange: 'Error at desired outcome change',
  })
  const changeLog10 = changelogDetail.build({
    changelogId: '10',
    name: 'changelog 10 name',
    topic: 'EXPECTED_RELEASE_DATE',
    oldValue: ['02-Aug-2024'],
    newValue: ['05-Aug-2024'],
  })
  const changeLog11 = changelogDetail.build({
    changelogId: '11',
    name: 'changelog 11 name',
    topic: 'EXPECTED_RELEASE_DATE',
    oldValue: ['02-Aug-2024'],
    newValue: ['some reason'],
  })
  const changeLog12 = changelogDetail.build({
    changelogId: '12',
    name: 'changelog 12 name',
    topic: 'EXPECTED_RELEASE_DATE',
    oldValue: ['some reason'],
    newValue: ['02-Aug-2024'],
  })
  const changeLog13 = changelogDetail.build({
    changelogId: '13',
    name: 'changelog 13 name',
    topic: 'EXPECTED_RELEASE_DATE',
    oldValue: ['some reason'],
    newValue: ['new reason'],
  })
  const formError: FormValidationError | null = null
  const referral: SentReferral = sentReferral.build()
  const deliusServiceUser: DeliusServiceUser = deliusServerUserFactory.build()
  const prisonList = prisonFactory.build()
  const prisonAndSecuredChildAgencyList = securedChildAgency.build()

  const prisonsAndSecuredChildAgencies: PrisonAndSecuredChildAgency[] = []

  prisonList.forEach(prison =>
    prisonsAndSecuredChildAgencies.push({ id: prison.prisonId, description: prison.prisonName })
  )
  prisonAndSecuredChildAgencyList.forEach(sca =>
    prisonsAndSecuredChildAgencies.push({ id: sca.agencyId, description: sca.description })
  )

  describe('generated title for different change log detail', () => {
    it('check the title for complexity level', () => {
      const presenter = new ChangelogDetailPresenter(
        formError,
        changeLog1,
        referral,
        deliusServiceUser,
        prisonsAndSecuredChildAgencies,
        'probation-practitioner'
      )
      expect(presenter.renderTitle).toEqual('Complexity level was changed')
    })

    it('check the title for desired outcome', () => {
      const presenter = new ChangelogDetailPresenter(
        formError,
        changeLog2,
        referral,
        deliusServiceUser,
        prisonsAndSecuredChildAgencies,
        'probation-practitioner'
      )
      expect(presenter.renderTitle).toEqual('Desired outcomes was changed')
    })
    it('check the title for completion deadline', () => {
      const presenter = new ChangelogDetailPresenter(
        formError,
        changeLog3,
        referral,
        deliusServiceUser,
        prisonsAndSecuredChildAgencies,
        'probation-practitioner'
      )
      expect(presenter.renderTitle).toEqual('Completion date was changed')
    })
    it('check the title for enforceable days', () => {
      const presenter = new ChangelogDetailPresenter(
        formError,
        changeLog4,
        referral,
        deliusServiceUser,
        prisonsAndSecuredChildAgencies,
        'probation-practitioner'
      )
      expect(presenter.renderTitle).toEqual('Enforceable days was changed')
    })

    it('check the title for accessibility needs', () => {
      const presenter = new ChangelogDetailPresenter(
        formError,
        changeLog5,
        referral,
        deliusServiceUser,
        prisonsAndSecuredChildAgencies,
        'probation-practitioner'
      )
      expect(presenter.renderTitle).toEqual('Mobility, disability or accessibility needs were changed')
    })

    it('check the title for additional information', () => {
      const presenter = new ChangelogDetailPresenter(
        formError,
        changeLog6,
        referral,
        deliusServiceUser,
        prisonsAndSecuredChildAgencies,
        'probation-practitioner'
      )
      expect(presenter.renderTitle).toEqual(
        `Additional information about ${referral.referral.serviceUser.firstName}'s needs was changed`
      )
    })

    it('check the title for additional information', () => {
      const presenter = new ChangelogDetailPresenter(
        formError,
        changeLog7,
        referral,
        deliusServiceUser,
        prisonsAndSecuredChildAgencies,
        'probation-practitioner'
      )
      expect(presenter.renderTitle).toEqual('Need for an interpreter was changed')
    })

    it('check the title for caring or employement responsibilities', () => {
      const presenter = new ChangelogDetailPresenter(
        formError,
        changeLog8,
        referral,
        deliusServiceUser,
        prisonsAndSecuredChildAgencies,
        'probation-practitioner'
      )
      expect(presenter.renderTitle).toEqual('Caring or employment responsibilites were changed')
    })
    it('check the title for prison establishment', () => {
      const presenter = new ChangelogDetailPresenter(
        formError,
        changeLog9,
        referral,
        deliusServiceUser,
        prisonsAndSecuredChildAgencies,
        'probation-practitioner'
      )
      expect(presenter.renderTitle).toEqual(
        `${referral.referral.serviceUser.firstName} ${referral.referral.serviceUser.lastName}'s prison establishment has changed`
      )
    })

    it('check the title for expected release date when date is changed to another date', () => {
      const presenter = new ChangelogDetailPresenter(
        formError,
        changeLog10,
        referral,
        deliusServiceUser,
        prisonsAndSecuredChildAgencies,
        'probation-practitioner'
      )
      expect(presenter.renderTitle).toEqual(
        `${referral.referral.serviceUser.firstName} ${referral.referral.serviceUser.lastName}'s expected release date has changed`
      )
    })

    it('check the title when expected release date is changed to unknown reason', () => {
      const presenter = new ChangelogDetailPresenter(
        formError,
        changeLog11,
        referral,
        deliusServiceUser,
        prisonsAndSecuredChildAgencies,
        'probation-practitioner'
      )
      expect(presenter.renderTitle).toEqual(
        `${referral.referral.serviceUser.firstName} ${referral.referral.serviceUser.lastName}'s expected release date information has changed`
      )
    })
  })

  it('check the title when expected release date unknown reason is changed to another unknown reason', () => {
    const presenter = new ChangelogDetailPresenter(
      formError,
      changeLog12,
      referral,
      deliusServiceUser,
      prisonsAndSecuredChildAgencies,
      'probation-practitioner'
    )
    expect(presenter.renderTitle).toEqual(
      `${referral.referral.serviceUser.firstName} ${referral.referral.serviceUser.lastName}'s expected release date information has been added`
    )
  })

  it('check the title when expected release date unknown reason is changed to expected release date ', () => {
    const presenter = new ChangelogDetailPresenter(
      formError,
      changeLog13,
      referral,
      deliusServiceUser,
      prisonsAndSecuredChildAgencies,
      'probation-practitioner'
    )
    expect(presenter.renderTitle).toEqual(
      `${referral.referral.serviceUser.firstName} ${referral.referral.serviceUser.lastName}'s expected release date information has changed`
    )
  })
})
