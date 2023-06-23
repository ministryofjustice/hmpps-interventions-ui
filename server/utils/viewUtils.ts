import * as nunjucks from 'nunjucks'
import { ListStyle, SummaryListItem, SummaryListItemContent } from './summaryList'
import { ErrorSummaryArgs, SummaryListArgs, TableArgs, TableArgsHeadElement, TagArgs } from './govukFrontendTypes'
import SessionStatusPresenter from '../routes/shared/sessionStatusPresenter'
import { PrimaryNavBarItem } from '../routes/shared/primaryNavBar/primaryNavBarPresenter'
import AuthUserDetails from '../models/hmppsAuth/authUserDetails'
import { RiskInformationArgs } from '../routes/makeAReferral/risk-information/oasys/riskInformationLabels'

export type SortableTableHeaders = {
  text: string
  sort: 'ascending' | 'descending' | 'none'
  persistentId: string | null
}[]
export type SortableTableRow = {
  text: string
  sortValue: string | null
  href: string | null
  doubleCell: boolean | null
}[]

export default class ViewUtils {
  static escape(val: string): string {
    const escape = new nunjucks.Environment().getFilter('escape')
    return escape(val).val
  }

  static nl2br(val: string): string {
    // this is a weird condition - but it's possible to trick the compiler into letting you call this method
    // with non string objects via the template callback mechanism we have for govuk frontend macros.
    // in that instance the type of val is a nunjucks `SafeString`, and everything still works as expected.
    if (typeof val !== 'string') return val

    const nl2br = new nunjucks.Environment().getFilter('nl2br')
    return nl2br(val)
  }

  static govukErrorMessage(message: string | null | undefined): { text: string } | null {
    return message === null || message === undefined ? null : { text: message }
  }

  static govukErrorSummaryArgs(errorSummary: { field: string; message: string }[] | null): ErrorSummaryArgs | null {
    if (errorSummary === null) {
      return null
    }

    return {
      titleText: 'There is a problem',
      errorList: errorSummary.map(error => {
        return {
          text: error.message,
          href: `#${error.field}`,
        }
      }),
    }
  }

  private static isAuthUserDetails(line: SummaryListItemContent): line is AuthUserDetails {
    return (<AuthUserDetails>line).username !== undefined
  }

  private static summaryListItemLine(line: SummaryListItemContent): string {
    if (ViewUtils.isAuthUserDetails(line)) {
      const name = `${line.firstName} ${line.lastName}`
      return `${ViewUtils.escape(name)} (<a href="mailto: ${ViewUtils.escape(line.email)}">${ViewUtils.escape(
        line.email
      )}</a>)`
    }
    return `${ViewUtils.escape(line)}`
  }

  static summaryListArgs(
    summaryListItems: SummaryListItem[],
    options: { showBorders: boolean } = { showBorders: true }
  ): SummaryListArgs {
    return {
      classes: options.showBorders ? undefined : 'govuk-summary-list--no-border',
      rows: summaryListItems.map((item, index) => {
        return {
          key: {
            text: item.key,
          },
          value: (() => {
            if (item.listStyle !== undefined) {
              const itemClass = `govuk-list${item.listStyle === ListStyle.bulleted ? ' govuk-list--bullet' : ''}`
              const html = `<ul class="${itemClass}">${item.lines
                .map(line => `<li>${ViewUtils.summaryListItemLine(line)}</li>`)
                .join('\n')}</ul>`
              return { html }
            }

            const html = item.lines
              .map(line => `<p class="govuk-body">${ViewUtils.nl2br(ViewUtils.summaryListItemLine(line))}</p>`)
              .join('\n')
            return { html }
          })(),
          actions: (() => {
            if (item.changeLink) {
              return {
                items: [
                  {
                    href: item.changeLink,
                    text: 'Change',
                    attributes: { id: `change-link-${index}` },
                  },
                ],
              }
            }
            return null
          })(),
        }
      }),
    }
  }

  static summaryListArgsWithSummaryCard(
    summaryListItems: SummaryListItem[],
    heading: string | null | undefined = null,
    options: { showBorders: boolean; showTitle: boolean } = { showBorders: true, showTitle: true }
  ): SummaryListArgs {
    return {
      card: (() => {
        if (options.showTitle) {
          return {
            title: {
              text: heading,
            },
          }
        }
        return null
      })(),
      classes: options.showBorders ? undefined : 'govuk-summary-list--no-border',
      rows: summaryListItems.map((item, index) => {
        return {
          key: {
            text: item.key,
          },
          value: (() => {
            if (item.listStyle !== undefined) {
              const itemClass = `govuk-list${item.listStyle === ListStyle.bulleted ? ' govuk-list--bullet' : ''}`
              const html = `<ul class="${itemClass}">${item.lines
                .map(line => `<li>${ViewUtils.summaryListItemLine(line)}</li>`)
                .join('\n')}</ul>`
              return { html }
            }
            const html = item.lines
              .map(line => `<p class="govuk-body">${ViewUtils.nl2br(ViewUtils.summaryListItemLine(line))}</p>`)
              .join('\n')
            return { html }
          })(),
          actions: (() => {
            if (item.changeLink) {
              return {
                items: [
                  {
                    href: item.changeLink,
                    text: 'Change',
                    attributes: { id: `change-link-${index}` },
                  },
                ],
              }
            }
            return null
          })(),
        }
      }),
    }
  }

