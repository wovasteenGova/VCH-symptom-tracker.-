import { jsPDF } from 'jspdf'
import {
  buildReportMetrics,
  drawHeatmapCalendar,
  drawHorizontalBarChart,
  drawLineChart,
  drawSectionTitle,
  drawStatCards,
  drawVerticalBarChart
} from '../utils/symptomReportCharts'
import { drawEntryLogSection } from '../utils/symptomReportEntryLog'
import { buildBackfillReportNote } from '../utils/reportBackfillNote'
import { getLogoFormat, loadReportLogoDataUrl, reportBranding } from '../utils/reportBranding'

type SymptomEntryRecord = {
  id: string
  condition_label: string
  source?: string | null
  severity?: number | null
  occurred_at?: string | null
  created_at?: string | null
  updated_at?: string | null
  summary?: string | null
  impact?: string | null
  details?: Record<string, unknown> | null
}

type VeteranSignatureInfo = {
  veteranName?: string | null
  veteranEmail?: string | null
}

type PdfExportOptions = VeteranSignatureInfo & {
  includeCharts?: boolean
  conditionLabel?: string | null
}

function resolveTypedSignatureName(signatureInfo: VeteranSignatureInfo) {
  return signatureInfo.veteranName?.trim() || null
}

const chartColors = [
  [14, 165, 233],
  [139, 92, 246],
  [16, 185, 129],
  [245, 158, 11],
  [249, 115, 22],
  [236, 72, 153]
] as const

function drawPageFooter(doc: jsPDF, pageNumber: number, totalPages: number, margin: number) {
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(100, 116, 139)
  doc.text(reportBranding.organizationName, margin, pageHeight - 24)
  doc.text(`Page ${pageNumber} of ${totalPages}`, pageWidth - margin, pageHeight - 24, { align: 'right' })
}

function drawReportNoticeSection(
  doc: jsPDF,
  y: number,
  margin: number,
  contentWidth: number,
  noticeText: string
) {
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(180, 83, 9)
  doc.text('Report note for raters', margin, y)
  y += 14

  doc.setDrawColor(251, 191, 36)
  doc.setFillColor(255, 251, 235)
  const wrapped = doc.splitTextToSize(noticeText, contentWidth - 28) as string[]
  const boxHeight = wrapped.length * 12 + 24
  doc.roundedRect(margin, y, contentWidth, boxHeight, 10, 10, 'FD')

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(120, 53, 15)
  doc.text(wrapped, margin + 14, y + 18)

  return y + boxHeight + 16
}

function drawVeteranElectronicSignatureSection(
  doc: jsPDF,
  y: number,
  margin: number,
  contentWidth: number,
  pageHeight: number,
  signatureInfo: VeteranSignatureInfo = {}
) {
  const signedName = resolveTypedSignatureName(signatureInfo)
  if (!signedName) {
    throw new Error('Add your full name in Account Settings before exporting a signed PDF.')
  }

  const contactEmail = signatureInfo.veteranEmail?.trim() || null
  const signatureBlockHeight = contactEmail ? 176 : 158
  if (y + signatureBlockHeight > pageHeight - 56) {
    doc.addPage()
    y = margin
  }

  const signedAt = new Date().toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })

  drawSectionTitle(doc, 'Veteran electronic signature', margin, y)
  y += 18

  doc.setDrawColor(226, 232, 240)
  doc.setFillColor(248, 250, 252)
  doc.roundedRect(margin, y, contentWidth, signatureBlockHeight - 22, 12, 12, 'FD')

  const innerX = margin + 18
  let textY = y + 24

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(51, 65, 85)
  const certificationText = doc.splitTextToSize(
    'I certify that the information in this symptom report was entered or reviewed by me and is true and correct to the best of my knowledge and belief. I understand this report may be used to support VA disability, health care, or benefits-related documentation.',
    contentWidth - 36
  ) as string[]
  doc.text(certificationText, innerX, textY)
  textY += certificationText.length * 13 + 16

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(15, 23, 42)
  doc.text(`Electronic signature: /s/ ${signedName}`, innerX, textY)
  textY += 16

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(100, 116, 139)
  doc.text(`Electronically signed on: ${signedAt}`, innerX, textY)
  textY += 14
  doc.text('Signature method: typed full legal name (not an image or email address).', innerX, textY)
  if (contactEmail) {
    textY += 14
    doc.text(`Account email on file: ${contactEmail}`, innerX, textY)
  }

  return y + signatureBlockHeight
}

