import { Request } from 'express'
import { UpdateDraftEndOfServiceReportParams } from '../../services/interventionsService'

export default class EndOfServiceReportFurtherInformationForm {
  constructor(private readonly request: Request) {}

  readonly paramsForUpdate: Partial<UpdateDraftEndOfServiceReportParams> = {
    furtherInformation: this.request.body['further-information'] ?? '',
  }
}
