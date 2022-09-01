// import AmendDesiredOutcomesPresenter from './intepreterRequiredPresenter'
// import SentReferralFactory from '../../../../testutils/factories/sentReferral'
// import serviceCategoryFactory from '../../../../testutils/factories/serviceCategory'

// describe('AmendDesiredOutcomesPresenter', () => {
//   const serviceCategory = serviceCategoryFactory.build({
//     name: 'social inclusion',
//     desiredOutcomes: [
//       {
//         id: '301ead30-30a4-4c7c-8296-2768abfb59b5',
//         description:
//           'All barriers, as identified in the Service user action plan (for example financial, behavioural, physical, mental or offence-type related), to obtaining or sustaining accommodation are successfully removed',
//       },
//       {
//         id: '3415a6f2-38ef-4613-bb95-33355deff17e',
//         description: 'Service user makes progress in obtaining accommodation',
//       },
//       {
//         id: '5352cfb6-c9ee-468c-b539-434a3e9b506e',
//         description: 'Service user is helped to secure social or supported housing',
//       },
//       {
//         id: 'e7f199de-eee1-4f57-a8c9-69281ea6cd4d',
//         description: 'Service user is helped to secure a tenancy in the private rented sector (PRS)',
//       },
//     ],
//   })
//   const referral = SentReferralFactory.build({
//     referral: {
//       serviceCategoryIds: [serviceCategory.id],
//       desiredOutcomes: [
//         {
//           serviceCategoryId: serviceCategory.id,
//           desiredOutcomesIds: [serviceCategory.desiredOutcomes[1].id, serviceCategory.desiredOutcomes[2].id],
//         },
//       ],
//     },
//   })

//   describe('errorMessage', () => {
//     describe('when no error is passed in', () => {
//       it('returns null', () => {
//         const presenter = new AmendDesiredOutcomesPresenter(referral, serviceCategory)

//         expect(presenter.reasonForChangeErrorMessage).toBeNull()
//         expect(presenter.outcomesErrorMessage).toBeNull()
//       })
//     })

//     describe('when an error is passed in', () => {
//       it('returns error information for outcomes field', () => {
//         const presenter = new AmendDesiredOutcomesPresenter(referral, serviceCategory, {
//           errors: [
//             {
//               formFields: ['desired-outcomes-ids'],
//               errorSummaryLinkedField: 'desired-outcomes-ids',
//               message: 'Select desired outcomes',
//             },
//           ],
//         })

//         expect(presenter.outcomesErrorMessage).toEqual('Select desired outcomes')
//       })

//       it('returns error information for reason for change field', () => {
//         const presenter = new AmendDesiredOutcomesPresenter(referral, serviceCategory, {
//           errors: [
//             {
//               formFields: ['reason-for-change'],
//               errorSummaryLinkedField: 'reason-for-change',
//               message: 'Enter reason for change',
//             },
//           ],
//         })

//         expect(presenter.reasonForChangeErrorMessage).toEqual('Enter reason for change')
//       })
//     })
//   })

//   describe('errorSummary', () => {
//     describe('when no error is passed in', () => {
//       it('returns null', () => {
//         const presenter = new AmendDesiredOutcomesPresenter(referral, serviceCategory)

//         expect(presenter.errorSummary).toBeNull()
//       })
//     })

//     describe('when an error is passed in', () => {
//       it('returns error information', () => {
//         const presenter = new AmendDesiredOutcomesPresenter(referral, serviceCategory, {
//           errors: [
//             {
//               formFields: ['desired-outcomes-ids'],
//               errorSummaryLinkedField: 'desired-outcomes-ids',
//               message: 'Select desired outcomes',
//             },
//           ],
//         })

//         expect(presenter.errorSummary).toEqual([{ field: 'desired-outcomes-ids', message: 'Select desired outcomes' }])
//       })
//     })
//   })

//   describe('titles', () => {
//     it('returns an outcomes title', () => {
//       const presenter = new AmendDesiredOutcomesPresenter(referral, serviceCategory)

//       expect(presenter.outcomesTitle).toEqual('What are the desired outcomes for Social inclusion?')
//     })

//     it('returns an reason for change title', () => {
//       const presenter = new AmendDesiredOutcomesPresenter(referral, serviceCategory)

//       expect(presenter.reasonTitle).toEqual('What is the reason for changing the desired outcomes?')
//     })
//   })

//   describe('desired outcomes', () => {
//     it('returns desired outcomes with current selection checked', () => {
//       const presenter = new AmendDesiredOutcomesPresenter(referral, serviceCategory)

//       expect(presenter.desiredOutcomes).toMatchObject([
//         {
//           checked: false,
//           text: 'All barriers, as identified in the Service user action plan (for example financial, behavioural, physical, mental or offence-type related), to obtaining or sustaining accommodation are successfully removed',
//           value: '301ead30-30a4-4c7c-8296-2768abfb59b5',
//         },
//         {
//           checked: true,
//           text: 'Service user makes progress in obtaining accommodation',
//           value: '3415a6f2-38ef-4613-bb95-33355deff17e',
//         },
//         {
//           checked: true,
//           text: 'Service user is helped to secure social or supported housing',
//           value: '5352cfb6-c9ee-468c-b539-434a3e9b506e',
//         },
//         {
//           checked: false,
//           text: 'Service user is helped to secure a tenancy in the private rented sector (PRS)',
//           value: 'e7f199de-eee1-4f57-a8c9-69281ea6cd4d',
//         },
//       ])
//     })
//   })
// })
