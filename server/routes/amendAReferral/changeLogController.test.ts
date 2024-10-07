import request from 'supertest'
import { Express } from 'express'
import InterventionsService from '../../services/interventionsService'
import apiConfig from '../../config'
import RamDeliusApiService from '../../services/ramDeliusApiService'
import deliusServiceUser from '../../../testutils/factories/deliusServiceUser'
import appWithAllRoutes, { AppSetupUserType } from '../testutils/appSetup'
import sentReferral from '../../../testutils/factories/sentReferral'
import changelogFactory from '../../../testutils/factories/changeLog'
import changelogDetailFactory from '../../../testutils/factories/changeLogDetail'
import SentReferral from '../../models/sentReferral'
import ChangelogDetail from '../../models/changelogDetail'
import Changelog from '../../models/changelog'
import interventionFactory from '../../../testutils/factories/intervention'
import prisonAndSecuredChildFactory from '../../../testutils/factories/secureChildAgency'
import prisonFactory from '../../../testutils/factories/prison'
import MockRamDeliusApiService from '../testutils/mocks/mockRamDeliusApiService'
import PrisonAndSecuredChildAgencyService from '../../services/prisonAndSecuredChildAgencyService'
import PrisonApiService from '../../services/prisonApiService'
import PrisonRegisterService from '../../services/prisonRegisterService'
import PrisonAndSecuredChildAgency from '../../models/prisonAndSecureChildAgency'

jest.mock('../../services/interventionsService')
jest.mock('../../services/ramDeliusApiService')
jest.mock('../../services/prisonRegisterService')
jest.mock('../../services/prisonApiService')
jest.mock('../../services/prisonAndSecuredChildAgencyService')

const interventionsService = new InterventionsService(
  apiConfig.apis.interventionsService
) as jest.Mocked<InterventionsService>
const ramDeliusApiService = new MockRamDeliusApiService() as jest.Mocked<RamDeliusApiService>
const prisonApiService = new PrisonApiService() as jest.Mocked<PrisonApiService>
const prisonRegisterService = new PrisonRegisterService() as jest.Mocked<PrisonRegisterService>
const prisonAndSecuredChildAgencyService = new PrisonAndSecuredChildAgencyService(
  prisonRegisterService,
  prisonApiService
) as jest.Mocked<PrisonAndSecuredChildAgencyService>

let app: Express
let referral: SentReferral
let changelogDetail1: ChangelogDetail
let changelogDetail2: ChangelogDetail
let changelogDetail3: ChangelogDetail
let changelogDetail4: ChangelogDetail
let changelogDetail5: ChangelogDetail
let changelogDetail6: ChangelogDetail
let changelogDetail7: ChangelogDetail
let changelogDetail8: ChangelogDetail
let changelogDetail9: ChangelogDetail
let changelogDetail10: ChangelogDetail
let changelogDetail11: ChangelogDetail
let changelog: Changelog[]

