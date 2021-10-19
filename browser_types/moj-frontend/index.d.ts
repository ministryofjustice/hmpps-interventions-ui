declare module '@ministryofjustice/frontend' {
  interface SortableTable {
    new ({ table }: { table: Node })
    sort(rows: HTMLTableRowElement[], columnNumber: number, sortDirection: string): HTMLTableRowElement[]
  }
}

declare const MOJFrontend: { SortableTable: SortableTable }
