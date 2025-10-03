/* eslint-disable no-console */

/* Extends the MOJ Frontend’s sortable table component to preserve the table’s sort order
 * between page visits (by reloading the page with the sort order in the url)
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
// eslint-disable-next-line max-classes-per-file
class PersistentServerSideSortOrder {
  static activate() {
    this.observeAttributeChanges()
  }

  private static createARIASort(from: unknown): ARIASort | null {
    if (from === 'none' || from === 'ascending' || from === 'descending') {
      return from
    }

    return null
  }

  private static observeAttributeChanges() {
    const headers = document.querySelectorAll('thead th')

    // IE11 doesn't allow us to call `forEach` on NodeListOf<Element>
    Array.prototype.forEach.call(headers, header => {
      const headerAriaSortAttribute = header.getAttribute('aria-sort')

      if (headerAriaSortAttribute === null) {
        return
      }

      const observer = new MutationObserver(mutationsList => this.headingAttributesChanged(mutationsList))
      observer.observe(header, { attributes: true })
    })
  }

  private static headingAttributesChanged(mutationsList: MutationRecord[]) {
    // IE11 doesn't allow us to call `forEach` on NodeListOf<Element>
    Array.prototype.forEach.call(mutationsList, mutation => {
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

        this.redirectToSorted(columnPersistentId, newAriaSort)
      }
    })
  }

  private static redirectToSorted(columnPersistentId: string, newAriaSortOrder: string) {
    // IE11 doesn't support `.includes`, so we're using `indexOf` here.
    if (['descending', 'ascending'].indexOf(newAriaSortOrder) > -1) {
      const redirectLocation = window.location.href.split('?')[0]
      // eslint-disable-next-line no-unused-expressions
      if (window.location.href.includes('paginatedSearch=true')) {
        window.location.replace(
          `${redirectLocation}?paginatedSearch=true&sort=${columnPersistentId},${newAriaSortOrder}`
        )
      } else {
        window.location.replace(`${redirectLocation}?sort=${columnPersistentId},${newAriaSortOrder}`)
      }
    }
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

  class NonSortingSortableTable extends MOJFrontend.SortableTable {
    constructor(tableElement: HTMLTableElement) {
      super({ table: tableElement })
    }

    // overrides MOJFrontend.SortableTable.sort function
    sort(rows: HTMLTableRowElement[]): HTMLTableRowElement[] {
      return rows
    }
  }

  // eslint-disable-next-line no-new
  new NonSortingSortableTable(table)

  PersistentServerSideSortOrder.activate()
})
