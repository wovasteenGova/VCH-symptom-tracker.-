import type { jsPDF } from 'jspdf'
import type { CpExamConditionSummary } from './cpExamReport'
import { reportBranding } from './reportBranding'

const slate900 = [15, 23, 42] as const
const slate700 = [51, 65, 85] as const
const slate500 = [100, 116, 139] as const
const slate200 = [226, 232, 240] as const
const sky100 = [224, 242, 254] as const
const sky700 = [3, 105, 161] as const

function setFill(doc: jsPDF, color: readonly [number, number, number]) {
  doc.setFillColor(color[0], color[1], color[2])
}

function setStroke(doc: jsPDF, color: readonly [number, number, number]) {
  doc.setDrawColor(color[0], color[1], color[2])
}

function setText(doc: jsPDF, color: readonly [number, number, number]) {
  doc.setTextColor(color[0], color[1], color[2])
}

function ensurePageSpace(
  doc: jsPDF,
  y: number,
  neededHeight: number,
  margin: number,
  pageHeight: number
) {
  if (y + neededHeight > pageHeight - margin - 28) {
    doc.addPage()
    return margin
  }

  return y
}

function drawWrappedText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  width: number,
  fontSize: number,
  lineHeight: number,
  color: readonly [number, number, number] = slate700
) {
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(fontSize)
  setText(doc, color)
  const lines = doc.splitTextToSize(text, width) as string[]

  lines.forEach((line) => {
    doc.text(line, x, y)
    y += lineHeight
  })

  return y
}

function measureWrappedLinesHeight(
  doc: jsPDF,
  lines: string[],
  lineHeight: number
) {
  return Math.max(lines.length, 1) * lineHeight
}

function wrapNoteLines(doc: jsPDF, note: string, width: number) {
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  return doc.splitTextToSize(`• ${note}`, width) as string[]
}

function drawPageFooter(doc: jsPDF, pageNumber: number, totalPages: number, margin: number) {
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  setStroke(doc, slate200)
  doc.setLineWidth(0.5)
  doc.line(margin, pageHeight - 28, pageWidth - margin, pageHeight - 28)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  setText(doc, slate500)
  doc.text(reportBranding.organizationName, margin, pageHeight - 16)
  doc.text('Personal reference — not for VA submission', pageWidth / 2, pageHeight - 16, { align: 'center' })
  doc.text(`Page ${pageNumber} of ${totalPages}`, pageWidth - margin, pageHeight - 16, { align: 'right' })
}

function drawConditionCard(
  doc: jsPDF,
  summary: CpExamConditionSummary,
  x: number,
  y: number,
  width: number,
  margin: number,
  pageHeight: number
) {
  const padX = 14
  const innerWidth = width - padX * 2
  const recentWeeksLine = summary.recentWeeklyCounts
    .map((week) => `${week.label}: ${week.count}`)
    .join('   ')

  const impactLines = summary.functionalImpacts.length
    ? summary.functionalImpacts.map((impact) => `• ${impact}`)
    : ['• No functional impact logged yet']

  const noteLineGroups = summary.reportedNotes.map((note) => wrapNoteLines(doc, note, innerWidth))
  const notesHeight = noteLineGroups.reduce((total, lines) => total + measureWrappedLinesHeight(doc, lines, 12), 0)

  const cardHeight = 34
    + 54
    + 34
    + 34
    + 16
    + impactLines.length * 13
    + (summary.reportedNotes.length ? 18 + notesHeight + 8 : 0)
    + 12

  y = ensurePageSpace(doc, y, cardHeight, margin, pageHeight)

  setStroke(doc, slate200)
  setFill(doc, [255, 255, 255])
  doc.roundedRect(x, y, width, cardHeight, 12, 12, 'FD')

  let textY = y + 18

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  setText(doc, slate900)
  doc.text(summary.conditionLabel, x + padX, textY)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  setText(doc, slate500)
  doc.text(`${summary.entryCount} logs · ${summary.trackingSpanLabel}`, x + width - padX, textY, { align: 'right' })

  textY += 22

  setFill(doc, sky100)
  doc.roundedRect(x + padX, textY, innerWidth, 44, 8, 8, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  setText(doc, sky700)
  doc.text('FREQUENCY YOU LOGGED', x + padX + 10, textY + 12)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  setText(doc, slate900)
  doc.text(summary.recentFrequencyLabel, x + padX + 10, textY + 28)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  setText(doc, slate500)
  doc.text(`Overall average: ${summary.overallFrequencyLabel}`, x + padX + 10, textY + 38)

  textY += 54

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  setText(doc, slate500)
  doc.text('SEVERITY YOU LOGGED', x + padX, textY)
  doc.text('LAST 4 WEEKS', x + padX + innerWidth / 2, textY)

  textY += 12

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  setText(doc, slate900)
  doc.text(summary.severityLabel, x + padX, textY + 2)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  setText(doc, slate700)
  doc.text(recentWeeksLine, x + padX + innerWidth / 2, textY + 2)

  textY += 24

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  setText(doc, slate500)
  doc.text('FUNCTIONAL IMPACT YOU LOGGED', x + padX, textY)

  textY += 12

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  setText(doc, slate700)
  impactLines.forEach((line) => {
    doc.text(line, x + padX, textY)
    textY += 13
  })

  if (summary.reportedNotes.length) {
    textY += 8

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7)
    setText(doc, slate500)
    doc.text('NOTES FROM YOUR LOGS', x + padX, textY)

    textY += 12

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    setText(doc, slate700)
    noteLineGroups.forEach((lines) => {
      lines.forEach((line) => {
        doc.text(line, x + padX, textY)
        textY += 12
      })
    })
  }

  return y + cardHeight + 14
}

export function drawCpExamReportPdf(options: {
  doc: jsPDF
  summaries: CpExamConditionSummary[]
  veteranName?: string | null
  reportTitle: string
  conditionLabel?: string | null
}) {
  const { doc, summaries, veteranName, reportTitle } = options
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 36
  const contentWidth = pageWidth - margin * 2
  let y = margin

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  setText(doc, slate900)
  doc.text(reportTitle, margin, y)

  y += 22

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  setText(doc, slate500)
  doc.text(
    `Generated ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
    margin,
    y
  )

  if (veteranName) {
    doc.text(`Prepared for ${veteranName}`, pageWidth - margin, y, { align: 'right' })
  }

  y += 18

  y = drawWrappedText(
    doc,
    'Summary pulled directly from your symptom tracker — frequency, severity, functional impact, and notes exactly as you logged them. For personal review only. Not intended to be uploaded as VA evidence; use the full signed report for submissions.',
    margin,
    y,
    contentWidth,
    9,
    12,
    slate700
  ) + 10

  for (const summary of summaries) {
    y = drawConditionCard(doc, summary, margin, y, contentWidth, margin, pageHeight)
  }

  const totalPages = doc.getNumberOfPages()
  for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
    doc.setPage(pageNumber)
    drawPageFooter(doc, pageNumber, totalPages, margin)
  }
}

export function buildCpExamPdfFilename(conditionLabel: string | null | undefined) {
  const now = new Date()
  const datePart = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0')
  ].join('-')
  const fileSlug = conditionLabel
    ? conditionLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    : 'all-conditions'

  return `vch-cp-exam-prep-${fileSlug}-${datePart}.pdf`
}
