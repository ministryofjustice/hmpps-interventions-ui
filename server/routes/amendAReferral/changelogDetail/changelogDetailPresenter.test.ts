import ChangelogDetailPresenter from './changelogDetailPresenter'
import changelogDetail from '../../../../testutils/factories/changeLogDetail'
import { FormValidationError } from '../../../utils/formValidationError'
import SentReferral from '../../../models/sentReferral'
import sentReferral from '../../../../testutils/factories/sentReferral'
import deliusServerUserFactory from '../../../../testutils/factories/deliusServiceUser'
import DeliusServiceUser from '../../../models/delius/deliusServiceUser'

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
  const formError: FormValidationError | null = null
  const referral: SentReferral = sentReferral.build()
  const deliusServiceUser: DeliusServiceUser = deliusServerUserFactory.build()
  describe('generated title for different change log detail', () => {
    it('check the title for complexity level', () => {
      const presenter = new ChangelogDetailPresenter(
        formError,
        changeLog1,
        referral,
        deliusServiceUser,
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
        'probation-practitioner'
      )
      expect(presenter.renderTitle).toEqual('Caring or employment responsibilites were changed')
    })
  })
})
