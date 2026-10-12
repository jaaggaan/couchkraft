import { tmpdir } from 'node:os'
import { resolve } from 'node:path'

export function dataDirectory() {
  if (process.env.VERCEL) return resolve(tmpdir(), 'couchkraft-data')
  return resolve(process.cwd(), 'data')
}
