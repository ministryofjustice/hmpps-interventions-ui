import { Factory } from 'fishery'
import { Page } from '../../server/models/pagination'

class PageFactory<T> extends Factory<Page<T>> {
  pageContent(content: T[]) {
    return this.params({
      content,
      totalElements: 100,
      totalPages: 10,
      numberOfElements: content.length,
      number: 0,
      size: 10,
    })
  }
}

export default PageFactory.define(() => {
  return {
    content: [],
    totalElements: 100,
    totalPages: 10,
    numberOfElements: 10,
    number: 0,
    size: 10,
  }
})
