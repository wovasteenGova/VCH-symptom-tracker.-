import type { jsPDF } from 'jspdf'

type ChartEntry = {
  condition_label: string
  source?: string | null
  severity?: number | null
  occurred_at?: string | null
  created_at?: string | null
}

const slate900 = [15, 23, 42] as const
const slate500 = [100, 116, 139] as const
const slate200 = [226, 232, 240] as const
const emerald500 = [16, 185, 129] as const
const amber500 = [245, 158, 11] as const
const orange500 = [249, 115, 22] as const
const sky500 = [14, 165, 233] as const
const violet500 = [139, 92, 246] as const

function getEntryDate(entry: ChartEntry) {
  return new Date(entry.occurred_at || entry.created_at || 0)
}

function setFill(doc: jsPDF, color: readonly [number, number, number]) {
  doc.setFillColor(color[0], color[1], color[2])
}

function setStroke(doc: jsPDF, color: readonly [number, number, number]) {
  doc.setDrawColor(color[0], color[1], color[2])
}

function setText(doc: jsPDF, color: readonly [number, number, number]) {
  doc.setTextColor(color[0], color[1], color[2])
}

export function buildReportMetrics(entries: ChartEntry[]) {
  const sorted = [...entries].sort((left, right) => getEntryDate(left).getTime() - getEntryDate(right).getTime())
  const severities = entries.map((entry) => entry.severity ?? 0)
  const averageSeverity = severities.reduce((sum, value) => sum + value, 0) / Math.max(severities.length, 1)
  const peakSeverity = Math.max(...severities, 0)

  const byCondition = new Map<string, number>()
  const bySource = new Map<string, number>()
  const severityBands = { mild: 0, moderate: 0, severe: 0 }
  const byMonth = new Map<string, number>()

  entries.forEach((entry) => {
    byCondition.set(entry.condition_label, (byCondition.get(entry.condition_label) || 0) + 1)

    const sourceLabel = entry.source === 'family' ? 'Family' : 'Veteran'
    bySource.set(sourceLabel, (bySource.get(sourceLabel) || 0) + 1)

    const severity = entry.severity ?? 0
    if (severity >= 7) {
      severityBands.severe += 1
    } else if (severity >= 4) {
      severityBands.moderate += 1
    } else {
      severityBands.mild += 1
    }

    const monthKey = getEntryDate(entry).toLocaleString('en-US', { month: 'short', year: '2-digit' })
    byMonth.set(monthKey, (byMonth.get(monthKey) || 0) + 1)
  })

  const trend = sorted.slice(-14).map((entry) => ({
    label: getEntryDate(entry).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }),
    value: entry.severity ?? 0
  }))

  const monthActivity = [...byMonth.entries()]
    .slice(-6)
    .map(([label, value]) => ({ label, value }))

  const conditionBreakdown = [...byCondition.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 6)
    .map(([label, value]) => ({ label, value }))

  const extendedConditionBreakdown = [...byCondition.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(6)
    .map(([label, value]) => ({ label, value }))

  const today = new Date()
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
  const monthDays = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
  const dailyCounts = Array.from({ length: monthDays }, (_, index) => {
    const day = index + 1
    return entries.filter((entry) => {
      const entryDate = getEntryDate(entry)
      return entryDate.getFullYear() === today.getFullYear()
        && entryDate.getMonth() === today.getMonth()
        && entryDate.getDate() === day
    }).length
  })

  return {
    totalEntries: entries.length,
    averageSeverity,
    peakSeverity,
    conditionCount: byCondition.size,
    trend,
    monthActivity,
    conditionBreakdown,
    extendedConditionBreakdown,
    severityBands,
    sourceBreakdown: [...bySource.entries()].map(([label, value]) => ({ label, value })),
    dailyCounts,
    monthLabel: today.toLocaleString('en-US', { month: 'long', year: 'numeric' })
  }
}

export function drawSectionTitle(doc: jsPDF, title: string, x: number, y: number) {
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  setText(doc, slate900)
  doc.text(title, x, y)
}

export function drawStatCards(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  stats: Array<{ label: string, value: string }>
) {
  const gap = 10
  const cardWidth = (width - gap * (stats.length - 1)) / stats.length
  const cardHeight = 54

  stats.forEach((stat, index) => {
    const cardX = x + index * (cardWidth + gap)
    setStroke(doc, slate200)
    setFill(doc, [248, 250, 252])
    doc.roundedRect(cardX, y, cardWidth, cardHeight, 8, 8, 'FD')

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(18)
    setText(doc, slate900)
    doc.text(stat.value, cardX + 12, y + 28)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    setText(doc, slate500)
    doc.text(stat.label.toUpperCase(), cardX + 12, y + 42)
  })

  return y + cardHeight
}