beforeEach(() => {
  app = appWithAllRoutes({
    overrides: { interventionsService, ramDeliusApiService, prisonAndSecuredChildAgencyService },
    userType: AppSetupUserType.probationPractitioner,
  })
  referral = sentReferral.build()
  changelog = [
    changelogFactory.build({ changelogId: '1', reasonForChange: 'Error at complexity change' }),
    changelogFactory.build({ changelogId: '2', reasonForChange: 'Error at desired outcomes' }),
    changelogFactory.build({ changelogId: '3', reasonForChange: 'accessibility needs needs changing' }),
  ]
  changelogDetail1 = changelogDetailFactory.build({
    changelogId: '1',
    name: 'changelog 1 name',
    topic: 'COMPLEXITY_LEVEL',
    oldValue: ['low complexity'],
    newValue: ['high complexity'],
    reasonForChange: 'Error at complexity change',
  })
  changelogDetail2 = changelogDetailFactory.build({
    changelogId: '2',
    name: 'changelog 2 name',
    topic: 'DESIRED_OUTCOMES',
    oldValue: ['desired outcome1'],
    newValue: ['desired outcome2'],
    reasonForChange: 'Error at desired outcome change',
  })
  changelogDetail3 = changelogDetailFactory.build({
    changelogId: '3',
    name: 'changelog 3 name',
    topic: 'COMPLETION_DATETIME',
    oldValue: ['1/10/2022'],
    newValue: ['1/11/2022'],
    reasonForChange: 'Error at desired outcome change',
  })
  changelogDetail4 = changelogDetailFactory.build({
    changelogId: '4',
    name: 'changelog 4 name',
    topic: 'MAXIMUM_ENFORCEABLE_DAYS',
    oldValue: ['10'],
    newValue: ['20'],
    reasonForChange: 'Error at desired outcome change',
  })
  changelogDetail5 = changelogDetailFactory.build({
    changelogId: '5',
    name: 'changelog 5 name',
    topic: 'NEEDS_AND_REQUIREMENTS_ACCESSIBILITY_NEEDS',
    oldValue: ['wheelchair access'],
    newValue: ['hearing aid'],
    reasonForChange: 'Error at desired outcome change',
  })
  changelogDetail6 = changelogDetailFactory.build({
    changelogId: '6',
    name: 'changelog 6 name',
    topic: 'NEEDS_AND_REQUIREMENTS_ADDITIONAL_INFORMATION',
    oldValue: ['Additional Information1'],
    newValue: ['Additional Information2'],
    reasonForChange: 'Error at desired outcome change',
  })
  changelogDetail7 = changelogDetailFactory.build({
    changelogId: '7',
    name: 'changelog 7 name',
    topic: 'NEEDS_AND_REQUIREMENTS_INTERPRETER_REQUIRED',
    oldValue: ['No'],
    newValue: ['Yes-French'],
    reasonForChange: 'Error at desired outcome change',
  })
  changelogDetail8 = changelogDetailFactory.build({
    changelogId: '8',
    name: 'changelog 8 name',
    topic: 'NEEDS_AND_REQUIREMENTS_HAS_ADDITIONAL_RESPONSIBILITIES',
    oldValue: ['No'],
    newValue: ['Yes-cannot attend on wednesday afternoons'],
    reasonForChange: 'Error at desired outcome change',
  })
  changelogDetail9 = changelogDetailFactory.build({
    changelogId: '9',
    name: 'changelog 9 name',
    topic: 'REASON_FOR_REFERRAL',
    oldValue: ['old reason'],
    newValue: ['new reason'],
    reasonForChange: '',
  })
  changelogDetail10 = changelogDetailFactory.build({
    changelogId: '10',
    name: 'changelog 10 name',
    topic: 'PRISON_ESTABLISHMENT',
    oldValue: ['aaa'],
    newValue: ['bbb'],
    reasonForChange: 'Reason why the prison establishment has changed',
  })
  changelogDetail11 = changelogDetailFactory.build({
    changelogId: '11',
    name: 'changelog 11 name',
    topic: 'REASON_FOR_REFERRAL_FURTHER_INFORMATION',
    oldValue: ['old reason'],
    newValue: ['new reason'],
    reasonForChange: '',
  })
  const prisonAndSecuredChildAgencyList = prisonAndSecuredChildFactory.build()
  const prisonList = prisonFactory.build()
  const prisonsAndSecuredChildAgencies: PrisonAndSecuredChildAgency[] = []

  prisonList.forEach(prison =>
    prisonsAndSecuredChildAgencies.push({ id: prison.prisonId, description: prison.prisonName })
  )
  prisonAndSecuredChildAgencyList.forEach(securedChildAgency =>
    prisonsAndSecuredChildAgencies.push({
      id: securedChildAgency.agencyId,
      description: securedChildAgency.description,
    })
  )
  prisonAndSecuredChildAgencyService.getPrisonsAndSecureChildAgencies.mockResolvedValue(prisonsAndSecuredChildAgencies)
})

describe('GET /referrals/:referralId/changelog', () => {
  beforeEach(() => {
    interventionsService.getSentReferral.mockResolvedValue(referral)
    interventionsService.getChangelog.mockResolvedValue(changelog)
    interventionsService.getIntervention.mockResolvedValue(
      interventionFactory.build({
        contractType: {
          code: 'accommodation',
          name: 'Accommodation',
        },
      })
    )
    ramDeliusApiService.getCaseDetailsByCrn.mockResolvedValue(deliusServiceUser.build())
  })

  it('renders the page to start a referral', () => {
    return request(app)
      .get(`/probation-practitioner/referrals/${referral.id}/changelog`)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Error at complexity')
        expect(res.text).toContain('Error at desired out')

        expect(res.text).toContain('accessibility needs')
        expect(res.text).toContain('Accommodation: change log')
      })
  })
})

