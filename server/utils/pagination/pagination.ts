import { Page } from '../../models/pagination'

interface MojPaginationArgs {
  classes?: string
  items: (
    | {
        type: 'dots'
      }
    | {
        type: 'pageNumber'
        selected: boolean
        text: number
        href: string
      }
  )[]
  previous?: {
    text: string
    href: string
  }
  next?: {
    text: string
    href: string
  }
  results?: {
    from: number
    to: number
    count: number
  }
}

export default class Pagination {
  constructor(private readonly page: Page<unknown>) {}

  private constructPageItems(pageNumberRange: number[], chosenPageNumber: number): MojPaginationArgs['items'] {
    return pageNumberRange.map(pageNumber => {
      return {
        type: 'pageNumber',
        selected: chosenPageNumber === pageNumber,
        text: pageNumber,
        href: `?page=${pageNumber}`,
      }
    })
  }

  get mojPaginationArgs(): MojPaginationArgs {
    const { totalPages } = this.page
    if (totalPages <= 1) {
      return {
        items: [],
      }
    }
    const count = this.page.totalElements
    // page.number is zero indexed
    const zeroIndexPageNumber = this.page.number
    const chosenPageNumber = zeroIndexPageNumber + 1
    const pageSize = this.page.size
    const from = zeroIndexPageNumber * pageSize + 1
    let to = from + pageSize - 1
    if (to > count) {
      to = count
    }
    const items: MojPaginationArgs['items'] = []
    if (totalPages <= 5) {
      items.push(
        ...this.constructPageItems(
          Array.from(new Array(totalPages).keys()).map(i => i + 1),
          chosenPageNumber
        )
      )
    } else if (chosenPageNumber < 4) {
      items.push(...this.constructPageItems([1, 2, 3, 4], chosenPageNumber))
      items.push({ type: 'dots' })
      items.push(...this.constructPageItems([totalPages], chosenPageNumber))
    } else if (chosenPageNumber > totalPages - 3) {
      const lastPages = [totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
      items.push(...this.constructPageItems([1], chosenPageNumber))
      items.push({ type: 'dots' })
      items.push(...this.constructPageItems(lastPages, chosenPageNumber))
    } else {
      const middlePages = [chosenPageNumber - 1, chosenPageNumber, chosenPageNumber + 1]
      items.push(...this.constructPageItems([1], chosenPageNumber))
      items.push({ type: 'dots' })
      items.push(...this.constructPageItems(middlePages, chosenPageNumber))
      items.push({ type: 'dots' })
      items.push(...this.constructPageItems([totalPages], chosenPageNumber))
    }
    return {
      items,
      previous: chosenPageNumber === 1 ? undefined : { text: 'Previous', href: `?page=${chosenPageNumber - 1}` },
      next: chosenPageNumber === totalPages ? undefined : { text: 'Next', href: `?page=${chosenPageNumber + 1}` },
      results: { from, to, count },
    }
  }
}