export function drawLineChart(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  height: number,
  points: Array<{ label: string, value: number }>
) {
  setStroke(doc, slate200)
  setFill(doc, [255, 255, 255])
  doc.roundedRect(x, y, width, height, 10, 10, 'FD')

  const chartX = x + 36
  const chartY = y + 18
  const chartWidth = width - 52
  const chartHeight = height - 36

  for (let tick = 0; tick <= 10; tick += 2) {
    const lineY = chartY + chartHeight - (tick / 10) * chartHeight
    setStroke(doc, slate200)
    doc.line(chartX, lineY, chartX + chartWidth, lineY)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    setText(doc, slate500)
    doc.text(String(tick), x + 10, lineY + 2)
  }

  if (!points.length) {
    return y + height
  }

  const stepX = points.length > 1 ? chartWidth / (points.length - 1) : 0
  const coords = points.map((point, index) => ({
    x: chartX + stepX * index,
    y: chartY + chartHeight - (Math.max(0, Math.min(10, point.value)) / 10) * chartHeight
  }))

  setStroke(doc, sky500)
  doc.setLineWidth(1.5)
  coords.forEach((point, index) => {
    if (index === 0) {
      return
    }

    doc.line(coords[index - 1].x, coords[index - 1].y, point.x, point.y)
  })

  coords.forEach((point) => {
    setFill(doc, sky500)
    doc.circle(point.x, point.y, 2.5, 'F')
  })

  doc.setFontSize(7)
  setText(doc, slate500)
  points.forEach((point, index) => {
    if (index % 2 !== 0 && points.length > 8) {
      return
    }

    doc.text(point.label, chartX + stepX * index - 6, y + height - 6)
  })

  doc.setLineWidth(0.5)
  return y + height
}

export function drawHorizontalBarChart(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  height: number,
  items: Array<{ label: string, value: number }>,
  colors: readonly (readonly [number, number, number])[]
) {
  setStroke(doc, slate200)
  setFill(doc, [255, 255, 255])
  doc.roundedRect(x, y, width, height, 10, 10, 'FD')

  const maxValue = Math.max(...items.map((item) => item.value), 1)
  const rowHeight = Math.min(22, (height - 28) / Math.max(items.length, 1))
  let rowY = y + 18

  items.forEach((item, index) => {
    const barMaxWidth = width - 130
    const barWidth = (item.value / maxValue) * barMaxWidth
    const color = colors[index % colors.length]

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    setText(doc, slate900)
    doc.text(item.label.length > 18 ? `${item.label.slice(0, 18)}…` : item.label, x + 12, rowY + 8)

    setFill(doc, [241, 245, 249])
    doc.roundedRect(x + 108, rowY, barMaxWidth, 12, 4, 4, 'F')
    setFill(doc, color)
    doc.roundedRect(x + 108, rowY, Math.max(barWidth, 6), 12, 4, 4, 'F')

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    setText(doc, slate900)
    doc.text(String(item.value), x + width - 18, rowY + 8, { align: 'right' })

    rowY += rowHeight
  })

  return y + height
}

export function drawVerticalBarChart(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  height: number,
  items: Array<{ label: string, value: number }>,
  colors: readonly (readonly [number, number, number])[]
) {
  setStroke(doc, slate200)
  setFill(doc, [255, 255, 255])
  doc.roundedRect(x, y, width, height, 10, 10, 'FD')

  const chartX = x + 24
  const chartY = y + 16
  const chartWidth = width - 36
  const chartHeight = height - 34
  const maxValue = Math.max(...items.map((item) => item.value), 1)
  const barWidth = chartWidth / Math.max(items.length, 1) - 8

  items.forEach((item, index) => {
    const barHeight = (item.value / maxValue) * chartHeight
    const barX = chartX + index * (barWidth + 8)
    const barY = chartY + chartHeight - barHeight
    const color = colors[index % colors.length]

    setFill(doc, color)
    doc.roundedRect(barX, barY, barWidth, Math.max(barHeight, 4), 4, 4, 'F')

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    setText(doc, slate900)
    doc.text(String(item.value), barX + barWidth / 2, barY - 4, { align: 'center' })

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    setText(doc, slate500)
    doc.text(item.label, barX + barWidth / 2, y + height - 8, { align: 'center' })
  })

  return y + height
}

export function drawHeatmapCalendar(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  height: number,
  monthLabel: string,
  dailyCounts: number[]
) {
  setStroke(doc, slate200)
  setFill(doc, [255, 255, 255])
  doc.roundedRect(x, y, width, height, 10, 10, 'FD')

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  setText(doc, slate500)
  ;['M', 'T', 'W', 'T', 'F', 'S', 'S'].forEach((label, index) => {
    doc.text(label, x + 18 + index * 24, y + 18, { align: 'center' })
  })

  const today = new Date()
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay()
  const mondayOffset = firstDay === 0 ? 6 : firstDay - 1
  const maxCount = Math.max(...dailyCounts, 1)
  const cellSize = 18
  const gridX = x + 12
  const gridY = y + 26

  dailyCounts.forEach((count, index) => {
    const cellIndex = mondayOffset + index
    const row = Math.floor(cellIndex / 7)
    const col = cellIndex % 7
    const cellX = gridX + col * 24
    const cellY = gridY + row * 22
    const intensity = count / maxCount

    if (count === 0) {
      setFill(doc, [241, 245, 249])
    } else if (intensity >= 0.66) {
      setFill(doc, orange500)
    } else if (intensity >= 0.33) {
      setFill(doc, amber500)
    } else {
      setFill(doc, emerald500)
    }

    doc.roundedRect(cellX, cellY, cellSize, cellSize, 4, 4, 'F')

    doc.setFont('helvetica', count > 1 ? 'bold' : 'normal')
    doc.setFontSize(count > 1 ? 7 : 6)
    setText(doc, count > 0 ? slate900 : slate500)
    doc.text(count > 1 ? String(count) : String(index + 1), cellX + cellSize / 2, cellY + 11, { align: 'center' })
  })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  setText(doc, slate500)
  doc.text(monthLabel, x + width - 12, y + 14, { align: 'right' })

  return y + height
}
