/** Contact / FAQ overlays opened from settings — state lives outside the settings panel so UPopover dismiss does not tear them down. */
export function useSettingsSupportOverlays() {
  const contactOpen = useState('symptom-tracker-settings-contact-open', () => false)
  const faqOpen = useState('symptom-tracker-settings-faq-open', () => false)
  const isOpen = computed(() => contactOpen.value || faqOpen.value)

  function openContact() {
    faqOpen.value = false
    contactOpen.value = true
  }

  function openFaq() {
    contactOpen.value = false
    faqOpen.value = true
  }

  function openContactFromFaq() {
    faqOpen.value = false
    contactOpen.value = true
  }

  function closeContact() {
    contactOpen.value = false
  }

  function closeFaq() {
    faqOpen.value = false
  }

  function closeAll() {
    contactOpen.value = false
    faqOpen.value = false
  }

  return {
    contactOpen,
    faqOpen,
    isOpen,
    openContact,
    openFaq,
    openContactFromFaq,
    closeContact,
    closeFaq,
    closeAll
  }
}
