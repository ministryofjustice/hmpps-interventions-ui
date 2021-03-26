function indentString(str: string, count: number, indent = ' '): string {
  return str.replace(/^/gm, indent.repeat(count))
}

function capitalise(str: string): string {
  return str.replace(/^./, string => string.toUpperCase())
}

function kebabCaseToUpperCamelCase(str: string): string {
  return str.replace(/(^[a-z])|(-[a-z])/g, substring => substring.toUpperCase().replace(/-/, ''))
}

export { indentString, capitalise, kebabCaseToUpperCamelCase }
