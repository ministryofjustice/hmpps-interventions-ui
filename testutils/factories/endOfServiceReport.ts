import { Factory } from 'fishery'
import { EndOfServiceReport } from '../../server/services/interventionsService'

class EndOfServiceReportFactory extends Factory<EndOfServiceReport> {
  justCreated() {
    return this
  }

  notSubmitted() {
    return this
  }

  submitted() {
    return this.params({ submittedAt: new Date().toISOString() })
  }
}

export default EndOfServiceReportFactory.define(({ sequence }) => ({
  id: sequence.toString(),
  referralId: '81d754aa-d868-4347-9c0f-50690773014e',
  submittedAt: null,
  furtherInformation: null,
  outcomes: [],
}))
