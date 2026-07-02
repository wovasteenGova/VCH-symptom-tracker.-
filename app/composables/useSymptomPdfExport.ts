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
import { getLogoFormat, loadReportLogoDataUrl, reportBranding } from '../utils/reportBranding'

type SymptomEntryRecord = {
  id: string
  condition_label: string
  source?: string | null
  severity?: number | null
  occurred_at?: string | null
  created_at?: string | null
  summary?: string | null
  impact?: string | null
  details?: Record<string, unknown> | null
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

export function useSymptomPdfExport() {
  async function downloadEntriesPdf(entries: SymptomEntryRecord[]) {
    if (!entries.length) {
      throw new Error('Add at least one symptom entry before exporting.')
    }

    const metrics = buildReportMetrics(entries)
    const totalPages = metrics.extendedConditionBreakdown.length ? 3 : 2
    const logoDataUrl = await loadReportLogoDataUrl()

    const doc = new jsPDF({
      unit: 'pt',
      format: 'letter'
    })
    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 42
    const contentWidth = pageWidth - margin * 2
    let y = margin

    if (logoDataUrl) {
      try {
        doc.addImage(
          logoDataUrl,
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

    const headerX = logoDataUrl ? margin + 68 : margin

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(16)
    doc.setTextColor(15, 23, 42)
    doc.text(reportBranding.organizationName, headerX, y + 18)

    doc.setFontSize(12)
    doc.text(reportBranding.reportTitle, headerX, y + 36)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(100, 116, 139)
    doc.text(reportBranding.reportSubtitle, headerX, y + 52)
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

    drawPageFooter(doc, 1, totalPages, margin)

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

    drawPageFooter(doc, 2, totalPages, margin)

    if (metrics.extendedConditionBreakdown.length) {
      doc.addPage()
      y = margin

      drawSectionTitle(doc, 'Additional conditions tracked', margin, y)
      y += 10
      drawHorizontalBarChart(
        doc,
        margin,
        y,
        contentWidth,
        Math.max(160, metrics.extendedConditionBreakdown.length * 28 + 36),
        metrics.extendedConditionBreakdown,
        chartColors
      )

      drawPageFooter(doc, 3, totalPages, margin)
    }

    const fileDate = new Date().toISOString().slice(0, 10)
    doc.save(`vch-symptom-report-${fileDate}.pdf`)
  }

  return {
    downloadEntriesPdf
  }
}
