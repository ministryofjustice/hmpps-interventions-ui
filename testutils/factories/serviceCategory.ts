import { Factory } from 'fishery'
import { ServiceCategory } from '../../server/services/interventionsService'

export default Factory.define<ServiceCategory>(({ sequence }) => ({
  id: sequence.toString(),
  name: 'accommodation',
  complexityLevels: [
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
  ],
}))
