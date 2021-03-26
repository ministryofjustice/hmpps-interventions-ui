import NestedObjectProperty from './nestedObjectProperty'
import { capitalise, indentString } from './utils'

export default class Property {
  constructor(private readonly containingTypeName: string, readonly macroOptions: Record<string, unknown>) {}

  get name(): string {
    return this.macroOptions.name as string
  }

  get isIncluded(): boolean {
    if (['RadiosArgsItem', 'CheckboxesArgsItem'].includes(this.containingTypeName)) {
      // These two components’ macro-options.json include a `conditional`
      // property of boolean type, as well as a `conditional.html` property of
      // string type. These creates a clash, since they’d both map to a property
      // named `conditional`. However, looking at the macro.njk for these components,
      // it looks like the boolean property is an error in the options file, so we
      // can just ignore it.
      return this.name !== 'conditional'
    }

    return true
  }

  get definitionLine(): string {
    let result = ''

    if (!this.describesPropertyOfNestedObject && this.macroOptions.description) {
      result += `/*
${indentString((this.macroOptions.description ?? '') as string, 4)}
  */\n`
    }

    let propertyName = this.name
    if (this.describesPropertyOfNestedObject) {
      propertyName = this.nestedObjectProperty!.objectName
    }

    result += `'${propertyName}'${this.isRequired ? '' : '?'}: ${this.typeForDefinition}\n`

    return result
  }

  get nestedObjectProperty(): NestedObjectProperty | null {
    if (NestedObjectProperty.describesPropertyOfNestedObject(this.name)) {
      return new NestedObjectProperty(this.containingTypeName, this.name)
    }

    return null
  }

  get describesPropertyOfNestedObject(): boolean {
    return this.nestedObjectProperty !== null
  }

  private get isRequired(): boolean {
    // Although the *Html and *Text properties are usually marked as required
    // in the macro-options.json, in practice (and as explained in the properties’
    // descriptions) the actual requirement is that one or the other be provided.
    // Hence, we mark both as non-required in our generated types. (Perhaps there’s
    // a way in the TypeScript type system to express that at least one of them
    // must be provided, but I don’t know it.)
    if (this.isHtml || this.isText) {
      return false
    }

    if (this.describesPropertyOfNestedObject) {
      // The macro-options.json files aren’t capable of describing whether the
      // object within which a dotted property is nested is required or not.
      // So we’ll mark them as not required.
      return false
    }

    return this.macroOptions.required as boolean
  }

  private nameContainsCaseInsensitive(value: string): boolean {
    return this.name.toLowerCase().includes(value.toLowerCase())
  }

  private get isHtml(): boolean {
    return this.nameContainsCaseInsensitive('html')
  }

  private get isText(): boolean {
    return this.nameContainsCaseInsensitive('text')
  }

  // The macro-options.json definition of a table’s `rows` property is misleading:
  // the `params` property there actually describes an individual table _cell_. But,
  // from looking at the example usage of the table macro, we see that the `rows`
  // property expects an _array of arrays_ of cells. So, to handle this, we add some
  // special case logic which:
  //
  // - outputs a property `rows: TableArgsRow[]`
  // - outputs a type `TableArgsCell`
  // - outputs an additional declaration `type TableArgsRow = TableArgsCell[]`
  private get isTableRows(): boolean {
    return this.containingTypeName === 'TableArgs' && this.name === 'rows'
  }

  private get typeForDefinition(): string {
    let typeWithoutNullability = ''
    let comment = ''

    if (this.describesPropertyOfNestedObject) {
      typeWithoutNullability = this.nestedObjectProperty!.objectTypeName
    } else {
      switch (this.macroOptions.type) {
        case 'object':
          if (this.macroOptions.isComponent) {
            // This property’s type is used as the arguments of another
            // component; use that component’s arg type.
            typeWithoutNullability = `${this.name.replace(/^[a-z]/, string => string.toUpperCase())}Args`
          } else if (this.macroOptions.params) {
            typeWithoutNullability = this.typeIntroduced!.name
          } else {
            // e.g. the `attributes` types which hold arbitary key-value
            // pairs to insert as attributes on an HTML element
            typeWithoutNullability = 'Record<string, unknown>'
          }
          break
        case 'string':
        case 'html':
          typeWithoutNullability = 'string'
          break
        case 'integer':
          typeWithoutNullability = 'number'
          comment = 'integer'
          break
        case 'boolean':
          typeWithoutNullability = 'boolean'
          break
        case 'nunjucks-block':
          // Not sure what this one is; we’ll address it if we ever need it
          typeWithoutNullability = 'unknown'
          comment = 'nunjucks-block'
          break
        case 'array':
          if (this.macroOptions.params) {
            if (this.isTableRows) {
              // See isTableRows
              typeWithoutNullability = 'TableArgsRow[]'
            } else {
              typeWithoutNullability = `${this.typeIntroduced!.name}[]`
            }
          } else {
            throw new Error('Array property has no params; don’t know how to handle that')
          }
          break
        default:
          throw new Error(`Unknown object type ${this.macroOptions.type}`)
      }
    }

    return `${this.isRequired ? typeWithoutNullability : `${typeWithoutNullability} | null`}${
      comment.length > 0 ? `// ${comment}` : ''
    }`
  }

  private get capitalisedName(): string {
    return capitalise(this.name)
  }

  // This return type dance is to avoid returning a Type directly so that
  // ESLint doesn't complain about a dependency cycle.
  get typeIntroduced(): { name: string; macroOptions: Record<string, unknown>[] } | null {
    switch (this.macroOptions.type) {
      case 'object':
        if (this.macroOptions.isComponent || !this.macroOptions.params) {
          return null
        }
        return {
          name: this.containingTypeName + this.capitalisedName,
          macroOptions: this.macroOptions.params as Record<string, unknown>[],
        }
      case 'array': {
        let typeName = ''
        if (this.isTableRows) {
          // See isTableRows
          typeName = 'TableArgsCell'
        } else if (this.name.endsWith('s')) {
          // Singularise if we can by stripping the final "s"
          typeName = this.containingTypeName + this.capitalisedName.substring(0, this.capitalisedName.length - 1)
        } else {
          typeName = `${this.containingTypeName + this.capitalisedName}Element`
        }
        return { name: typeName, macroOptions: this.macroOptions.params as Record<string, unknown>[] }
      }
      default:
        return null
    }
  }
}
