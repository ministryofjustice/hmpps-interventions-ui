import fs from 'fs'

export default class FileUtils {
  static async fileSize(filepath: string): Promise<{ bytes: number }> {
    const fileStats = await fs.promises.stat(filepath)
    return { bytes: fileStats.size }
  }
}
