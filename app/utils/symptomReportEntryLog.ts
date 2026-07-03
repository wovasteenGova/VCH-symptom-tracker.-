import type { jsPDF } from 'jspdf'
import { drawSectionTitle } from './symptomReportCharts'
import {
  formatReportEntryTimestamp,
  getEntryBackdateNote,
  type BackdateReportContext,
  type EntryBackdateNote
} from './reportBackfillNote'

export type ReportEntryRecord = {
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

const slate900 = [15, 23, 42] as const
const slate700 = [51, 65, 85] as const
const slate500 = [100, 116, 139] as const
const slate200 = [226, 232, 240] as const
const slate50 = [248, 250, 252] as const
const amber200 = [251, 191, 36] as const
const amber50 = [255, 251, 235] as const
const amber900 = [120, 53, 15] as const

const skippedDetailKeys = new Set([
  'date_and_time',
  'how_bad_was_it',
  'what_happened',
  'daily_impact',
  'condition_name'
])

const detailLabelMap: Record<string, string> = {
  duration: 'Duration',
  episode_duration: 'Episode duration',
  had_to_stop_activity: 'Functional impact',
  kept_you_from_sleeping: 'Sleep impact',
  episode_type: 'Episode type',
  safety_note: 'Safety note',
  movement_limit: 'Movement limit',
  flare_up_trigger: 'Flare-up trigger',
  side_affected: 'Side affected',
  nerve_symptoms: 'Nerve symptoms',
  digestive_symptom: 'Digestive symptom',
  medication_or_food_trigger: 'Medication or food trigger',
  hours_slept: 'Hours slept',
  sleep_interruption: 'Sleep interruption'
}

type EntryBlock = {
  label: string
  value: string
  lines: string[]
  kind: 'primary' | 'detail'
}

type LayoutContext = {
  doc: jsPDF
  x: number
  y: number
  width: number
  margin: number
  pageHeight: number
  bottomLimit: number
}

function setText(doc: jsPDF, color: readonly [number, number, number]) {
  doc.setTextColor(color[0], color[1], color[2])
}

function setFill(doc: jsPDF, color: readonly [number, number, number]) {
  doc.setFillColor(color[0], color[1], color[2])
}

function setStroke(doc: jsPDF, color: readonly [number, number, number]) {
  doc.setDrawColor(color[0], color[1], color[2])
}

function getEntryDate(entry: ReportEntryRecord) {
  return new Date(entry.occurred_at || entry.created_at || 0)
}

function formatReportEntryDate(value: string | null | undefined) {
  return formatReportEntryTimestamp(value)
}

function wasEntryEdited(entry: ReportEntryRecord) {
  if (!entry.updated_at || !entry.created_at) {
    return false
  }

  return new Date(entry.updated_at).getTime() - new Date(entry.created_at).getTime() > 60_000
}

function humanizeDetailKey(key: string) {
  if (detailLabelMap[key]) {
    return detailLabelMap[key]
  }

  return key
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function normalizeDetailValue(value: unknown) {
  if (value === null || value === undefined) {
    return ''
  }

  if (typeof value === 'string') {
    return value.trim()
  }

  if (typeof value === 'number') {
    return String(value)
  }

  return String(value)
}

function wrapLines(doc: jsPDF, text: string, maxWidth: number, fontSize: number) {
  doc.setFontSize(fontSize)
  return doc.splitTextToSize(text, maxWidth) as string[]
}

function buildEntryBlocks(doc: jsPDF, entry: ReportEntryRecord, innerWidth: number) {
  const blocks: EntryBlock[] = []

  const addBlock = (label: string, value: string, kind: 'primary' | 'detail') => {
    blocks.push({
      label,
      value,
      kind,
      lines: wrapLines(doc, value, kind === 'detail' ? (innerWidth - 16) / 2 : innerWidth, kind === 'primary' ? 11 : 10)
    })
  }

  if (entry.summary?.trim()) {
    addBlock('What happened', entry.summary.trim(), 'primary')
  }

  if (entry.impact?.trim()) {
    addBlock('Daily impact', entry.impact.trim(), 'primary')
  }

  const details = entry.details || {}
  Object.entries(details).forEach(([key, value]) => {
    if (skippedDetailKeys.has(key)) {
      return
    }

    const normalized = normalizeDetailValue(value)
    if (!normalized) {
      return
    }

    addBlock(humanizeDetailKey(key), normalized, 'detail')
  })

  return blocks
}

function measureBlockHeight(block: EntryBlock, lineHeight: number, labelHeight: number, gapAfter: number) {
  return labelHeight + block.lines.length * lineHeight + gapAfter
}

const backdateNoteHeight = 34

function drawBackdateNote(
  ctx: LayoutContext,
  note: EntryBackdateNote,
  innerX: number,
  innerWidth: number
) {
  const boxTop = ctx.y

  setStroke(ctx.doc, amber200)
  setFill(ctx.doc, amber50)
  ctx.doc.roundedRect(innerX, boxTop, innerWidth, backdateNoteHeight, 8, 8, 'FD')

  ctx.doc.setFont('helvetica', 'bold')
  ctx.doc.setFontSize(8.5)
  setText(ctx.doc, amber900)
  ctx.doc.text(note.title, innerX + innerWidth / 2, boxTop + 12, {
    align: 'center'
  })

  ctx.doc.setFont('helvetica', 'normal')
  ctx.doc.setFontSize(8)
  ctx.doc.text(note.enteredAtLabel, innerX + innerWidth / 2, boxTop + 24, {
    align: 'center'
  })

  ctx.y = boxTop + backdateNoteHeight + 8
}

function measureEntryHeight(
  blocks: EntryBlock[],
  options: {
    backdateNote?: EntryBackdateNote | null
    edited?: boolean
  } = {}
) {
  const padding = 18
  const primaryBlocks = blocks.filter((block) => block.kind === 'primary')
  const detailBlocks = blocks.filter((block) => block.kind === 'detail')
  let height = padding + 34 + 12 + padding

  if (options.edited) {
    height += 13
  }

  height += 14

  primaryBlocks.forEach((block, index) => {
    height += measureBlockHeight(block, 15, 12, index === primaryBlocks.length - 1 && !detailBlocks.length ? 0 : 10)
  })

  if (primaryBlocks.length && detailBlocks.length) {
    height += 8
  }

  if (detailBlocks.length) {
    height += 12
    for (let index = 0; index < detailBlocks.length; index += 2) {
      const left = detailBlocks[index]
      const right = detailBlocks[index + 1]
      const leftHeight = measureBlockHeight(left, 14, 11, 0)
      const rightHeight = right ? measureBlockHeight(right, 14, 11, 0) : 0
      height += Math.max(leftHeight, rightHeight) + 10
    }
  }

  if (options.backdateNote) {
    height += 10 + backdateNoteHeight
  }

  return Math.max(height, 96)
}

function ensureSpace(ctx: LayoutContext, height: number) {
  if (ctx.y + height <= ctx.bottomLimit) {
    return
  }

  ctx.doc.addPage()
  ctx.y = ctx.margin
}

function drawDivider(ctx: LayoutContext, x: number, width: number) {
  setStroke(ctx.doc, slate200)
  ctx.doc.setLineWidth(0.75)
  ctx.doc.line(x, ctx.y, x + width, ctx.y)
  ctx.doc.setLineWidth(0.5)
  ctx.y += 10
}

function drawBlockLabel(ctx: LayoutContext, label: string, x: number, fontSize: number) {
  ctx.doc.setFont('helvetica', 'bold')
  ctx.doc.setFontSize(fontSize)
  setText(ctx.doc, slate500)
  ctx.doc.text(label.toUpperCase(), x, ctx.y)
}

function drawBlockLines(
  ctx: LayoutContext,
  lines: string[],
  x: number,
  fontSize: number,
  lineHeight: number,
  color: readonly [number, number, number] = slate700
) {
  ctx.doc.setFont('helvetica', 'normal')
  ctx.doc.setFontSize(fontSize)
  setText(ctx.doc, color)
  lines.forEach((line) => {
    ctx.doc.text(line, x, ctx.y)
    ctx.y += lineHeight
  })
}

function drawEntryCard(
  ctx: LayoutContext,
  entry: ReportEntryRecord,
  index: number,
  backdateContext: BackdateReportContext = {}
) {
  const padding = 18
  const innerX = ctx.x + padding
  const innerWidth = ctx.width - padding * 2
  const blocks = buildEntryBlocks(ctx.doc, entry, innerWidth)
  const primaryBlocks = blocks.filter((block) => block.kind === 'primary')
  const detailBlocks = blocks.filter((block) => block.kind === 'detail')
  const backdateNote = getEntryBackdateNote(entry, backdateContext)
  const edited = wasEntryEdited(entry)
  const cardHeight = measureEntryHeight(blocks, {
    backdateNote,
    edited
  })

  ensureSpace(ctx, cardHeight + 14)

  const cardY = ctx.y
  setStroke(ctx.doc, slate200)
  setFill(ctx.doc, slate50)
  ctx.doc.roundedRect(ctx.x, cardY, ctx.width, cardHeight, 12, 12, 'FD')

  ctx.y = cardY + padding

  ctx.doc.setFont('helvetica', 'bold')
  ctx.doc.setFontSize(12.5)
  setText(ctx.doc, slate900)
  ctx.doc.text(entry.condition_label, innerX, ctx.y)

  ctx.doc.setFont('helvetica', 'normal')
  ctx.doc.setFontSize(10)
  setText(ctx.doc, slate500)
  ctx.doc.text(
    formatReportEntryDate(entry.occurred_at || entry.created_at),
    ctx.x + ctx.width - padding,
    ctx.y,
    { align: 'right' }
  )

  ctx.y += 16

  const sourceLabel = entry.source === 'family' ? 'Family observation' : 'Veteran log'
  const severityLabel = typeof entry.severity === 'number' ? `Severity ${entry.severity}/10` : 'Severity not recorded'
  ctx.doc.setFont('helvetica', 'normal')
  ctx.doc.setFontSize(9.5)
  setText(ctx.doc, slate500)
  ctx.doc.text(`${severityLabel} · ${sourceLabel} · Entry ${index + 1}`, innerX, ctx.y)

  if (edited) {
    ctx.y += 13
    ctx.doc.setFont('helvetica', 'italic')
    ctx.doc.setFontSize(9)
    setText(ctx.doc, slate500)
    ctx.doc.text(`Edited ${formatReportEntryDate(entry.updated_at)}`, innerX, ctx.y)
  }

  ctx.y += 14

  drawDivider(ctx, innerX, innerWidth)

  primaryBlocks.forEach((block, blockIndex) => {
    drawBlockLabel(ctx, block.label, innerX, 8.5)
    ctx.y += 12
    drawBlockLines(ctx, block.lines, innerX, 11, 15)
    if (blockIndex < primaryBlocks.length - 1 || detailBlocks.length) {
      ctx.y += 8
    }
  })

  if (detailBlocks.length) {
    if (primaryBlocks.length) {
      drawDivider(ctx, innerX, innerWidth)
    }

    drawBlockLabel(ctx, 'Additional details', innerX, 8)
    ctx.y += 12

    const columnGap = 16
    const columnWidth = (innerWidth - columnGap) / 2

    for (let index = 0; index < detailBlocks.length; index += 2) {
      const left = detailBlocks[index]
      const right = detailBlocks[index + 1]
      const rowStartY = ctx.y
      let leftEndY = rowStartY
      let rightEndY = rowStartY

      drawBlockLabel(ctx, left.label, innerX, 7.5)
      leftEndY += 11
      ctx.y = leftEndY
      drawBlockLines(ctx, left.lines, innerX, 10, 14)
      leftEndY = ctx.y

      if (right) {
        ctx.y = rowStartY
        drawBlockLabel(ctx, right.label, innerX + columnWidth + columnGap, 7.5)
        rightEndY += 11
        ctx.y = rightEndY
        drawBlockLines(ctx, right.lines, innerX + columnWidth + columnGap, 10, 14)
        rightEndY = ctx.y
      }

      ctx.y = Math.max(leftEndY, rightEndY) + 8
    }
  }

  if (backdateNote) {
    ctx.y += 10
    drawBackdateNote(ctx, backdateNote, innerX, innerWidth)
  }

  ctx.y = cardY + cardHeight + 14
}

export function drawEntryLogSection(
  doc: jsPDF,
  entries: ReportEntryRecord[],
  x: number,
  y: number,
  width: number,
  margin: number,
  pageHeight: number,
  backdateContext: BackdateReportContext = {}
) {
  const bottomLimit = pageHeight - 48
  const ctx: LayoutContext = {
    doc,
    x,
    y,
    width,
    margin,
    pageHeight,
    bottomLimit
  }

  const sortedEntries = [...entries].sort(
    (left, right) => getEntryDate(right).getTime() - getEntryDate(left).getTime()
  )

  // Keep the section header attached to the first entry card: if the header
  // plus the first card (capped at roughly half a page) won't fit, start a
  // fresh page before drawing the header instead of orphaning it.
  const headerHeight = 38
  const firstEntry = sortedEntries[0]
  let keepWithHeader = 96

  if (firstEntry) {
    const firstBlocks = buildEntryBlocks(doc, firstEntry, width - 36)
    const firstCardHeight = measureEntryHeight(firstBlocks, {
      backdateNote: getEntryBackdateNote(firstEntry, backdateContext),
      edited: wasEntryEdited(firstEntry)
    })
    keepWithHeader = Math.min(firstCardHeight + 14, 360)
  }

  ensureSpace(ctx, headerHeight + keepWithHeader)
  drawSectionTitle(doc, 'Symptom entry log', x, ctx.y)
  ctx.y += 16

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  setText(doc, slate500)
  doc.text('Readable record of logged symptoms, severity, functional impact, and edit history.', x, ctx.y)
  ctx.y += 22

  sortedEntries.forEach((entry, index) => {
    drawEntryCard(ctx, entry, index, backdateContext)
  })

  return ctx.y
}
