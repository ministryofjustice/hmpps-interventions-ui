import Intervention from '../models/intervention'

export default class InterventionDecorator {
  constructor(private readonly intervention: Intervention) {}

  get isCohortIntervention(): boolean {
    return this.intervention.serviceCategories.length > 1
  }
}
