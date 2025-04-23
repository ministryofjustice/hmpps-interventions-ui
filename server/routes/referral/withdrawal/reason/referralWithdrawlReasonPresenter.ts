import DeliusServiceUser from '../../../../models/delius/deliusServiceUser'
import WithdrawalReason from '../../../../models/withdrawalReason'
import SentReferral, { WithdrawalState } from '../../../../models/sentReferral'
import { FormValidationError } from '../../../../utils/formValidationError'
import PresenterUtils from '../../../../utils/presenterUtils'
import Intervention from '../../../../models/intervention'
import DraftWithdrawalData from '../draftWithdrawalData'
import { Draft } from '../../../../services/draftsService'
import ViewUtils from '../../../../utils/viewUtils'

export default class ReferralWithdrawalReasonPresenter {
  constructor(
    private readonly draftWithdrawal: Draft<DraftWithdrawalData>,
    private readonly sentReferral: SentReferral,
    private readonly intervention: Intervention,
    private readonly serviceUser: DeliusServiceUser,
    readonly withdrawalReasons: WithdrawalReason[],
    private readonly error: FormValidationError | null = null,
    readonly userInputData: Record<string, unknown> | null = null
  ) {}

  readonly backLinkHref = `/probation-practitioner/referrals/${this.sentReferral.id}/progress`

  readonly text = {
    title: `Why are you withdrawing ${this.serviceUser.name.forename} ${this.serviceUser.name.surname}’s ${this.intervention.contractType.name} referral?`,
  }

  readonly showPostICAOptions =
    this.sentReferral.withdrawalState === WithdrawalState.postICA ||
    this.sentReferral.withdrawalState === WithdrawalState.postICAClosed

  get problemReasonsFields(): { value: string; text: string; checked: boolean }[] {
    return this.getRadioArgs('problem')
  }

  get userReasonsFields(): { value: string; text: string; checked: boolean }[] {
    return this.getRadioArgs('user')
  }

  get sentenceReasonsFields(): { value: string; text: string; checked: boolean }[] {
    return this.getRadioArgs('sentence')
  }

  get earlyReasonsFields(): { value: string; text: string; checked: boolean }[] {
    return this.getRadioArgs('early')
  }

  get otherReasonsFields(): { value: string; text: string; checked: boolean }[] {
    return this.getRadioArgs('other')
  }

  private getRadioArgs(grouping: string): { value: string; text: string; checked: boolean }[] {
    return this.withdrawalReasons
      .filter(x => x.grouping === grouping)
      .map(withdrawalReasons => ({
        value: withdrawalReasons.code,
        text: withdrawalReasons.description,
        checked: this.fields.withdrawalReason.value === withdrawalReasons.code,
        conditional: {
          html: {
            name: `withdrawal-comments-${withdrawalReasons.code}`,
            id: `withdrawal-comments-${withdrawalReasons.code}`,
            label: {
              classes: 'govuk-label--m govuk-!-margin-bottom-4',
              isPageHeading: false,
            },
            hint: {
              text: 'Provide more information',
            },
            value: this.fields.withdrawalComments[withdrawalReasons.code].value,
            errorMessage: ViewUtils.govukErrorMessage(
              this.fields.withdrawalComments[withdrawalReasons.code].errorMessage
            ),
          },
        },
      }))
  }

  private readonly utils = new PresenterUtils(this.userInputData)

  readonly fields = {
    withdrawalReason: {
      value: this.utils.stringValue(this.draftWithdrawal.data.withdrawalReason || null, 'withdrawal-reason'),
      errorMessage: ViewUtils.govukErrorMessage(PresenterUtils.errorMessage(this.error, 'withdrawal-reason')),
    },
    withdrawalComments: {
      INE: {
        value: this.utils.stringValue(null, 'withdrawal-comments-INE'),
        errorMessage: PresenterUtils.errorMessage(this.error, 'withdrawal-comments-INE'),
      },
      MIS: {
        value: this.utils.stringValue(this.draftWithdrawal.data.withdrawalComments, 'withdrawal-comments-MIS'),
        errorMessage: PresenterUtils.errorMessage(this.error, 'withdrawal-comments-MIS'),
      },
      NOT: {
        value: this.utils.stringValue(this.draftWithdrawal.data.withdrawalComments, 'withdrawal-comments-NOT'),
        errorMessage: PresenterUtils.errorMessage(this.error, 'withdrawal-comments-NOT'),
      },
      NEE: {
        value: this.utils.stringValue(this.draftWithdrawal.data.withdrawalComments, 'withdrawal-comments-NEE'),
        errorMessage: PresenterUtils.errorMessage(this.error, 'withdrawal-comments-NEE'),
      },
      MOV: {
        value: this.utils.stringValue(this.draftWithdrawal.data.withdrawalComments, 'withdrawal-comments-MOV'),
        errorMessage: PresenterUtils.errorMessage(this.error, 'withdrawal-comments-MOV'),
      },
      WOR: {
        value: this.utils.stringValue(this.draftWithdrawal.data.withdrawalComments, 'withdrawal-comments-WOR'),
        errorMessage: PresenterUtils.errorMessage(this.error, 'withdrawal-comments-WOR'),
      },
      USE: {
        value: this.utils.stringValue(this.draftWithdrawal.data.withdrawalComments, 'withdrawal-comments-USE'),
        errorMessage: PresenterUtils.errorMessage(this.error, 'withdrawal-comments-USE'),
      },
      ACQ: {
        value: this.utils.stringValue(this.draftWithdrawal.data.withdrawalComments, 'withdrawal-comments-ACQ'),
        errorMessage: PresenterUtils.errorMessage(this.error, 'withdrawal-comments-ACQ'),
      },
      RET: {
        value: this.utils.stringValue(this.draftWithdrawal.data.withdrawalComments, 'withdrawal-comments-RET'),
        errorMessage: PresenterUtils.errorMessage(this.error, 'withdrawal-comments-RET'),
      },
      SER: {
        value: this.utils.stringValue(this.draftWithdrawal.data.withdrawalComments, 'withdrawal-comments-SER'),
        errorMessage: PresenterUtils.errorMessage(this.error, 'withdrawal-comments-SER'),
      },
      SEE: {
        value: this.utils.stringValue(this.draftWithdrawal.data.withdrawalComments, 'withdrawal-comments-SEE'),
        errorMessage: PresenterUtils.errorMessage(this.error, 'withdrawal-comments-SEE'),
      },
      ANO: {
        value: this.utils.stringValue(this.draftWithdrawal.data.withdrawalComments, 'withdrawal-comments-ANO'),
        errorMessage: PresenterUtils.errorMessage(this.error, 'withdrawal-comments-ANO'),
      },
      EAR: {
        value: this.utils.stringValue(this.draftWithdrawal.data.withdrawalComments, 'withdrawal-comments-EAR'),
        errorMessage: PresenterUtils.errorMessage(this.error, 'withdrawal-comments-EAR'),
      },
    },
  } as any

  readonly errorSummary = PresenterUtils.errorSummary(this.error)
}
