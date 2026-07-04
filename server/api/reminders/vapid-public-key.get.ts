import { getVapidPublicKey } from '../../utils/pushReminderAuth'

export default defineEventHandler(() => {
  const publicKey = getVapidPublicKey()

  return {
    configured: Boolean(publicKey),
    publicKey
  }
})
