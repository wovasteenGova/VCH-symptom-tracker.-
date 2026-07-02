export const reportBranding = {
  organizationName: 'Veterans Central Hub',
  reportTitle: 'Symptom Tracker Report',
  reportSubtitle: 'Veteran symptom analytics export',
  logoPath: '/vch-logo.png'
}

let cachedLogoDataUrl: string | null | undefined

export async function loadReportLogoDataUrl() {
  if (!import.meta.client) {
    return null
  }

  if (cachedLogoDataUrl !== undefined) {
    return cachedLogoDataUrl
  }

  try {
    const response = await fetch(reportBranding.logoPath)
    if (!response.ok) {
      cachedLogoDataUrl = null
      return null
    }

    const blob = await response.blob()
    if (!blob.type.startsWith('image/') || blob.type.includes('svg')) {
      cachedLogoDataUrl = null
      return null
    }

    cachedLogoDataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(reader.error)
      reader.readAsDataURL(blob)
    })

    return cachedLogoDataUrl
  } catch {
    cachedLogoDataUrl = null
    return null
  }
}

export function getLogoFormat(dataUrl: string | null) {
  if (!dataUrl) {
    return 'PNG'
  }

  if (dataUrl.startsWith('data:image/jpeg') || dataUrl.startsWith('data:image/jpg')) {
    return 'JPEG'
  }

  return 'PNG'
}
