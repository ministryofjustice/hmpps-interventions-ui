export default (name, pageObject = {}) => {
  const checkOnPage = () => cy.get('h1').contains(name)
  const logout = () => cy.get('[data-qa=sign-out]')
  checkOnPage()
  return { ...pageObject, checkStillOnPage: checkOnPage, logout }
}
