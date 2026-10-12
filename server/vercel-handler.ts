import type { IncomingMessage, ServerResponse } from 'node:http'
import { handleCouchkraftApi } from './auth-middleware.ts'

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    const handled = await handleCouchkraftApi(req, res)
    if (!handled) {
      res.statusCode = 404
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: 'Not found.' }))
    }
  } catch (error) {
    res.statusCode = 500
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: error instanceof Error ? error.message : 'Server error.' }))
  }
}
