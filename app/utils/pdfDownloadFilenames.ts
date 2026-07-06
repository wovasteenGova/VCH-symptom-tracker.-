export type SymptomReportFilenameOptions = {
  conditionLabel?: string | null
  reportVariant?: 'veteran' | 'family'
  reportMode?: 'full' | 'entries-only'
}

function formatExportDate(date = new Date()) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0')
  ].join('-')
}

export function slugifyConditionScope(conditionLabel: string | null | undefined) {
  if (!conditionLabel) {
    return 'all_conditions'
  }

  const normalized = conditionLabel.trim()
  const multiConditionMatch = normalized.match(/^(\d+)\s+conditions$/i)
  if (multiConditionMatch) {
    return `${multiConditionMatch[1]}_conditions`
  }

  return normalized
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

export function buildSymptomReportPdfFilename(options: SymptomReportFilenameOptions = {}) {
  const scope = slugifyConditionScope(options.conditionLabel)
  const datePart = formatExportDate()

  if (options.reportVariant === 'family') {
    return `VCH_family_report_${scope}_${datePart}.pdf`
  }

  const reportKind = options.reportMode === 'entries-only' ? 'entries_report' : 'full_report'

  if (options.reportVariant === 'veteran') {
    return `VCH_veteran_${reportKind}_${scope}_${datePart}.pdf`
  }

  return `VCH_${reportKind}_${scope}_${datePart}.pdf`
}

export function buildPersonalReviewPdfFilename(conditionLabel: string | null | undefined) {
  const scope = slugifyConditionScope(conditionLabel)
  const datePart = formatExportDate()

  return `VCH_personal_review_${scope}_${datePart}.pdf`
}