export function useSymptomPdfExport() {
  async function downloadEntriesPdf(
    entries: SymptomEntryRecord[],
    options: PdfExportOptions = {}
  ) {
    const { includeCharts = true, veteranName = null, veteranEmail = null, conditionLabel = null } = options
    const signatureInfo = { veteranName, veteranEmail }

    if (!entries.length) {
      throw new Error('Add at least one symptom entry before exporting.')
    }

    if (!resolveTypedSignatureName(signatureInfo)) {
      throw new Error('Add your full name in Account Settings before exporting a signed PDF.')
    }

    const metrics = buildReportMetrics(entries)
    const logoDataUrl = await loadReportLogoDataUrl()

    const doc = new jsPDF({
      unit: 'pt',
      format: 'letter'
    })
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 42
    const contentWidth = pageWidth - margin * 2
    let y = margin

    const logoIsRenderable = Boolean(
      logoDataUrl
      && logoDataUrl.startsWith('data:image/')
      && !logoDataUrl.startsWith('data:image/svg')
    )

    if (logoIsRenderable) {
      try {
        doc.addImage(
          logoDataUrl!,
          getLogoFormat(logoDataUrl),
          margin,
          y,
          56,
          56
        )
      } catch {
        // Continue with text-only header if logo fails to render.
      }
    }

    const headerX = logoIsRenderable ? margin + 68 : margin

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(16)
    doc.setTextColor(15, 23, 42)
    doc.text(reportBranding.organizationName, headerX, y + 18)

    doc.setFontSize(12)
    doc.text(reportBranding.reportTitle, headerX, y + 36)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(100, 116, 139)
    doc.text(
      conditionLabel ? `${conditionLabel} symptom log` : reportBranding.reportSubtitle,
      headerX,
      y + 52
    )
    doc.text(
      new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      pageWidth - margin,
      y + 18,
      { align: 'right' }
    )

    y += 78

    y = drawStatCards(doc, margin, y, contentWidth, [
      { label: 'Total entries', value: String(metrics.totalEntries) },
      { label: 'Avg severity', value: metrics.averageSeverity.toFixed(1) },
      { label: 'Peak severity', value: String(metrics.peakSeverity) },
      { label: 'Conditions', value: String(metrics.conditionCount) }
    ]) + 18

    const backfillReportNote = buildBackfillReportNote(entries)

    if (backfillReportNote) {
      y = drawReportNoticeSection(doc, y, margin, contentWidth, backfillReportNote)
    }

    if (includeCharts) {
      drawSectionTitle(doc, 'Severity trend', margin, y)
      y += 10
      y = drawLineChart(doc, margin, y, contentWidth, 148, metrics.trend) + 16

      const columnGap = 14
      const columnWidth = (contentWidth - columnGap) / 2

      drawSectionTitle(doc, 'Entries by condition', margin, y)
      drawSectionTitle(doc, 'Severity bands', margin + columnWidth + columnGap, y)
      y += 10

      drawHorizontalBarChart(
        doc,
        margin,
        y,
        columnWidth,
        148,
        metrics.conditionBreakdown,
        chartColors
      )

      drawVerticalBarChart(
        doc,
        margin + columnWidth + columnGap,
        y,
        columnWidth,
        148,
        [
          { label: 'Mild', value: metrics.severityBands.mild },
          { label: 'Mod', value: metrics.severityBands.moderate },
          { label: 'Severe', value: metrics.severityBands.severe }
        ],
        [[16, 185, 129], [245, 158, 11], [249, 115, 22]]
      )

      doc.addPage()
      y = margin

      drawSectionTitle(doc, 'Monthly activity', margin, y)
      y += 10
      y = drawVerticalBarChart(doc, margin, y, contentWidth, 156, metrics.monthActivity, chartColors) + 16

      drawSectionTitle(doc, 'Daily log density', margin, y)
      y += 10
      y = drawHeatmapCalendar(doc, margin, y, contentWidth, 188, metrics.monthLabel, metrics.dailyCounts) + 16

      drawSectionTitle(doc, 'Report source mix', margin, y)
      y += 10
      drawHorizontalBarChart(
        doc,
        margin,
        y,
        contentWidth,
        Math.max(92, metrics.sourceBreakdown.length * 28 + 24),
        metrics.sourceBreakdown,
        [[14, 165, 233], [139, 92, 246]]
      )
      y += Math.max(92, metrics.sourceBreakdown.length * 28 + 24) + 20

      if (metrics.extendedConditionBreakdown.length) {
        doc.addPage()
        y = margin

        drawSectionTitle(doc, 'Additional conditions tracked', margin, y)
        y += 10
        y = drawHorizontalBarChart(
          doc,
          margin,
          y,
          contentWidth,
          Math.max(160, metrics.extendedConditionBreakdown.length * 28 + 36),
          metrics.extendedConditionBreakdown,
          chartColors
        ) + 20
      }
    }

    y = drawEntryLogSection(
      doc,
      entries,
      margin,
      y,
      contentWidth,
      margin,
      pageHeight
    )

    drawVeteranElectronicSignatureSection(
      doc,
      y,
      margin,
      contentWidth,
      pageHeight,
      signatureInfo
    )

    const totalPages = doc.getNumberOfPages()
    for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
      doc.setPage(pageNumber)
      drawPageFooter(doc, pageNumber, totalPages, margin)
    }

    const fileDate = new Date().toISOString().slice(0, 10)
    const fileSlug = conditionLabel
      ? conditionLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      : 'all-conditions'
    doc.save(`vch-symptom-report-${fileSlug}-${fileDate}.pdf`)
  }

  return {
    downloadEntriesPdf
  }
}
