import { defineComponent, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderSlot } from 'vue/server-renderer';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "StickyActionBar",
  __ssrInlineRender: true,
  props: {
    tone: { default: "light" }
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: ["sticky bottom-0 z-30 -mx-4 border-t px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 backdrop-blur-md supports-[backdrop-filter]:bg-opacity-90 sm:-mx-0", __props.tone === "dark" ? "border-slate-800 bg-slate-950/95 supports-[backdrop-filter]:bg-slate-950/85" : "border-slate-200 bg-slate-50/95 dark:border-slate-800 dark:bg-slate-950/95 supports-[backdrop-filter]:bg-slate-50/85 dark:supports-[backdrop-filter]:bg-slate-950/85"]
      }, _attrs))}>`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/StickyActionBar.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_5 = Object.assign(_sfc_main, { __name: "StickyActionBar" });

export { __nuxt_component_5 as _ };
//# sourceMappingURL=StickyActionBar-DXZsYWQC.mjs.map
