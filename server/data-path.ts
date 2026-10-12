import { tmpdir } from 'node:os'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

export function dataDirectory() {
  if (process.env.VERCEL) return resolve(tmpdir(), 'couchkraft-data')
  return resolve(root, 'data')
}
