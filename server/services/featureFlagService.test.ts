import LoggedInUser from '../models/loggedInUser'
import FeatureFlagService from './featureFlagService'

describe('featureFlagService', () => {
  describe('enableForUser', () => {
    const sampleUserIds = [
      '1500538764',
      '1501572802',
      '1501599309',
      '1501564027',
      'b8b62766-4fb8-4fb6-8b65-084138aba3a2',
      'fea38ff9-e94c-4f66-9d03-f0d607a93fb9',
      '8712ad01-e853-404d-bc8c-7a6a01282ae4',
      '3c22f5b2-cd74-4d93-9f66-a5c8b6adcde1',
      '1501564520',
      '6a92bfd1-7e13-894d-aedb-bd45e0637eb5',
      '1501560675',
      '1501576934',
      '2e7b46f9-1206-4c2f-8afc-bd8c9db3213d',
      '9bf13fdc-fd51-46ca-a05d-81f835c84cdc',
      '74a7a87a-9f44-f043-a9ce-6f5054fcbad1',
      '8738b2f8-caac-43e3-9d82-b7d13b724651',
      '1501554641',
      '48c6e871-8bce-428b-9d4e-799ec357934f',
      '1501552065',
      '1500525592',
      'd8f28f2e-4ad9-43c7-8a9a-cda18dff4ecc',
      '1501576362',
      '51a13fe3-6ab8-5643-8688-3bf6e328ae1d',
      '1501502436',
      'e240686b-cc04-42be-9e84-fa3aa6e5986b',
      '1501573425',
      '1501413704',
      '316d6b7e-3000-4f4c-8870-126488c0d6ae',
      '1501516821',
      '1501573442',
      'ece24879-0168-4223-8281-2764f9b12451',
      '1501555251',
      '1500649283',
      '1501517528',
      '5dc21318-344e-4150-88d4-434c2f8d7f38',
      'c3bc7705-018f-4b4a-b594-1f5f91847faa',
      'ac26bae8-36a9-5e41-82cf-b4e1871f3941',
      '2969cc5f-d7a6-4a18-ad1f-e784b06394ec',
      '1501564820',
      '870e1445-86d8-40ee-9c5b-bac6952d4039',
      '1500618083',
      '1501554791',
      '1501579305',
      '1500507846',
      '1501576856',
      '7e052c2f-bba7-4741-bd7c-1acb9bf9538f',
      '1500523592',
      '1501578836',
      '6598c9af-7da4-b747-9a28-56314e9bcd5a',
      '1500511128',
      '1501464663',
      '1500588055',
      '1501552196',
      '1501602858',
      '1501552341',
      '1501424335',
      '1501552428',
      '1501562335',
      '59036d24-1781-5640-8157-cc638a07cef9',
      '6d00554f-fed2-4be1-953d-993ec6e4cb0a',
      '1501558313',
      'c078d312-4b6b-46af-b89a-f094824bfb19',
      '1501553753',
      '1500877260',
      '1501566034',
      'a4ddcea9-eda0-4786-a861-82b2897b9434',
      '1501516851',
      '1501443868',
      '1500505497',
      '1501406504',
      '1501552495',
      '1501410499',
      '1500509884',
      '1501382424',
      '1501603844',
      '1501564116',
      '1501516929',
      '1501440267',
      '1501436653',
      '1501563140',
      '1501576884',
      '1501553771',
      '1500509347',
      '1501399432',
      'bd311df4-46bd-cc4f-a1db-0a242c103fdd',
      '19127ecb-784c-48a3-80c0-089d0195c882',
      'f67637aa-7fa3-7541-970d-7508863e02bc',
      'f8b23887-acca-e343-9d82-b7d13b724651',
      '1501560937',
      '1501558814',
      '93105fa9-ebc3-9545-99c1-c9bfd150e457',
      '1501564042',
      '1501563115',
      '1501495787',
      '1500530708',
      '1501559814',
      '1501561576',
      '1501602764',
      '1500525310',
      '1500606645',
    ].map(it => {
      return { userId: it } as LoggedInUser
    })

    it('always returns false for 0 percent', () => {
      sampleUserIds.forEach(it => {
        expect(FeatureFlagService.enableForUser(it, 0)).toEqual(false)
      })
    })

    it('always returns true for 100 percent', () => {
      sampleUserIds.forEach(it => {
        expect(FeatureFlagService.enableForUser(it, 100)).toEqual(true)
      })
    })

    it('returns roughly the right number', () => {
      const userIds = sampleUserIds
      const for20Percent = userIds.map(it => FeatureFlagService.enableForUser(it, 20)).filter(b => b)
      expect(for20Percent.length).toEqual(22)

      const for50Percent = userIds.map(it => FeatureFlagService.enableForUser(it, 50)).filter(b => b)
      expect(for50Percent.length).toEqual(55)

      const for75Percent = userIds.map(it => FeatureFlagService.enableForUser(it, 75)).filter(b => b)
      expect(for75Percent.length).toEqual(74)
    })

    it('returns the same value for the same sets of users', () => {
      const resultsOnFirstRun = sampleUserIds.map(it => {
        return { id: it, trueOrFalse: FeatureFlagService.enableForUser(it, 10) }
      })
      const resultsOnSecondRun = sampleUserIds.map(it => {
        return { id: it, trueOrFalse: FeatureFlagService.enableForUser(it, 10) }
      })
      expect(resultsOnFirstRun).toEqual(resultsOnSecondRun)
    })
  })
})
