import { DraftReferral } from '../../services/interventionsService'
import ComplexityLevelPresenter from './complexityLevelPresenter'

describe('ComplexityLevelPresenter', () => {
  const draftReferral: DraftReferral = {
    id: '1',
    completionDeadline: null,
    serviceCategory: {
      id: 'b33c19d1-7414-4014-b543-e543e59c5b39',
      name: 'social inclusion',
    },
    complexityLevelId: null,
  }

  const socialInclusionComplexityLevels = [
    {
      id: 'd0db50b0-4a50-4fc7-a006-9c97530e38b2',
      title: 'Low complexity',
      description:
        'Service User has some capacity and means to secure and/or maintain suitable accommodation but requires some support and guidance to do so.',
    },
    {
      id: '110f2405-d944-4c15-836c-0c6684e2aa78',
      title: 'Medium complexity',
      description:
        'Service User is at risk of homelessness/is homeless, or will be on release from prison. Service User has had some success in maintaining atenancy but may have additional needs e.g. Learning Difficulties and/or Learning Disabilities or other challenges currently.',
    },
    {
      id: 'c86be5ec-31fa-4dfa-8c0c-8fe13451b9f6',
      title: 'High complexity',
      description:
        'Service User is homeless or in temporary/unstable accommodation, or will be on release from prison. Service User has poor accommodation history, complex needs and limited skills to secure or sustain a tenancy.',
    },
  ]

  describe('complexityDescriptions', () => {
    it('sets each complexity level ID as the `value` on the presenter', () => {
      const presenter = new ComplexityLevelPresenter(draftReferral, socialInclusionComplexityLevels)

      const expectedValues = presenter.complexityDescriptions.map(description => description.value).sort()
      const complexityLevelIds = socialInclusionComplexityLevels.map(complexityLevel => complexityLevel.id).sort()

      expect(expectedValues).toEqual(complexityLevelIds)
    })

    it('sets each complexity level title as the `title` on the presenter', () => {
      const presenter = new ComplexityLevelPresenter(draftReferral, socialInclusionComplexityLevels)

      const expectedTitles = presenter.complexityDescriptions.map(description => description.title).sort()
      const complexityLevelIds = socialInclusionComplexityLevels.map(complexityLevel => complexityLevel.title).sort()

      expect(expectedTitles).toEqual(complexityLevelIds)
    })

    it('sets each complexity level description as the `hint` text on the presenter', () => {
      const presenter = new ComplexityLevelPresenter(draftReferral, socialInclusionComplexityLevels)

      const expectedHints = presenter.complexityDescriptions.map(description => description.hint).sort()
      const complexityLevelIds = socialInclusionComplexityLevels
        .map(complexityLevel => complexityLevel.description)
        .sort()

      expect(expectedHints).toEqual(complexityLevelIds)
    })

    describe('when the referral already has a selected complexity level', () => {
      it('sets checked to true for the referral’s selected complexity level', () => {
        draftReferral.complexityLevelId = '110f2405-d944-4c15-836c-0c6684e2aa78'
        const presenter = new ComplexityLevelPresenter(draftReferral, socialInclusionComplexityLevels)

        expect(presenter.complexityDescriptions.map(description => description.checked)).toEqual([false, true, false])
      })
    })

    describe('when there is user input data', () => {
      it('sets checked to true for the complexity level that the user chose', () => {
        const presenter = new ComplexityLevelPresenter(draftReferral, socialInclusionComplexityLevels, null, {
          'complexity-level': '110f2405-d944-4c15-836c-0c6684e2aa78',
        })

        expect(presenter.complexityDescriptions.map(description => description.checked)).toEqual([false, true, false])
      })
    })

    describe('when the referral already has a selected complexity level and there is user input data', () => {
      it('sets checked to true for the complexity level that the user chose', () => {
        draftReferral.complexityLevelId = 'd0db50b0-4a50-4fc7-a006-9c97530e38b2'
        const presenter = new ComplexityLevelPresenter(draftReferral, socialInclusionComplexityLevels, null, {
          'complexity-level': '110f2405-d944-4c15-836c-0c6684e2aa78',
        })

        expect(presenter.complexityDescriptions.map(description => description.checked)).toEqual([false, true, false])
      })
    })
  })

  describe('title', () => {
    it('returns a title', () => {
      const presenter = new ComplexityLevelPresenter(draftReferral, socialInclusionComplexityLevels)

      expect(presenter.title).toEqual('What is the complexity level for the social inclusion service?')
    })
  })
})
