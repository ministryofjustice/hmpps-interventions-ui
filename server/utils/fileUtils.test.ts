import FileUtils from './fileUtils'

describe(FileUtils, () => {
  describe('.fileInformation', () => {
    it('returns the file size in bytes', async () => {
      expect(await FileUtils.fileSize('testutils/test_logo.png')).toEqual({ bytes: 11126 })
    })
  })
})
