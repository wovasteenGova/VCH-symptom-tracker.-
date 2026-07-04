import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const WebSocket = require('ws') as typeof globalThis.WebSocket

export function getSupabaseNodeOptions() {
  return {
    realtime: {
      transport: WebSocket
    }
  }
}
