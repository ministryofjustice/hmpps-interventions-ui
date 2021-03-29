import NestedObjectProperty from './nestedObjectProperty'
import Property from './property'

export default class Type {
  constructor(private readonly name: string, private readonly macroOptions: Record<string, unknown>[]) {}

  private get properties(): Property[] {
    return this.macroOptions.map(val => new Property(this.name, val)).filter(prop => prop.isIncluded)
  }

  get definition(): string {
    const handledNestedObjectPropertyNames: string[] = []
    const definitionLines: string[] = []

    this.properties.forEach(property => {
      let include = true

      if (property.describesPropertyOfNestedObject) {
        if (handledNestedObjectPropertyNames.includes(property.nestedObjectProperty!.objectName)) {
          include = false
        } else {
          handledNestedObjectPropertyNames.push(property.nestedObjectProperty!.objectName)
        }
      }

      if (include) {
        definitionLines.push(property.definitionLine)
      }
    })

    return `${this.preamble}export interface ${this.name} {
  ${definitionLines.join('\n')}
}\n`
  }

  private get preamble(): string {
    // See Property.prototype.isTableRows
    if (this.name === 'TableArgsCell') {
      return 'type TableArgsRow = TableArgsCell[]\n\n'
    }
    return ''
  }

  get flattenedWithIntroducedTypes(): Type[] {
    let types: Type[] = []
    let handledNestedTypeNames: string[] = []

    this.properties.forEach(property => {
      let type: Type | null = null

      if (property.describesPropertyOfNestedObject) {
        // Hoist up all of the dotted properties that describe this nested
        // object and combine them into a single object property and type.
        const nestedObjectType = this.typeForNestedObjectProperty(property.nestedObjectProperty!)
        if (!handledNestedTypeNames.includes(nestedObjectType.name)) {
          type = nestedObjectType
          // Since we’ve now handled all of the properties for this nested object — outside of
          // the natural order of enumerating these properties — we don't want to repeat this
          // the next time we encounter one of those properties.
          handledNestedTypeNames = [...handledNestedTypeNames, type.name]
        }
      } else if (property.typeIntroduced) {
        type = new Type(property.typeIntroduced!.name, property.typeIntroduced!.macroOptions)
      }

      if (type !== null) {
        types = [...types, ...type.flattenedWithIntroducedTypes]
      }
    })

    return [this, ...types]
  }

  private typeForNestedObjectProperty(nestedObjectProperty: NestedObjectProperty): Type {
    const macroOptions = this.properties
      .filter(property => property.nestedObjectProperty?.objectName === nestedObjectProperty.objectName)
      .map(property => {
        return { ...property.macroOptions, name: property.nestedObjectProperty!.propertyName }
      })

    return new Type(nestedObjectProperty.objectTypeName, macroOptions)
  }
}
