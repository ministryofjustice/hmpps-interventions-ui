import Type from './type'
import { kebabCaseToUpperCamelCase } from './utils'

export default class Component {
  constructor(private readonly directoryName: string, private readonly macroOptions: Record<string, unknown>[]) {}

  private get types(): Type[] {
    return new Type(`${this.upperCamelCaseComponentName}Args`, this.macroOptions).flattenedWithIntroducedTypes
  }

  private get upperCamelCaseComponentName(): string {
    return kebabCaseToUpperCamelCase(this.directoryName)
  }

  get definitions(): string {
    return `// The ${this.directoryName.replace(
      '-',
      ' '
    )} component is described at https://design-system.service.gov.uk/components/${this.directoryName}.
${this.types.map(type => type.definition).join('\n')}`
  }
}
