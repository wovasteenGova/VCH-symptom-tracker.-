/** Return JSON 404 for unknown API routes so they do not fall through to Vue Router. */
export default defineEventHandler((event) => {
  throw createError({
    statusCode: 404,
    statusMessage: 'Not Found',
    message: `Unknown API route: ${event.path}`
  })
})
