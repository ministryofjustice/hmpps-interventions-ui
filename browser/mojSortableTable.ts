/* eslint-disable no-console */

/* Extends the MOJ Frontend’s sortable table component to preserve the table’s sort order
 * between page visits.
 *
 * This makes the following assumptions about the MOJ Frontend’s sortable table component (based on the code in
 * node_modules/@ministryofjustice/frontend/moj/components/sortable-table/sortable-table.js):
 *
 * 1. It works by inserting buttons into the table’s 'thead th' elements. Clicking these buttons
 *    changes the sort order.
 *
 * 2. Clicking on an unsorted column sorts it in ascending order. Clicking on a sorted column
 *    causes it to alternate between descending and ascending order.
 *
 * 3. The sortable table component modifies the aria-sort attribute of the table’s 'thead th'
 *    elements to reflect the current sort order.
 *
 * 4. The table can only be sorted by one column at a time.
 */

type ARIASort = 'none' | 'ascending' | 'descending'

interface SortOrderDTO {
  columnPersistentId: string
  order: ARIASort
}

class PersistentSortOrder {
  static activate(table: HTMLElement) {
    const tablePersistentId = table.dataset.persistentId

    if (tablePersistentId === undefined) {
      console.warn('Table has no data-persistent-id attribute; cannot set up persistent sort order.')
      return
    }

    this.observeAttributeChanges(tablePersistentId)

    const sortOrder = this.fetchSortOrderDTO(tablePersistentId)

    if (sortOrder !== null) {
      this.forceSortOrder(table, sortOrder)
    }
  }

  private static createARIASort(from: unknown): ARIASort | null {
    if (from === 'none' || from === 'ascending' || from === 'descending') {
      return from
    }

    return null
  }

  private static observeAttributeChanges(tablePersistentId: string) {
    const headers = document.querySelectorAll('thead th')

    headers.forEach(header => {
      const headerAriaSortAttribute = header.getAttribute('aria-sort')

      if (headerAriaSortAttribute === null) {
        return
      }

      const observer = new MutationObserver(mutationsList =>
        this.headingAttributesChanged(tablePersistentId, mutationsList)
      )
      observer.observe(header, { attributes: true })
    })
  }

  private static headingAttributesChanged(tablePersistentId: string, mutationsList: MutationRecord[]) {
    mutationsList.forEach(mutation => {
      if (mutation.type === 'attributes') {
        // All of the table’s headers receive mutation events, so
        // we need to figure out which of these was actually clicked. We do that
        // by finding out which of the columns is sorted (by looking at the
        // headers’ aria-sort attributes).

        const header = mutation.target as HTMLElement

        const newAriaSort = this.createARIASort(header.getAttribute('aria-sort'))

        if (newAriaSort === null) {
          console.warn('Unrecognised aria-sort attribute')
          return
        }

        const columnPersistentId = header.dataset.persistentId

        if (columnPersistentId === undefined) {
          console.warn('Column has no data-persistent-id attribute; cannot persist chosen order.')
          return
        }

        if (['descending', 'ascending'].includes(newAriaSort)) {
          this.persistSortOrder(tablePersistentId, columnPersistentId, newAriaSort)
        }
      }
    })
  }

  private static localStorageKey(tablePersistentId: string) {
    return `interventions:sortOrder:${tablePersistentId}`
  }

  private static persistSortOrder(tablePersistentId: string, columnPersistentId: string, order: string) {
    const key = this.localStorageKey(tablePersistentId)
    const object = { columnPersistentId, order }
    window.localStorage.setItem(key, JSON.stringify(object))
  }

  private static fetchSortOrderDTO(tablePersistentId: string): SortOrderDTO | null {
    const key = this.localStorageKey(tablePersistentId)
    const serialized = window.localStorage.getItem(key)

    if (serialized === null) {
      return null
    }

    const deserialized = JSON.parse(serialized) as unknown

    if (
      !(
        typeof deserialized === 'object' &&
        deserialized !== null &&
        'columnPersistentId' in deserialized &&
        'order' in deserialized
      )
    ) {
      return null
    }

    // I’m not sure why a cast is necessary; I’d have thought the compiler
    // would allow us to assign directly to a variable of this type given
    // the above check, but no…

    const keyed = deserialized as {
      columnPersistentId: unknown
      order: unknown
    }

    if (!(typeof keyed.columnPersistentId === 'string')) {
      return null
    }

    const withTypedValues: { columnPersistentId: string; order: ARIASort | null } = {
      columnPersistentId: keyed.columnPersistentId,
      order: this.createARIASort(keyed.order),
    }

    if (withTypedValues.order === null) {
      return null
    }

    // Ditto re “not sure why a cast is necessary”
    return withTypedValues as { columnPersistentId: string; order: ARIASort }
  }

  private static forceSortOrder(table: HTMLElement, sortOrder: SortOrderDTO) {
    const headers = table.querySelectorAll('thead th') as NodeListOf<HTMLTableCellElement>

    const header = Array.from(headers).find(aheader => aheader.dataset.persistentId === sortOrder.columnPersistentId)

    if (header === undefined) {
      console.warn("Couldn't find header with persistent ID ", sortOrder.columnPersistentId)
      return
    }

    // Now we find the button for sorting this column, and we programatically click it.

    const buttons = header.querySelectorAll('button[data-index]') as NodeListOf<HTMLButtonElement>

    if (buttons.length === 0) {
      console.warn('No buttons found in header. Not forcing sort order.')
      return
    }
    if (buttons.length > 1) {
      console.warn('Multiple buttons found in header. Not forcing sort order.')
      return
    }

    const button = buttons[0]

    const currentAriaSort = this.createARIASort(header.getAttribute('aria-sort'))

    if (currentAriaSort === null) {
      console.warn('Couldn’t parse current aria-sort attribute')
      return
    }

    const numberOfClicks = this.clickCountToTransition({ fromAriaSort: currentAriaSort, toAriaSort: sortOrder.order })
    for (let i = 0; i < numberOfClicks; i += 1) {
      button.click()
    }
  }

  private static clickCountToTransition({
    fromAriaSort,
    toAriaSort,
  }: {
    fromAriaSort: ARIASort
    toAriaSort: ARIASort
  }) {
    if (fromAriaSort === toAriaSort) {
      return 0
    }

    if (toAriaSort === 'none') {
      console.warn('Tried to transition from sorted to unsorted, not allowed')
      return 0
    }

    if (fromAriaSort === 'none') {
      return ['ascending', 'descending'].indexOf(toAriaSort) + 1
    }

    return 1
  }
}

$(() => {
  const tables = document.getElementsByTagName('table')
  if (tables.length === 0) {
    console.warn('No tables found in document. Not setting up sortable table.')
    return
  }
  if (tables.length > 1) {
    console.warn('Multiple tables found in document. Not setting up sortable table.')
    return
  }

  const table = tables[0]

  // eslint-disable-next-line no-new
  new MOJFrontend.SortableTable({ table })

  PersistentSortOrder.activate(table)
})
