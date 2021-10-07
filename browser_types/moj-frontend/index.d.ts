declare module '@ministryofjustice/frontend' {
  interface SortableTable {
    new ({ table }: { table: Node })
  }
}

declare const MOJFrontend: { SortableTable: SortableTable }
