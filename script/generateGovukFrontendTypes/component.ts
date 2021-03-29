import Type from './type'
import { kebabCaseToUpperCamelCase } from './utils'

export default class Component {
  constructor(
    private readonly directoryName: string,
    private readonly macroOptions: Record<string, unknown>[],
    private readonly isGovUk: boolean
  ) {}

  private get types(): Type[] {
    return new Type(`${this.upperCamelCaseComponentName}Args`, this.macroOptions).flattenedWithIntroducedTypes
  }

  private get upperCamelCaseComponentName(): string {
    return kebabCaseToUpperCamelCase(this.directoryName)
  }

  get definitions(): string {
    const componentLocation = this.isGovUk
      ? `is described at https://design-system.service.gov.uk/components/${this.directoryName}`
      : `is custom to this application`

    return `// The ${this.directoryName.replace('-', ' ')} component ${componentLocation}.
${this.types.map(type => type.definition).join('\n')}`
  }
}
