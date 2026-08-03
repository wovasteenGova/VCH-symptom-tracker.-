export type TrackerSettingsOpenOptions = {
  expanded?: boolean
  section?: string
}

/** Tracks tracker settings popover / expanded overlay open state app-wide. */
export function useTrackerSettingsPanelOpen() {
  const settingsPopoverOpen = useState('tracker-settings-popover-open', () => false)
  const settingsExpandedOpen = useState('tracker-settings-expanded-open', () => false)
  const pendingSettingsSection = useState<string | null>('tracker-settings-pending-section', () => null)
  const settingsPanelOpen = computed(() => settingsPopoverOpen.value || settingsExpandedOpen.value)

  function closeSettingsPanel() {
    settingsPopoverOpen.value = false
    settingsExpandedOpen.value = false
    pendingSettingsSection.value = null
    const { settingsSectionMenuOpen } = useTrackerSettingsSectionMenuOpen()
    settingsSectionMenuOpen.value = false
  }

  function openSettingsPanel(options: TrackerSettingsOpenOptions = {}) {
    pendingSettingsSection.value = options.section ?? null

    if (options.expanded) {
      settingsPopoverOpen.value = false
      settingsExpandedOpen.value = true
      return
    }

    settingsExpandedOpen.value = false
    settingsPopoverOpen.value = true
  }

  function consumePendingSettingsSection() {
    const section = pendingSettingsSection.value
    pendingSettingsSection.value = null
    return section
  }

  return {
    settingsPopoverOpen,
    settingsExpandedOpen,
    settingsPanelOpen,
    pendingSettingsSection,
    closeSettingsPanel,
    openSettingsPanel,
    consumePendingSettingsSection
  }
}
