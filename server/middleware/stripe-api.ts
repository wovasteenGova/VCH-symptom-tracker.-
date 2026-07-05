import { getRequestURL } from 'h3'

export default defineEventHandler((event) => {
  const pathname = getRequestURL(event).pathname

  if (!pathname.startsWith('/api/stripe/')) {
    return
  }

  if (pathname === '/api/stripe/webhook') {
    return
  }

  if (process.env.NODE_ENV === 'production' && pathname.endsWith('/config-check')) {
    throw createError({
      statusCode: 404,
      message: 'Not found.'
    })
  }

  const method = event.method?.toUpperCase() || 'GET'

  if (method === 'GET') {
    throw createError({
      statusCode: 404,
      message: 'Not found.'
    })
  }
})
