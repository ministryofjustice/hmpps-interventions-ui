import { Factory } from 'fishery'
import Prisoner from '../../server/models/prisonerOffenderSearch/prisoner'

export default Factory.define<Prisoner>(() => ({
  prisonId: 'MDI',
  prisonerNumber: 'A6838DA',
  releaseDate: '2023-05-02',
  confirmedReleaseDate: '2023-05-01',
  nonDtoReleaseDate: '2023-05-01',
  automaticReleaseDate: '2023-05-01',
  postRecallReleaseDate: '2023-05-01',
  conditionalReleaseDate: '2023-05-01',
  actualParoleDate: '2023-05-01',
  dischargeDate: '2020-05-01',
}))
