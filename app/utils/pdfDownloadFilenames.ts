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

/** Date + time so repeat downloads on the same day get unique filenames. */
function formatExportTimestamp(date = new Date()) {
  const timePart = [
    String(date.getHours()).padStart(2, '0'),
    String(date.getMinutes()).padStart(2, '0'),
    String(date.getSeconds()).padStart(2, '0')
  ].join('')

  return `${formatExportDate(date)}_${timePart}`
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

export function buildSymptomReportPdfFilename(
  options: SymptomReportFilenameOptions = {},
  exportedAt = new Date()
) {
  const scope = slugifyConditionScope(options.conditionLabel)
  const datePart = formatExportTimestamp(exportedAt)

  if (options.reportVariant === 'family') {
    return `VCH_family_report_${scope}_${datePart}.pdf`
  }

  const reportKind = options.reportMode === 'entries-only' ? 'entries_report' : 'full_report'

  if (options.reportVariant === 'veteran') {
    return `VCH_veteran_${reportKind}_${scope}_${datePart}.pdf`
  }

  return `VCH_${reportKind}_${scope}_${datePart}.pdf`
}

export function buildPersonalReviewPdfFilename(
  conditionLabel: string | null | undefined,
  exportedAt = new Date()
) {
  const scope = slugifyConditionScope(conditionLabel)
  const datePart = formatExportTimestamp(exportedAt)

  return `VCH_personal_review_${scope}_${datePart}.pdf`
}
