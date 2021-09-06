import Pagination from './pagination'
import pageFactory from '../../../testutils/factories/page'

describe(Pagination, () => {
  describe('when constructing pagination arguments', () => {
    describe('the arguments for next and previous', () => {
      describe('when there is more than one page', () => {
        describe('when it is the first page', () => {
          it('should only show next', () => {
            const page = pageFactory.pageContent([]).build({
              totalElements: 20,
              totalPages: 2,
              numberOfElements: 10,
              number: 0, // page=1
              size: 10,
            })
            const { previous } = new Pagination(page).mojPaginationArgs
            const { next } = new Pagination(page).mojPaginationArgs
            expect(previous).toBeUndefined()
            expect(next).toEqual({ text: 'Next', href: '?page=2' })
          })
        })
        describe('when it is the last page', () => {
          it('should only show previous', () => {
            const page = pageFactory.pageContent([]).build({
              totalElements: 20,
              totalPages: 2,
              numberOfElements: 10,
              number: 1, // page=2
              size: 10,
            })
            const { previous } = new Pagination(page).mojPaginationArgs
            const { next } = new Pagination(page).mojPaginationArgs
            expect(previous).toEqual({ text: 'Previous', href: '?page=1' })
            expect(next).toBeUndefined()
          })
        })
        describe('when it is one of the middle pages', () => {
          it('should show both next and previous', () => {
            const page = pageFactory.pageContent([]).build({
              totalElements: 20,
              totalPages: 3,
              numberOfElements: 10,
              number: 1, // page=2
              size: 10,
            })
            const { previous } = new Pagination(page).mojPaginationArgs
            const { next } = new Pagination(page).mojPaginationArgs
            expect(previous).toEqual({ text: 'Previous', href: '?page=1' })
            expect(next).toEqual({ text: 'Next', href: '?page=3' })
          })
        })
      })
    })
    describe('the arguments for pagination items', () => {
      describe('when there is only one page', () => {
        it('should be empty', () => {
          const page = pageFactory.pageContent([]).build({
            totalElements: 10,
            totalPages: 1,
            numberOfElements: 10,
            number: 0, // page=1
            size: 10,
          })
          const { items } = new Pagination(page).mojPaginationArgs
          expect(items).toEqual([])
        })
      })
      describe('for pagination with less than 6 pages', () => {
        it('should contain all pages', () => {
          const page = pageFactory.pageContent([]).build({
            totalElements: 50,
            totalPages: 5,
            numberOfElements: 10,
            number: 4, // page=5
            size: 10,
          })
          const { items } = new Pagination(page).mojPaginationArgs
          expect(items).toEqual([
            { type: 'pageNumber', selected: false, text: 1, href: '?page=1' },
            { type: 'pageNumber', selected: false, text: 2, href: '?page=2' },
            { type: 'pageNumber', selected: false, text: 3, href: '?page=3' },
            { type: 'pageNumber', selected: false, text: 4, href: '?page=4' },
            { type: 'pageNumber', selected: true, text: 5, href: '?page=5' },
          ])
        })
      })
      describe('for pagination greater than 5 pages', () => {
        describe('and the chosen page is within the first 3 pages', () => {
          it('should contain first 4 pages and last page', () => {
            const page = pageFactory.pageContent([]).build({
              totalElements: 50,
              totalPages: 6,
              numberOfElements: 10,
              number: 2, // page=3
              size: 10,
            })
            const { items } = new Pagination(page).mojPaginationArgs
            expect(items).toEqual([
              { type: 'pageNumber', selected: false, text: 1, href: '?page=1' },
              { type: 'pageNumber', selected: false, text: 2, href: '?page=2' },
              { type: 'pageNumber', selected: true, text: 3, href: '?page=3' },
              { type: 'pageNumber', selected: false, text: 4, href: '?page=4' },
              { type: 'dots' },
              { type: 'pageNumber', selected: false, text: 6, href: '?page=6' },
            ])
          })
        })
        describe('and the chosen page is within the last 3 pages', () => {
          it('should contain last 4 pages and first page', () => {
            const page = pageFactory.pageContent([]).build({
              totalElements: 50,
              totalPages: 6,
              numberOfElements: 10,
              number: 3, // page=4
              size: 10,
            })
            const { items } = new Pagination(page).mojPaginationArgs
            expect(items).toEqual([
              { type: 'pageNumber', selected: false, text: 1, href: '?page=1' },
              { type: 'dots' },
              { type: 'pageNumber', selected: false, text: 3, href: '?page=3' },
              { type: 'pageNumber', selected: true, text: 4, href: '?page=4' },
              { type: 'pageNumber', selected: false, text: 5, href: '?page=5' },
              { type: 'pageNumber', selected: false, text: 6, href: '?page=6' },
            ])
          })
        })
        describe('and the chosen page is somewhere within the middle', () => {
          it('should show first and last page, current page and next and previous page', () => {
            const page = pageFactory.pageContent([]).build({
              totalElements: 50,
              totalPages: 7,
              numberOfElements: 10,
              number: 3, // page=4
              size: 10,
            })
            const { items } = new Pagination(page).mojPaginationArgs
            expect(items).toEqual([
              { type: 'pageNumber', selected: false, text: 1, href: '?page=1' },
              { type: 'dots' },
              { type: 'pageNumber', selected: false, text: 3, href: '?page=3' },
              { type: 'pageNumber', selected: true, text: 4, href: '?page=4' },
              { type: 'pageNumber', selected: false, text: 5, href: '?page=5' },
              { type: 'dots' },
              { type: 'pageNumber', selected: false, text: 7, href: '?page=7' },
            ])
          })
        })
      })
    })
    describe('the arguments for page summary results', () => {
      it('should show the correct range or values', () => {
        const page = pageFactory.pageContent([]).build({
          totalElements: 50,
          totalPages: 5,
          numberOfElements: 10,
          number: 2, // page=3
          size: 10,
        })
        const { results } = new Pagination(page).mojPaginationArgs
        expect(results).toEqual({
          from: 21,
          to: 30,
          count: 50,
        })
      })
    })
  })
})
