import { capitalise } from './utils'

/*
The macro-options.json files sometimes use a convention where instead of using a
`"type": "object"` to describe an object nested within another object, they
instead use a dotted property name to describe the properties of a nested object.

For example, the summary-list component’s `rows` property is an array. The `params`
for this array have params called `key.text`, `key.html`, and `key.classes`. These
are however actually trying to describe the `text`, `html`, and `classes` properties
of a `key` property on the row. We need to combine all these dotted properties into
a single TypeScript property and type.

I'm not sure why this dotted notation is used. It seems to be used inconsistently.
There are other components where deeply nested objects are described without the
dotted notation, for example the footer component’s `navigation` property.
*/
export default class NestedObjectProperty {
  constructor(private readonly containingTypeName: string, private readonly combinedPropertyName: string) {
    if (!NestedObjectProperty.describesPropertyOfNestedObject(combinedPropertyName)) {
      throw new Error(`Property name ${combinedPropertyName} doesn’t describe property of nested object`)
    }
  }

  static describesPropertyOfNestedObject(propertyName: string): boolean {
    return propertyName.indexOf('.') >= 0
  }

  // The name of the object which this property is nested within. For
  // example, for "key.text", this is "key".
  get objectName(): string {
    return this.combinedPropertyName.split('.')[0]
  }

  // The name of the property in the object. For example, for "key.text", this is "text".
  get propertyName(): string {
    return this.combinedPropertyName.split('.')[1]
  }

  // The name of the type to be used for the object. For example, for the property
  // "key.text" inside the type SummaryListArgsRow, this is "SummaryListArgsRowKey".
  get objectTypeName(): string {
    return `${this.containingTypeName}${capitalise(this.objectName)}`
  }
}
