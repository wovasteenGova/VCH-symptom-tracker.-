/** Tracks the settings section picker so parent popovers stay open while it is teleported to body. */
export function useTrackerSettingsSectionMenuOpen() {
  const settingsSectionMenuOpen = useState('tracker-settings-section-menu-open', () => false)
  return { settingsSectionMenuOpen }
}
