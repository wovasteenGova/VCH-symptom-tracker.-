import {
  CLAIMBUILDER_PRO_URL_PARAM,
  rememberClaimBuilderProLink
} from '../utils/claimBuilderPro'

export default defineNuxtPlugin(() => {
  const route = useRoute()
  const router = useRouter()

  if (route.query[CLAIMBUILDER_PRO_URL_PARAM] !== '1') {
    return
  }

  rememberClaimBuilderProLink()

  const query = { ...route.query }
  delete query[CLAIMBUILDER_PRO_URL_PARAM]

  void router.replace({
    path: route.path,
    query,
    hash: route.hash
  })
})
