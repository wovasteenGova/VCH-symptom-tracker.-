export const MOBILE_KEYBOARD_OPEN_THRESHOLD_PX = 80
export const INITIAL_FOCUSED_VIEWPORT_LOSS_PX = 160

export function isIosWebKitBrowser(input: {
  userAgent: string
  platform?: string
  maxTouchPoints?: number
}) {
  if (/\b(?:iPhone|iPad|iPod)\b/i.test(input.userAgent)) return true

  return input.platform === 'MacIntel' && (input.maxTouchPoints ?? 0) > 1
}

export function resolveMobileViewport(input: {
  layoutHeight: number
  visualHeight: number
  visualOffsetTop: number
  visualBaselineHeight: number
  editableFocused: boolean
}) {
  const layoutHeight = Math.max(0, Math.round(input.layoutHeight))
  const visualHeight = Math.max(0, Math.round(input.visualHeight))
  const visualOffsetTop = Math.max(0, Math.round(input.visualOffsetTop))
  const visualBaselineHeight = Math.max(
    visualHeight,
    Math.round(input.visualBaselineHeight)
  )
  const layoutKeyboardInset = Math.max(
    0,
    layoutHeight - visualHeight - visualOffsetTop
  )
  const visualKeyboardInset = Math.max(0, visualBaselineHeight - visualHeight)
  const initialFocusedViewportLoss = input.editableFocused
    ? Math.max(0, layoutHeight - visualHeight)
    : 0
  const initialKeyboardInset = initialFocusedViewportLoss > INITIAL_FOCUSED_VIEWPORT_LOSS_PX
    ? initialFocusedViewportLoss
    : 0
  const keyboardInset = input.editableFocused
    ? Math.max(layoutKeyboardInset, visualKeyboardInset, initialKeyboardInset)
    : 0

  return {
    height: visualHeight,
    offsetTop: visualOffsetTop,
    keyboardInset,
    keyboardOpen: keyboardInset > MOBILE_KEYBOARD_OPEN_THRESHOLD_PX
  }
}
