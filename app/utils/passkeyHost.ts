export const PASSKEY_PRODUCTION_HOST_MESSAGE =
  'Passkeys only work on the production site (veteranscentralhub.us), not on this address.'

export function isPasskeyProductionHost() {
  if (!import.meta.client) return true
  const host = window.location.hostname
  return host === 'veteranscentralhub.us' || host.endsWith('.veteranscentralhub.us')
}
