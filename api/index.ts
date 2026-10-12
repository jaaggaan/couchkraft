import type { IncomingMessage, ServerResponse } from 'node:http'
import { handleCouchkraftApi } from '../server/auth-middleware.ts'

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const handled = await handleCouchkraftApi(req, res)
  if (!handled) {
    res.statusCode = 404
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: 'Not found.' }))
  }
}