  static summaryListArgsForRiskInfo(
    riskInformationArgs: RiskInformationArgs,
    heading: string | null | undefined = null,
    options: { showBorders: boolean; showTitle: boolean } = { showBorders: true, showTitle: true }
  ): SummaryListArgs {
    return {
      card: (() => {
        if (options.showTitle) {
          return {
            title: {
              text: heading,
            },
          }
        }
        return null
      })(),
      classes: options.showBorders ? undefined : 'govuk-summary-list--no-border',
      rows: [
        {
          key: {
            text: 'Who is at risk',
          },
          value: (() => {
            let html = ''
            if (riskInformationArgs.summary.whoIsAtRisk.label) {
              html = `<p class="govuk-body ${riskInformationArgs.summary.whoIsAtRisk.label.class}">${ViewUtils.nl2br(
                ViewUtils.summaryListItemLine(riskInformationArgs.summary.whoIsAtRisk.label.text)
              )}</p>`
              html += '\n'
            }
            if (riskInformationArgs.summary.whoIsAtRisk.text !== null) {
              html = `<p class="govuk-body">${ViewUtils.nl2br(
                ViewUtils.summaryListItemLine(riskInformationArgs.summary.whoIsAtRisk.text)
              )}</p>`
            }
            return { html }
          })(),
        },
        {
          key: {
            text: 'What is the nature of the risk',
          },
          value: (() => {
            let html = ''
            if (riskInformationArgs.summary.natureOfRisk.label) {
              html = `<p class="govuk-body ${riskInformationArgs.summary.natureOfRisk.label.class}">${ViewUtils.nl2br(
                ViewUtils.summaryListItemLine(riskInformationArgs.summary.natureOfRisk.label.text)
              )}</p>`
              html += '\n'
            }
            if (riskInformationArgs.summary.natureOfRisk.text !== null) {
              html = `<p class="govuk-body">${ViewUtils.nl2br(
                ViewUtils.summaryListItemLine(riskInformationArgs.summary.natureOfRisk.text)
              )}</p>`
            }
            return { html }
          })(),
        },
        {
          key: {
            text: 'When is the risk likely to be greatest',
          },
          value: (() => {
            let html = ''
            if (riskInformationArgs.summary.riskImminence.label) {
              html = `<p class="govuk-body ${riskInformationArgs.summary.riskImminence.label.class}">${ViewUtils.nl2br(
                ViewUtils.summaryListItemLine(riskInformationArgs.summary.riskImminence.label.text)
              )}</p>`
              html += '\n'
            }
            if (riskInformationArgs.summary.riskImminence.text !== null) {
              html = `<p class="govuk-body">${ViewUtils.nl2br(
                ViewUtils.summaryListItemLine(riskInformationArgs.summary.riskImminence.text)
              )}</p>`
            }
            return { html }
          })(),
        },
        {
          key: {
            text: 'Concerns in relation to self-harm',
          },
          value: (() => {
            let html = `<p class="govuk-body ${riskInformationArgs.riskToSelf.selfHarm.label.class}">${ViewUtils.nl2br(
              ViewUtils.summaryListItemLine(riskInformationArgs.riskToSelf.selfHarm.label.text)
            )}</p>`
            if (riskInformationArgs.riskToSelf.selfHarm.text !== null) {
              html += '\n'
              html = `<p class="govuk-body">${ViewUtils.nl2br(
                ViewUtils.summaryListItemLine(riskInformationArgs.riskToSelf.selfHarm.text)
              )}</p>`
            }
            return { html }
          })(),
        },
        {
          key: {
            text: 'Concerns in relation to suicide',
          },
          value: (() => {
            let html = `<p class="govuk-body ${riskInformationArgs.riskToSelf.suicide.label.class}">${ViewUtils.nl2br(
              ViewUtils.summaryListItemLine(riskInformationArgs.riskToSelf.suicide.label.text)
            )}</p>`
            if (riskInformationArgs.riskToSelf.suicide.text !== null) {
              html += '\n'
              html = `<p class="govuk-body">${ViewUtils.nl2br(
                ViewUtils.summaryListItemLine(riskInformationArgs.riskToSelf.suicide.text)
              )}</p>`
            }
            return { html }
          })(),
        },
        {
          key: {
            text: 'Concerns in relation to coping in a hostel setting',
          },
          value: (() => {
            let html = `<p class="govuk-body ${
              riskInformationArgs.riskToSelf.hostelSetting.label.class
            }">${ViewUtils.nl2br(
              ViewUtils.summaryListItemLine(riskInformationArgs.riskToSelf.hostelSetting.label.text)
            )}</p>`
            if (riskInformationArgs.riskToSelf.hostelSetting.text !== null) {
              html += '\n'
              html = `<p class="govuk-body">${ViewUtils.nl2br(
                ViewUtils.summaryListItemLine(riskInformationArgs.riskToSelf.hostelSetting.text)
              )}</p>`
            }
            return { html }
          })(),
        },
        {
          key: {
            text: 'Concerns in relation to vulnerability',
          },
          value: (() => {
            let html = `<p class="govuk-body ${
              riskInformationArgs.riskToSelf.vulnerability.label.class
            }">${ViewUtils.nl2br(
              ViewUtils.summaryListItemLine(riskInformationArgs.riskToSelf.vulnerability.label.text)
            )}</p>`
            if (riskInformationArgs.riskToSelf.vulnerability.text !== null) {
              html += '\n'
              html = `<p class="govuk-body">${ViewUtils.nl2br(
                ViewUtils.summaryListItemLine(riskInformationArgs.riskToSelf.vulnerability.text)
              )}</p>`
            }
            return { html }
          })(),
        },
        {
          key: {
            text: 'Additional information',
          },
          value: (() => {
            let html = ''
            if (riskInformationArgs.additionalRiskInformation.label) {
              html = `<p class="govuk-body ${
                riskInformationArgs.additionalRiskInformation.label.class
              }">${ViewUtils.nl2br(
                ViewUtils.summaryListItemLine(riskInformationArgs.additionalRiskInformation.label.text)
              )}</p>`
              html += '\n'
            }
            if (riskInformationArgs.additionalRiskInformation.text !== null) {
              html = `<p class="govuk-body">${ViewUtils.nl2br(
                ViewUtils.summaryListItemLine(riskInformationArgs.additionalRiskInformation.text)
              )}</p>`
            }
            return { html }
          })(),
        },
      ],
    }
  }