describe('GET /referrals/:referralId/changelog/:changelogId/details', () => {
  beforeEach(() => {
    interventionsService.getSentReferral.mockResolvedValue(referral)
    ramDeliusApiService.getCaseDetailsByCrn.mockResolvedValue(deliusServiceUser.build())
  })

  it('renders the changelog detail for a given complexity level change', () => {
    interventionsService.getChangelogDetail.mockResolvedValue(changelogDetail1)
    return request(app)
      .get(`/probation-practitioner/referrals/${referral.id}/changelog/${changelogDetail1.changelogId}/details`)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Complexity level was changed')
        expect(res.text).toContain('From')
        expect(res.text).toContain('To')
        expect(res.text).toContain(changelogDetail1.oldValue[0])
        expect(res.text).toContain(changelogDetail1.newValue[0])
      })
  })
  it('renders the changelog detail for a given desired outcome level change', () => {
    interventionsService.getChangelogDetail.mockResolvedValue(changelogDetail2)
    return request(app)
      .get(`/probation-practitioner/referrals/${referral.id}/changelog/${changelogDetail2.changelogId}/details`)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Desired outcomes was changed')
        expect(res.text).toContain('From')
        expect(res.text).toContain('To')
        expect(res.text).toContain(changelogDetail2.oldValue[0])
        expect(res.text).toContain(changelogDetail2.newValue[0])
      })
  })

  it('renders the changelog detail for a given completion deadline change', () => {
    interventionsService.getChangelogDetail.mockResolvedValue(changelogDetail3)
    return request(app)
      .get(`/probation-practitioner/referrals/${referral.id}/changelog/${changelogDetail3.changelogId}/details`)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Completion date was changed')
        expect(res.text).toContain('From')
        expect(res.text).toContain('To')
        expect(res.text).toContain(changelogDetail3.oldValue[0])
        expect(res.text).toContain(changelogDetail3.newValue[0])
      })
  })

  it('renders the changelog detail for a given maximum enforceable days change', () => {
    interventionsService.getChangelogDetail.mockResolvedValue(changelogDetail4)
    return request(app)
      .get(`/probation-practitioner/referrals/${referral.id}/changelog/${changelogDetail4.changelogId}/details`)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Enforceable days was changed')
        expect(res.text).toContain('From')
        expect(res.text).toContain('To')
        expect(res.text).toContain(changelogDetail4.oldValue[0])
        expect(res.text).toContain(changelogDetail4.newValue[0])
      })
  })

  it('renders the changelog detail for the accessibility needs change', () => {
    interventionsService.getChangelogDetail.mockResolvedValue(changelogDetail5)
    return request(app)
      .get(`/probation-practitioner/referrals/${referral.id}/changelog/${changelogDetail5.changelogId}/details`)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Mobility, disability or accessibility needs were changed')
        expect(res.text).toContain('From')
        expect(res.text).toContain('To')
        expect(res.text).toContain(changelogDetail5.oldValue[0])
        expect(res.text).toContain(changelogDetail5.newValue[0])
      })
  })

  it('renders the changelog detail for the additional information change', () => {
    interventionsService.getChangelogDetail.mockResolvedValue(changelogDetail6)
    return request(app)
      .get(`/probation-practitioner/referrals/${referral.id}/changelog/${changelogDetail6.changelogId}/details`)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Additional information about Alex&#39;s needs was changed')
        expect(res.text).toContain('From')
        expect(res.text).toContain('To')
        expect(res.text).toContain(changelogDetail6.oldValue[0])
        expect(res.text).toContain(changelogDetail6.newValue[0])
      })
  })
  it('renders the changelog detail for the need interpreter required change', () => {
    interventionsService.getChangelogDetail.mockResolvedValue(changelogDetail7)
    return request(app)
      .get(`/probation-practitioner/referrals/${referral.id}/changelog/${changelogDetail7.changelogId}/details`)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Need for an interpreter was changed')
        expect(res.text).toContain('From')
        expect(res.text).toContain('To')
        expect(res.text).toContain(changelogDetail7.oldValue[0])
        expect(res.text).toContain(changelogDetail7.newValue[0])
      })
  })

  it('renders the changelog detail for the caring or employment responsibities change', () => {
    interventionsService.getChangelogDetail.mockResolvedValue(changelogDetail8)
    return request(app)
      .get(`/probation-practitioner/referrals/${referral.id}/changelog/${changelogDetail8.changelogId}/details`)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Caring or employment responsibilites were changed')
        expect(res.text).toContain('From')
        expect(res.text).toContain('To')
        expect(res.text).toContain(changelogDetail8.oldValue[0])
        expect(res.text).toContain(changelogDetail8.newValue[0])
      })
  })
  it('renders the changelog detail for the reason for referral change', () => {
    interventionsService.getChangelogDetail.mockResolvedValue(changelogDetail9)
    return request(app)
      .get(`/probation-practitioner/referrals/${referral.id}/changelog/${changelogDetail9.changelogId}/details`)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Reason for this referral and referral details has changed')
        expect(res.text).toContain('From')
        expect(res.text).toContain('To')
        expect(res.text).toContain(changelogDetail9.oldValue[0])
        expect(res.text).toContain(changelogDetail9.newValue[0])
      })
  })

  it('renders the changelog detail for the reason for referral further information change', () => {
    interventionsService.getChangelogDetail.mockResolvedValue(changelogDetail11)
    return request(app)
      .get(`/probation-practitioner/referrals/${referral.id}/changelog/${changelogDetail11.changelogId}/details`)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Further information for this referral has changed')
        expect(res.text).toContain('From')
        expect(res.text).toContain('To')
        expect(res.text).toContain(changelogDetail11.oldValue[0])
        expect(res.text).toContain(changelogDetail11.newValue[0])
      })
  })

  it('renders the changelog detail for the prison establishment change', () => {
    interventionsService.getChangelogDetail.mockResolvedValue(changelogDetail10)
    return request(app)
      .get(`/probation-practitioner/referrals/${referral.id}/changelog/${changelogDetail10.changelogId}/details`)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain(`Alex River&#39;s prison establishment has changed`)
        expect(res.text).toContain('From')
        expect(res.text).toContain('To')
        expect(res.text).toContain('London')
        expect(res.text).toContain('Sheffield')
      })
  })
})
