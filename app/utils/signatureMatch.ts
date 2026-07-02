export function normalizeSignatureValue(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function signatureMatchesReporter(
  signature: string,
  firstName: string,
  lastName: string
) {
  const normalizedSignature = normalizeSignatureValue(signature)
  const normalizedFirst = normalizeSignatureValue(firstName)
  const normalizedLast = normalizeSignatureValue(lastName)

  if (normalizedSignature.length < 2) {
    return false
  }

  if (!normalizedFirst || !normalizedLast) {
    return false
  }

  const normalizedFull = `${normalizedFirst} ${normalizedLast}`.trim()

  if (normalizedSignature === normalizedFull) {
    return true
  }

  if (normalizedSignature === `${normalizedLast} ${normalizedFirst}`) {
    return true
  }

  return normalizedSignature.includes(normalizedFirst) && normalizedSignature.includes(normalizedLast)
}
