import AuditContext from './auditContext'

describe('AuditContext', () => {
  it('records CRNs found anywhere in a response body within the current context', async () => {
    const context = new AuditContext()

    await AuditContext.run(context, async () => {
      await Promise.resolve()
      AuditContext.recordSubjectsFrom({ id: 'referral-1', referral: { serviceUser: { crn: 'X123456' } } })
      AuditContext.recordSubjectsFrom([{ crn: 'X123456' }, { crn: 'X654321' }])
    })

    expect([...context.crns]).toEqual(['X123456', 'X654321'])
  })

  it('records referral reference numbers found in a response body', () => {
    const context = new AuditContext()

    AuditContext.run(context, () => {
      AuditContext.recordSubjectsFrom({ content: [{ referenceNumber: 'AB1234CD' }, { referenceNumber: 'EF5678GH' }] })
    })

    expect([...context.referenceNumbers]).toEqual(['AB1234CD', 'EF5678GH'])
    expect(context.crns.size).toBe(0)
  })

  it('ignores responses without CRNs', () => {
    const context = new AuditContext()

    AuditContext.run(context, () => {
      AuditContext.recordSubjectsFrom(null)
      AuditContext.recordSubjectsFrom('X123456')
      AuditContext.recordSubjectsFrom({ crn: '' })
      AuditContext.recordSubjectsFrom(Buffer.from('{"crn":"X123456"}'))
    })

    expect(context.crns.size).toBe(0)
  })

  it('does nothing outside of a context', () => {
    expect(() => AuditContext.recordSubjectsFrom({ crn: 'X123456' })).not.toThrow()
    expect(AuditContext.current()).toBeUndefined()
  })
})
