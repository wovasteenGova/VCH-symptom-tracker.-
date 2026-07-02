import { d as _export_sfc, _ as __nuxt_component_0$1, e as _sfc_main$d } from './server.mjs';
import { _ as __nuxt_component_5 } from './StickyActionBar-DXZsYWQC.mjs';
import { mergeProps, withCtx, createVNode, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent } from 'vue/server-renderer';
import '../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import '@iconify/utils';
import 'node:crypto';
import 'consola';
import 'node:fs';
import 'node:path';
import 'vue-router';
import '@iconify/vue';
import 'tailwindcss/colors';
import '@vueuse/core';
import '@vueuse/shared';
import 'tailwind-variants';
import '@iconify/utils/lib/css/icon';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';

const _sfc_main = {};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs) {
  const _component_NuxtLink = __nuxt_component_0$1;
  const _component_UIcon = _sfc_main$d;
  const _component_StickyActionBar = __nuxt_component_5;
  _push(`<main${ssrRenderAttrs(mergeProps({ class: "flex min-h-dvh flex-col bg-slate-950 text-white" }, _attrs))}><section class="mx-auto flex w-full max-w-md flex-1 flex-col px-4 pt-5 sm:max-w-lg"><header class="flex shrink-0 items-center justify-between gap-3"><div><p class="text-xs font-semibold uppercase tracking-[0.2em] text-teal-200">Install Guide</p><h1 class="mt-1 text-2xl font-bold tracking-tight text-white">Add the app to your phone</h1></div>`);
  _push(ssrRenderComponent(_component_NuxtLink, {
    to: "/",
    class: "grid size-10 place-items-center rounded-full bg-slate-900 text-white shadow-sm ring-1 ring-slate-800 transition hover:bg-slate-800",
    "aria-label": "Back to tracker"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_UIcon, {
          name: "i-lucide-arrow-left",
          class: "size-5"
        }, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_UIcon, {
            name: "i-lucide-arrow-left",
            class: "size-5"
          })
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</header><div class="mt-6 flex-1 space-y-4 overflow-y-auto no-scrollbar pb-4"><section class="rounded-4xl border border-slate-800 bg-slate-900 p-5"><h2 class="text-xl font-bold text-white">iPhone</h2><ol class="mt-4 space-y-3 text-sm leading-6 text-slate-300"><li><span class="font-bold text-white">1.</span> Open this site in Safari.</li><li><span class="font-bold text-white">2.</span> Tap the Share button at the bottom of Safari.</li><li><span class="font-bold text-white">3.</span> Scroll and tap Add to Home Screen.</li><li><span class="font-bold text-white">4.</span> Tap Add. The app will appear with your other apps.</li></ol></section><section class="rounded-4xl border border-slate-800 bg-slate-900 p-5"><h2 class="text-xl font-bold text-white">Android</h2><ol class="mt-4 space-y-3 text-sm leading-6 text-slate-300"><li><span class="font-bold text-white">1.</span> Open this site in Chrome.</li><li><span class="font-bold text-white">2.</span> Tap Install app if Chrome shows it.</li><li><span class="font-bold text-white">3.</span> If not, tap the three-dot menu.</li><li><span class="font-bold text-white">4.</span> Tap Add to Home screen or Install app.</li></ol></section><section class="rounded-4xl border border-teal-500/30 bg-teal-950/30 p-5"><h2 class="text-xl font-bold text-white">Share this with testers</h2><p class="mt-3 text-sm leading-6 text-teal-50/90"> Open the app link on your phone. On iPhone use Safari Share &gt; Add to Home Screen. On Android use Chrome &gt; Install app or Add to Home screen. </p></section></div>`);
  _push(ssrRenderComponent(_component_StickyActionBar, { tone: "dark" }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_NuxtLink, {
          to: "/",
          class: "flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-4 text-base font-bold text-slate-950 shadow-lg transition hover:bg-slate-200"
        }, {
          default: withCtx((_2, _push3, _parent3, _scopeId2) => {
            if (_push3) {
              _push3(ssrRenderComponent(_component_UIcon, {
                name: "i-lucide-arrow-left",
                class: "size-5"
              }, null, _parent3, _scopeId2));
              _push3(` Back to tracker `);
            } else {
              return [
                createVNode(_component_UIcon, {
                  name: "i-lucide-arrow-left",
                  class: "size-5"
                }),
                createTextVNode(" Back to tracker ")
              ];
            }
          }),
          _: 1
        }, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_NuxtLink, {
            to: "/",
            class: "flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-4 text-base font-bold text-slate-950 shadow-lg transition hover:bg-slate-200"
          }, {
            default: withCtx(() => [
              createVNode(_component_UIcon, {
                name: "i-lucide-arrow-left",
                class: "size-5"
              }),
              createTextVNode(" Back to tracker ")
            ]),
            _: 1
          })
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</section></main>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/install.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const install = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);

export { install as default };
//# sourceMappingURL=install-Ce7KRWB4.mjs.map
