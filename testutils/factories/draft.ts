import { Factory } from 'fishery'
import { Draft } from '../../server/services/draftsService'

// eslint-disable-next-line import/prefer-default-export
export function createDraftFactory<Data>(defaultData: Data): Factory<Draft<Data>> {
  return Factory.define<Draft<Data>>(({ sequence }) => {
    const now = new Date()
    return {
      id: sequence.toString(),
      softDeleted: false,
      type: 'someExampleType',
      createdAt: now,
      createdBy: { id: 'someUserId' },
      updatedAt: now,
      data: defaultData,
    }
  })
}
