import { Request } from 'express'
import { InterventionsFilterParams } from '../../services/interventionsService'

export default class InterventionsFilter {
  pccRegionIds: string[] | undefined

  gender: ('male' | 'female')[] | undefined

  age: '18-to-25-only'[] | undefined

  static fromRequest(request: Request): InterventionsFilter {
    const filter = new InterventionsFilter()

    filter.pccRegionIds = request.query['pcc-region-ids'] as string[] | undefined
    filter.gender = request.query.gender as ('male' | 'female')[] | undefined
    filter.age = request.query.age as '18-to-25-only'[] | undefined

    return filter
  }

  get params(): InterventionsFilterParams {
    const params: InterventionsFilterParams = {}

    if (this.pccRegionIds !== undefined) {
      params.pccRegionIds = this.pccRegionIds
    }

    if (this.gender !== undefined) {
      if (this.gender.includes('male')) {
        params.allowsMale = true
      }

      if (this.gender.includes('female')) {
        params.allowsFemale = true
      }
    }

    if (this.age !== undefined) {
      if (this.age.includes('18-to-25-only')) {
        params.maximumAge = 25
      }
    }

    return params
  }
}
