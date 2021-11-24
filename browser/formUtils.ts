// eslint-disable-next-line @typescript-eslint/no-unused-vars
class FormUtils {
  static replaceTextAreaFromAttribute(textAreaId: string, attributeId: string) {
    const textArea = document.getElementById(textAreaId) as HTMLTextAreaElement
    if (textArea !== null) {
      const attributeText = textArea.getAttribute(attributeId)
      if (attributeText !== null) {
        textArea.value = attributeText
      }
    }
  }
}
