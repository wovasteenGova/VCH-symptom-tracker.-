import { getSupabaseConfigError, patchSupabaseRuntimeConfig } from '../utils/supabaseEnv'

export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event)
  patchSupabaseRuntimeConfig(config.public as Parameters<typeof patchSupabaseRuntimeConfig>[0])

  const configError = getSupabaseConfigError()

  if (!configError) {
    return
  }

  const path = event.path || ''
  const acceptsHtml = String(getRequestHeader(event, 'accept') || '').includes('text/html')

  if (path.startsWith('/api/') || path.startsWith('/_nuxt/')) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Service Unavailable',
      message: configError
    })
  }

  if (!acceptsHtml) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Service Unavailable',
      message: configError
    })
  }

  setResponseHeader(event, 'content-type', 'text/html; charset=utf-8')
  setResponseStatus(event, 503)

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Symptom Tracker — configuration required</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #0f172a; color: #e2e8f0; margin: 0; padding: 2rem; }
    main { max-width: 32rem; margin: 4rem auto; background: #1e293b; border: 1px solid #334155; border-radius: 1.25rem; padding: 1.5rem; }
    h1 { font-size: 1.25rem; margin: 0 0 0.75rem; }
    p { line-height: 1.6; color: #cbd5e1; margin: 0 0 0.75rem; }
    code { background: #0f172a; padding: 0.15rem 0.35rem; border-radius: 0.35rem; }
  </style>
</head>
<body>
  <main>
    <h1>Server configuration required</h1>
    <p>${configError}</p>
    <p>Required variables: <code>SUPABASE_URL</code> and <code>SUPABASE_ANON_KEY</code> (anon/publishable key only).</p>
  </main>
</body>
</html>`
})
