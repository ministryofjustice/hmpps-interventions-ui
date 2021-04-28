import DesiredOutcome from './desiredOutcome'
import ComplexityLevel from './complexityLevel'

export default interface ServiceCategory {
  id: string
  name: string
  complexityLevels: ComplexityLevel[]
  desiredOutcomes: DesiredOutcome[]
}