  static sortableTable(
    persistentId: string,
    headers: SortableTableHeaders,
    rows: SortableTableRow[],
    options?: { secondOrderColumnNumber?: number }
  ): TableArgs {
    const tableAttributes = { 'data-persistent-id': persistentId }
    if (options && options.secondOrderColumnNumber !== undefined) {
      tableAttributes['second-order-column'] = options.secondOrderColumnNumber
    }
    return {
      attributes: tableAttributes,
      head: headers.map(heading => {
        const head: TableArgsHeadElement = { text: heading.text }
        // headings without a defined persistent id cannot be sorted
        if (heading.persistentId) {
          head.attributes = {
            'aria-sort': heading.sort,
            'data-persistent-id': heading.persistentId,
          }
        } else {
          // non-sortable headers use the default color (black),
          // which looks weird - this class ensures they match.
          head.classes = 'non-sortable__sortable-table-header'
        }

        return head
      }),
      rows: rows.map(row => {
        return row.map(cell => {
          const result: Record<string, unknown> = {}

          if (cell.sortValue !== null) {
            result.attributes = { 'data-sort-value': cell.sortValue }
          }

          if (cell.href === null) {
            result.text = cell.text
          } else if (cell.doubleCell) {
            result.html = `<a href="${cell.href}" class="govuk-link">${ViewUtils.escape(cell.text.split(':')[0])}</a>
            <br><span class="govuk-body-s">${ViewUtils.escape(cell.text.split(':')[1])}</span>`
          } else {
            result.html = `<a href="${cell.href}" class="govuk-link">${ViewUtils.escape(cell.text)}</a>`
          }
          return result
        })
      }),
    }
  }

  static primaryNav(items: PrimaryNavBarItem[]): Record<string, unknown> {
    return {
      label: 'Primary navigation',
      containerClasses: 'refer-and-monitor__primary-navigation',
      items,
    }
  }

  static linkHtml(links: { text: string; href: string; hiddenText?: string }[]): string {
    return links
      .map(link => {
        const hiddenLinkHtml = link.hiddenText
          ? `<span class="govuk-visually-hidden">${ViewUtils.escape(link.hiddenText)}</span>`
          : ''

        return `<a class="govuk-link" href="${ViewUtils.escape(link.href)}">${ViewUtils.escape(
          link.text
        )}${hiddenLinkHtml}</a>`
      })
      .join('<br>')
  }

  static sessionStatusTagHtml(presenter: SessionStatusPresenter, tagMacro: (args: TagArgs) => string): string {
    return tagMacro({ text: presenter.text, classes: presenter.tagClass })
  }

  static changelogDetailTagHtml(value: string, colorClass: string, tagMacro: (args: TagArgs) => string): string {
    return tagMacro({ html: value, classes: colorClass })
  }
}
