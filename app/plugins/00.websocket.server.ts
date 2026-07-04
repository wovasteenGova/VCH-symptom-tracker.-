import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const WebSocket = require('ws') as typeof globalThis.WebSocket

export default defineNuxtPlugin({
  name: 'node-websocket-polyfill',
  enforce: 'pre',
  setup() {
    if (!globalThis.WebSocket) {
      globalThis.WebSocket = WebSocket as unknown as typeof globalThis.WebSocket
    }
  }
})
