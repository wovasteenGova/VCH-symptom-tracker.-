import { L as useLocale, x as useAppConfig, I as useForwardProps$1, c as __nuxt_component_0$2, B as useComponentProps, J as useForwardProps, G as useFormField, w as tv, Q as useState, b as Primitive, e as _sfc_main$d, H as useForwardExpose, y as useCollection, s as injectTooltipProviderContext, M as usePortal, F as FieldGroupReset, j as createContext, T as Teleport_default, P as Presence_default, V as VisuallyHidden_default } from './server.mjs';
import { computed, unref, withCtx, mergeProps, createVNode, useModel, openBlock, createBlock, Fragment, renderList, mergeModels, useSlots, useId, useAttrs, createCommentVNode, renderSlot, createTextVNode, toDisplayString, defineComponent, toRefs, ref, resolveDynamicComponent, normalizeStyle, toRef, withKeys, withModifiers, toRaw, watch, toHandlers, normalizeProps, guardReactiveProps, watchEffect, reactive, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrRenderList, ssrRenderClass, ssrRenderSlot, ssrInterpolate } from 'vue/server-renderer';
import { u as useDirection, d as useFormControl, V as VisuallyHiddenInput_default, c as PopperRoot_default, f as useId$1, P as PopperAnchor_default, e as useForwardPropsEmits, a as PopperArrow_default, g as useSize, D as DismissableLayer_default, b as PopperContent_default } from './useSupabaseClient-K6OqxTB_.mjs';
import { reactivePick, useVModel, useTimeoutFn, useMounted, createSharedComposable } from '@vueuse/core';
import { f as defu } from '../_/nitro.mjs';
import { refAutoReset, tryOnScopeDispose, createEventHook } from '@vueuse/shared';

function clamp(value, min = Number.NEGATIVE_INFINITY, max = Number.POSITIVE_INFINITY) {
  return Math.min(max, Math.max(min, value));
}
function useGraceArea(triggerElement, containerElement) {
  const isPointerInTransit = refAutoReset(false, 300);
  tryOnScopeDispose(() => {
    isPointerInTransit.value = false;
  });
  const pointerGraceArea = ref(null);
  const pointerExit = createEventHook();
  function handleRemoveGraceArea() {
    pointerGraceArea.value = null;
    isPointerInTransit.value = false;
  }
  function handleCreateGraceArea(event, hoverTarget) {
    if (!hoverTarget) return;
    const currentTarget = event.currentTarget;
    const exitPoint = {
      x: event.clientX,
      y: event.clientY
    };
    const exitSide = getExitSideFromRect(exitPoint, currentTarget.getBoundingClientRect());
    const paddedExitPoints = getPaddedExitPoints(exitPoint, exitSide, 1);
    const hoverTargetPoints = getPointsFromRect(hoverTarget.getBoundingClientRect());
    const graceArea = getHull([...paddedExitPoints, ...hoverTargetPoints]);
    pointerGraceArea.value = graceArea;
    isPointerInTransit.value = true;
  }
  watchEffect((cleanupFn) => {
    if (triggerElement.value && containerElement.value) {
      const handleTriggerLeave = (event) => handleCreateGraceArea(event, containerElement.value);
      const handleContentLeave = (event) => handleCreateGraceArea(event, triggerElement.value);
      triggerElement.value.addEventListener("pointerleave", handleTriggerLeave);
      containerElement.value.addEventListener("pointerleave", handleContentLeave);
      cleanupFn(() => {
        triggerElement.value?.removeEventListener("pointerleave", handleTriggerLeave);
        containerElement.value?.removeEventListener("pointerleave", handleContentLeave);
      });
    }
  });
  watchEffect((cleanupFn) => {
    if (pointerGraceArea.value) {
      const handleTrackPointerGrace = (event) => {
        if (!pointerGraceArea.value || !(event.target instanceof Element)) return;
        const target = event.target;
        const pointerPosition = {
          x: event.clientX,
          y: event.clientY
        };
        const hasEnteredTarget = triggerElement.value?.contains(target) || containerElement.value?.contains(target);
        const isPointerOutsideGraceArea = !isPointInPolygon(pointerPosition, pointerGraceArea.value);
        const isAnotherGraceAreaTrigger = !!target.closest("[data-grace-area-trigger]");
        if (hasEnteredTarget) handleRemoveGraceArea();
        else if (isPointerOutsideGraceArea || isAnotherGraceAreaTrigger) {
          handleRemoveGraceArea();
          pointerExit.trigger();
        }
      };
      triggerElement.value?.ownerDocument.addEventListener("pointermove", handleTrackPointerGrace);
      cleanupFn(() => triggerElement.value?.ownerDocument.removeEventListener("pointermove", handleTrackPointerGrace));
    }
  });
  return {
    isPointerInTransit,
    onPointerExit: pointerExit.on
  };
}
function getExitSideFromRect(point, rect) {
  const top = Math.abs(rect.top - point.y);
  const bottom = Math.abs(rect.bottom - point.y);
  const right = Math.abs(rect.right - point.x);
  const left = Math.abs(rect.left - point.x);
  switch (Math.min(top, bottom, right, left)) {
    case left:
      return "left";
    case right:
      return "right";
    case top:
      return "top";
    case bottom:
      return "bottom";
    default:
      throw new Error("unreachable");
  }
}
function getPaddedExitPoints(exitPoint, exitSide, padding = 5) {
  const paddedExitPoints = [];
  switch (exitSide) {
    case "top":
      paddedExitPoints.push({
        x: exitPoint.x - padding,
        y: exitPoint.y + padding
      }, {
        x: exitPoint.x + padding,
        y: exitPoint.y + padding
      });
      break;
    case "bottom":
      paddedExitPoints.push({
        x: exitPoint.x - padding,
        y: exitPoint.y - padding
      }, {
        x: exitPoint.x + padding,
        y: exitPoint.y - padding
      });
      break;
    case "left":
      paddedExitPoints.push({
        x: exitPoint.x + padding,
        y: exitPoint.y - padding
      }, {
        x: exitPoint.x + padding,
        y: exitPoint.y + padding
      });
      break;
    case "right":
      paddedExitPoints.push({
        x: exitPoint.x - padding,
        y: exitPoint.y - padding
      }, {
        x: exitPoint.x - padding,
        y: exitPoint.y + padding
      });
      break;
  }
  return paddedExitPoints;
}
function getPointsFromRect(rect) {
  const { top, right, bottom, left } = rect;
  return [
    {
      x: left,
      y: top
    },
    {
      x: right,
      y: top
    },
    {
      x: right,
      y: bottom
    },
    {
      x: left,
      y: bottom
    }
  ];
}
function isPointInPolygon(point, polygon) {
  const { x, y } = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;
    const intersect = yi > y !== yj > y && x < (xj - xi) * (y - yi) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}
function getHull(points) {
  const newPoints = points.slice();
  newPoints.sort((a, b) => {
    if (a.x < b.x) return -1;
    else if (a.x > b.x) return 1;
    else if (a.y < b.y) return -1;
    else if (a.y > b.y) return 1;
    else return 0;
  });
  return getHullPresorted(newPoints);
}
function getHullPresorted(points) {
  if (points.length <= 1) return points.slice();
  const upperHull = [];
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    while (upperHull.length >= 2) {
      const q = upperHull.at(-1);
      const r = upperHull[upperHull.length - 2];
      if ((q.x - r.x) * (p.y - r.y) >= (q.y - r.y) * (p.x - r.x)) upperHull.pop();
      else break;
    }
    upperHull.push(p);
  }
  upperHull.pop();
  const lowerHull = [];
  for (let i = points.length - 1; i >= 0; i--) {
    const p = points[i];
    while (lowerHull.length >= 2) {
      const q = lowerHull.at(-1);
      const r = lowerHull[lowerHull.length - 2];
      if ((q.x - r.x) * (p.y - r.y) >= (q.y - r.y) * (p.x - r.x)) lowerHull.pop();
      else break;
    }
    lowerHull.push(p);
  }
  lowerHull.pop();
  if (upperHull.length === 1 && lowerHull.length === 1 && upperHull[0].x === lowerHull[0].x && upperHull[0].y === lowerHull[0].y) return upperHull;
  else return upperHull.concat(lowerHull);
}
function getNextSortedValues(prevValues = [], nextValue, atIndex) {
  const nextValues = [...prevValues];
  nextValues[atIndex] = nextValue;
  return nextValues.sort((a, b) => a - b);
}
function convertValueToPercentage(value, min, max) {
  const maxSteps = max - min;
  const percentPerStep = 100 / maxSteps;
  const percentage = percentPerStep * (value - min);
  return clamp(percentage, 0, 100);
}
function getLabel(index, totalValues) {
  if (totalValues > 2) return `Value ${index + 1} of ${totalValues}`;
  else if (totalValues === 2) return ["Minimum", "Maximum"][index];
  else return void 0;
}
function getClosestValueIndex(values, nextValue) {
  if (values.length === 1) return 0;
  const distances = values.map((value) => Math.abs(value - nextValue));
  const closestDistance = Math.min(...distances);
  return distances.indexOf(closestDistance);
}
function getThumbInBoundsOffset(width, left, direction) {
  const halfWidth = width / 2;
  const halfPercent = 50;
  const offset = linearScale([0, halfPercent], [0, halfWidth]);
  return (halfWidth - offset(left) * direction) * direction;
}
function getStepsBetweenValues(values) {
  return values.slice(0, -1).map((value, index) => values[index + 1] - value);
}
function hasMinStepsBetweenValues(values, minStepsBetweenValues) {
  if (minStepsBetweenValues > 0) {
    const stepsBetweenValues = getStepsBetweenValues(values);
    const actualMinStepsBetweenValues = Math.min(...stepsBetweenValues);
    return actualMinStepsBetweenValues >= minStepsBetweenValues;
  }
  return true;
}
function linearScale(input, output) {
  return (value) => {
    if (input[0] === input[1] || output[0] === output[1]) return output[0];
    const ratio = (output[1] - output[0]) / (input[1] - input[0]);
    return output[0] + ratio * (value - input[0]);
  };
}
function getDecimalCount(value) {
  return (String(value).split(".")[1] || "").length;
}
function roundValue(value, decimalCount) {
  const rounder = 10 ** decimalCount;
  return Math.round(value * rounder) / rounder;
}
const PAGE_KEYS = ["PageUp", "PageDown"];
const ARROW_KEYS = [
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight"
];
const BACK_KEYS = {
  "from-left": [
    "Home",
    "PageDown",
    "ArrowDown",
    "ArrowLeft"
  ],
  "from-right": [
    "Home",
    "PageDown",
    "ArrowDown",
    "ArrowRight"
  ],
  "from-bottom": [
    "Home",
    "PageDown",
    "ArrowDown",
    "ArrowLeft"
  ],
  "from-top": [
    "Home",
    "PageUp",
    "ArrowUp",
    "ArrowLeft"
  ]
};
const [injectSliderOrientationContext, provideSliderOrientationContext] = /* @__PURE__ */ createContext(["SliderVertical", "SliderHorizontal"]);
var SliderHorizontal_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "SliderHorizontal",
  props: {
    dir: {
      type: String,
      required: false
    },
    min: {
      type: Number,
      required: true
    },
    max: {
      type: Number,
      required: true
    },
    inverted: {
      type: Boolean,
      required: true
    }
  },
  emits: [
    "slideEnd",
    "slideStart",
    "slideMove",
    "homeKeyDown",
    "endKeyDown",
    "stepKeyDown"
  ],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emits = __emit;
    const { max, min, dir, inverted } = toRefs(props);
    const { forwardRef, currentElement: sliderElement } = useForwardExpose();
    const rootContext = injectSliderRootContext();
    const offsetPosition = ref();
    const rectRef = ref();
    const isSlidingFromLeft = computed(() => dir?.value !== "rtl" && !inverted.value || dir?.value !== "ltr" && inverted.value);
    function getValueFromPointerEvent(event, slideStart) {
      const rect = rectRef.value || sliderElement.value.getBoundingClientRect();
      const thumb = [...rootContext.thumbElements.value][rootContext.valueIndexToChangeRef.value];
      const thumbWidth = rootContext.thumbAlignment.value === "contain" ? thumb.clientWidth : 0;
      if (!offsetPosition.value && !slideStart && rootContext.thumbAlignment.value === "contain") offsetPosition.value = event.clientX - thumb.getBoundingClientRect().left;
      const input = [0, rect.width - thumbWidth];
      const output = isSlidingFromLeft.value ? [min.value, max.value] : [max.value, min.value];
      const value = linearScale(input, output);
      rectRef.value = rect;
      const position = slideStart ? event.clientX - rect.left - thumbWidth / 2 : event.clientX - rect.left - (offsetPosition.value ?? 0);
      return value(position);
    }
    const startEdge = computed(() => isSlidingFromLeft.value ? "left" : "right");
    const endEdge = computed(() => isSlidingFromLeft.value ? "right" : "left");
    const direction = computed(() => isSlidingFromLeft.value ? 1 : -1);
    provideSliderOrientationContext({
      startEdge,
      endEdge,
      direction,
      size: "width"
    });
    return (_ctx, _cache) => {
      return openBlock(), createBlock(SliderImpl_default, {
        ref: unref(forwardRef),
        dir: unref(dir),
        "data-orientation": "horizontal",
        style: normalizeStyle({ ["--reka-slider-thumb-transform"]: !isSlidingFromLeft.value && unref(rootContext).thumbAlignment.value === "overflow" ? "translateX(50%)" : "translateX(-50%)" }),
        onSlideStart: _cache[0] || (_cache[0] = (event) => {
          const value = getValueFromPointerEvent(event, true);
          emits("slideStart", value);
        }),
        onSlideMove: _cache[1] || (_cache[1] = (event) => {
          const value = getValueFromPointerEvent(event);
          emits("slideMove", value);
        }),
        onSlideEnd: _cache[2] || (_cache[2] = () => {
          rectRef.value = void 0;
          offsetPosition.value = void 0;
          emits("slideEnd");
        }),
        onStepKeyDown: _cache[3] || (_cache[3] = (event) => {
          const slideDirection = isSlidingFromLeft.value ? "from-left" : "from-right";
          const isBackKey = unref(BACK_KEYS)[slideDirection].includes(event.key);
          emits("stepKeyDown", event, isBackKey ? -1 : 1);
        }),
        onEndKeyDown: _cache[4] || (_cache[4] = ($event) => emits("endKeyDown", $event)),
        onHomeKeyDown: _cache[5] || (_cache[5] = ($event) => emits("homeKeyDown", $event))
      }, {
        default: withCtx(() => [renderSlot(_ctx.$slots, "default")]),
        _: 3
      }, 8, ["dir", "style"]);
    };
  }
});
var SliderHorizontal_default = SliderHorizontal_vue_vue_type_script_setup_true_lang_default;
var SliderVertical_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "SliderVertical",
  props: {
    min: {
      type: Number,
      required: true
    },
    max: {
      type: Number,
      required: true
    },
    inverted: {
      type: Boolean,
      required: true
    }
  },
  emits: [
    "slideEnd",
    "slideStart",
    "slideMove",
    "homeKeyDown",
    "endKeyDown",
    "stepKeyDown"
  ],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emits = __emit;
    const { max, min, inverted } = toRefs(props);
    const rootContext = injectSliderRootContext();
    const { forwardRef, currentElement: sliderElement } = useForwardExpose();
    const offsetPosition = ref();
    const rectRef = ref();
    const isSlidingFromBottom = computed(() => !inverted.value);
    function getValueFromPointerEvent(event, slideStart) {
      const rect = rectRef.value || sliderElement.value.getBoundingClientRect();
      const thumb = [...rootContext.thumbElements.value][rootContext.valueIndexToChangeRef.value];
      const thumbHeight = rootContext.thumbAlignment.value === "contain" ? thumb.clientHeight : 0;
      if (!offsetPosition.value && !slideStart && rootContext.thumbAlignment.value === "contain") offsetPosition.value = event.clientY - thumb.getBoundingClientRect().top;
      const input = [0, rect.height - thumbHeight];
      const output = isSlidingFromBottom.value ? [max.value, min.value] : [min.value, max.value];
      const value = linearScale(input, output);
      const position = slideStart ? event.clientY - rect.top - thumbHeight / 2 : event.clientY - rect.top - (offsetPosition.value ?? 0);
      rectRef.value = rect;
      return value(position);
    }
    const startEdge = computed(() => isSlidingFromBottom.value ? "bottom" : "top");
    const endEdge = computed(() => isSlidingFromBottom.value ? "top" : "bottom");
    const direction = computed(() => isSlidingFromBottom.value ? 1 : -1);
    provideSliderOrientationContext({
      startEdge,
      endEdge,
      direction,
      size: "height"
    });
    return (_ctx, _cache) => {
      return openBlock(), createBlock(SliderImpl_default, {
        ref: unref(forwardRef),
        "data-orientation": "vertical",
        style: normalizeStyle({ ["--reka-slider-thumb-transform"]: !isSlidingFromBottom.value && unref(rootContext).thumbAlignment.value === "overflow" ? "translateY(-50%)" : "translateY(50%)" }),
        onSlideStart: _cache[0] || (_cache[0] = (event) => {
          const value = getValueFromPointerEvent(event, true);
          emits("slideStart", value);
        }),
        onSlideMove: _cache[1] || (_cache[1] = (event) => {
          const value = getValueFromPointerEvent(event);
          emits("slideMove", value);
        }),
        onSlideEnd: _cache[2] || (_cache[2] = () => {
          rectRef.value = void 0;
          offsetPosition.value = void 0;
          emits("slideEnd");
        }),
        onStepKeyDown: _cache[3] || (_cache[3] = (event) => {
          const slideDirection = isSlidingFromBottom.value ? "from-bottom" : "from-top";
          const isBackKey = unref(BACK_KEYS)[slideDirection].includes(event.key);
          emits("stepKeyDown", event, isBackKey ? -1 : 1);
        }),
        onEndKeyDown: _cache[4] || (_cache[4] = ($event) => emits("endKeyDown", $event)),
        onHomeKeyDown: _cache[5] || (_cache[5] = ($event) => emits("homeKeyDown", $event))
      }, {
        default: withCtx(() => [renderSlot(_ctx.$slots, "default")]),
        _: 3
      }, 8, ["style"]);
    };
  }
});
var SliderVertical_default = SliderVertical_vue_vue_type_script_setup_true_lang_default;
const [injectSliderRootContext, provideSliderRootContext] = /* @__PURE__ */ createContext("SliderRoot");
var SliderRoot_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  inheritAttrs: false,
  __name: "SliderRoot",
  props: {
    defaultValue: {
      type: Array,
      required: false,
      default: () => [0]
    },
    modelValue: {
      type: [Array, null],
      required: false
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false
    },
    orientation: {
      type: String,
      required: false,
      default: "horizontal"
    },
    dir: {
      type: String,
      required: false
    },
    inverted: {
      type: Boolean,
      required: false,
      default: false
    },
    min: {
      type: Number,
      required: false,
      default: 0
    },
    max: {
      type: Number,
      required: false,
      default: 100
    },
    step: {
      type: Number,
      required: false,
      default: 1
    },
    minStepsBetweenThumbs: {
      type: Number,
      required: false,
      default: 0
    },
    thumbAlignment: {
      type: String,
      required: false,
      default: "contain"
    },
    asChild: {
      type: Boolean,
      required: false
    },
    as: {
      type: null,
      required: false,
      default: "span"
    },
    name: {
      type: String,
      required: false
    },
    required: {
      type: Boolean,
      required: false
    }
  },
  emits: ["update:modelValue", "valueCommit"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emits = __emit;
    const { min, max, step, minStepsBetweenThumbs, orientation, disabled, thumbAlignment, dir: propDir } = toRefs(props);
    const dir = useDirection(propDir);
    const { forwardRef, currentElement } = useForwardExpose();
    const isFormControl = useFormControl(currentElement);
    const { CollectionSlot } = useCollection({ isProvider: true });
    const modelValue = useVModel(props, "modelValue", emits, {
      defaultValue: props.defaultValue,
      passive: props.modelValue === void 0
    });
    const currentModelValue = computed(() => Array.isArray(modelValue.value) ? [...modelValue.value] : []);
    const valueIndexToChangeRef = ref(0);
    const valuesBeforeSlideStartRef = ref(currentModelValue.value);
    function handleSlideStart(value) {
      const closestIndex = getClosestValueIndex(currentModelValue.value, value);
      updateValues(value, closestIndex);
    }
    function handleSlideMove(value) {
      updateValues(value, valueIndexToChangeRef.value);
    }
    function handleSlideEnd() {
      const prevValue = valuesBeforeSlideStartRef.value[valueIndexToChangeRef.value];
      const nextValue = currentModelValue.value[valueIndexToChangeRef.value];
      const hasChanged = nextValue !== prevValue;
      if (hasChanged) emits("valueCommit", toRaw(currentModelValue.value));
    }
    function updateValues(value, atIndex, { commit } = { commit: false }) {
      const decimalCount = getDecimalCount(step.value);
      const snapToStep = roundValue(Math.round((value - min.value) / step.value) * step.value + min.value, decimalCount);
      const nextValue = clamp(snapToStep, min.value, max.value);
      const nextValues = getNextSortedValues(currentModelValue.value, nextValue, atIndex);
      if (hasMinStepsBetweenValues(nextValues, minStepsBetweenThumbs.value * step.value)) {
        valueIndexToChangeRef.value = nextValues.indexOf(nextValue);
        const hasChanged = String(nextValues) !== String(modelValue.value);
        if (hasChanged && commit) emits("valueCommit", nextValues);
        if (hasChanged) {
          thumbElements.value[valueIndexToChangeRef.value]?.focus();
          modelValue.value = nextValues;
        }
      }
    }
    const thumbElements = ref([]);
    provideSliderRootContext({
      modelValue,
      currentModelValue,
      valueIndexToChangeRef,
      thumbElements,
      orientation,
      min,
      max,
      disabled,
      thumbAlignment
    });
    return (_ctx, _cache) => {
      return openBlock(), createBlock(unref(CollectionSlot), null, {
        default: withCtx(() => [(openBlock(), createBlock(resolveDynamicComponent(unref(orientation) === "horizontal" ? SliderHorizontal_default : SliderVertical_default), mergeProps(_ctx.$attrs, {
          ref: unref(forwardRef),
          "as-child": _ctx.asChild,
          as: _ctx.as,
          min: unref(min),
          max: unref(max),
          dir: unref(dir),
          inverted: _ctx.inverted,
          "aria-disabled": unref(disabled),
          "data-disabled": unref(disabled) ? "" : void 0,
          onPointerdown: _cache[0] || (_cache[0] = () => {
            if (!unref(disabled)) valuesBeforeSlideStartRef.value = currentModelValue.value;
          }),
          onSlideStart: _cache[1] || (_cache[1] = ($event) => !unref(disabled) && handleSlideStart($event)),
          onSlideMove: _cache[2] || (_cache[2] = ($event) => !unref(disabled) && handleSlideMove($event)),
          onSlideEnd: _cache[3] || (_cache[3] = ($event) => !unref(disabled) && handleSlideEnd()),
          onHomeKeyDown: _cache[4] || (_cache[4] = ($event) => !unref(disabled) && updateValues(unref(min), 0, { commit: true })),
          onEndKeyDown: _cache[5] || (_cache[5] = ($event) => !unref(disabled) && updateValues(unref(max), currentModelValue.value.length - 1, { commit: true })),
          onStepKeyDown: _cache[6] || (_cache[6] = (event, direction) => {
            if (!unref(disabled)) {
              const isPageKey = unref(PAGE_KEYS).includes(event.key);
              const isSkipKey = isPageKey || event.shiftKey && unref(ARROW_KEYS).includes(event.key);
              const multiplier = isSkipKey ? 10 : 1;
              const atIndex = valueIndexToChangeRef.value;
              const value = currentModelValue.value[atIndex];
              const stepInDirection = unref(step) * multiplier * direction;
              updateValues(value + stepInDirection, atIndex, { commit: true });
            }
          })
        }), {
          default: withCtx(() => [renderSlot(_ctx.$slots, "default", { modelValue: unref(modelValue) }), unref(isFormControl) && _ctx.name ? (openBlock(), createBlock(unref(VisuallyHiddenInput_default), {
            key: 0,
            type: "number",
            value: unref(modelValue),
            name: _ctx.name,
            required: _ctx.required,
            disabled: unref(disabled),
            step: unref(step)
          }, null, 8, [
            "value",
            "name",
            "required",
            "disabled",
            "step"
          ])) : createCommentVNode("v-if", true)]),
          _: 3
        }, 16, [
          "as-child",
          "as",
          "min",
          "max",
          "dir",
          "inverted",
          "aria-disabled",
          "data-disabled"
        ]))]),
        _: 3
      });
    };
  }
});
var SliderRoot_default = SliderRoot_vue_vue_type_script_setup_true_lang_default;
var SliderImpl_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "SliderImpl",
  props: {
    asChild: {
      type: Boolean,
      required: false
    },
    as: {
      type: null,
      required: false,
      default: "span"
    }
  },
  emits: [
    "slideStart",
    "slideMove",
    "slideEnd",
    "homeKeyDown",
    "endKeyDown",
    "stepKeyDown"
  ],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emits = __emit;
    const rootContext = injectSliderRootContext();
    return (_ctx, _cache) => {
      return openBlock(), createBlock(unref(Primitive), mergeProps({ "data-slider-impl": "" }, props, {
        onKeydown: _cache[0] || (_cache[0] = (event) => {
          if (event.key === "Home") {
            emits("homeKeyDown", event);
            event.preventDefault();
          } else if (event.key === "End") {
            emits("endKeyDown", event);
            event.preventDefault();
          } else if (unref(PAGE_KEYS).concat(unref(ARROW_KEYS)).includes(event.key)) {
            emits("stepKeyDown", event);
            event.preventDefault();
          }
        }),
        onPointerdown: _cache[1] || (_cache[1] = (event) => {
          const target = event.target;
          target.setPointerCapture(event.pointerId);
          event.preventDefault();
          if (unref(rootContext).thumbElements.value.includes(target)) target.focus();
          else emits("slideStart", event);
        }),
        onPointermove: _cache[2] || (_cache[2] = (event) => {
          const target = event.target;
          if (target.hasPointerCapture(event.pointerId)) emits("slideMove", event);
        }),
        onPointerup: _cache[3] || (_cache[3] = (event) => {
          const target = event.target;
          if (target.hasPointerCapture(event.pointerId)) {
            target.releasePointerCapture(event.pointerId);
            emits("slideEnd", event);
          }
        })
      }), {
        default: withCtx(() => [renderSlot(_ctx.$slots, "default")]),
        _: 3
      }, 16);
    };
  }
});
var SliderImpl_default = SliderImpl_vue_vue_type_script_setup_true_lang_default;
var SliderRange_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "SliderRange",
  props: {
    asChild: {
      type: Boolean,
      required: false
    },
    as: {
      type: null,
      required: false,
      default: "span"
    }
  },
  setup(__props) {
    const rootContext = injectSliderRootContext();
    const orientation = injectSliderOrientationContext();
    useForwardExpose();
    const percentages = computed(() => rootContext.currentModelValue.value.map((value) => convertValueToPercentage(value, rootContext.min.value, rootContext.max.value)));
    const offsetStart = computed(() => rootContext.currentModelValue.value.length > 1 ? Math.min(...percentages.value) : 0);
    const offsetEnd = computed(() => 100 - Math.max(...percentages.value, 0));
    return (_ctx, _cache) => {
      return openBlock(), createBlock(unref(Primitive), {
        "data-disabled": unref(rootContext).disabled.value ? "" : void 0,
        "data-orientation": unref(rootContext).orientation.value,
        "as-child": _ctx.asChild,
        as: _ctx.as,
        style: normalizeStyle({
          [unref(orientation).startEdge.value]: `${offsetStart.value}%`,
          [unref(orientation).endEdge.value]: `${offsetEnd.value}%`
        })
      }, {
        default: withCtx(() => [renderSlot(_ctx.$slots, "default")]),
        _: 3
      }, 8, [
        "data-disabled",
        "data-orientation",
        "as-child",
        "as",
        "style"
      ]);
    };
  }
});
var SliderRange_default = SliderRange_vue_vue_type_script_setup_true_lang_default;
var SliderThumbImpl_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  inheritAttrs: false,
  __name: "SliderThumbImpl",
  props: {
    index: {
      type: Number,
      required: true
    },
    asChild: {
      type: Boolean,
      required: false
    },
    as: {
      type: null,
      required: false
    }
  },
  setup(__props) {
    const props = __props;
    const rootContext = injectSliderRootContext();
    const orientation = injectSliderOrientationContext();
    const { forwardRef } = useForwardExpose();
    const { CollectionItem } = useCollection();
    const value = computed(() => rootContext.modelValue?.value?.[props.index]);
    const percent = computed(() => value.value === void 0 ? 0 : convertValueToPercentage(value.value, rootContext.min.value ?? 0, rootContext.max.value ?? 100));
    const label = computed(() => getLabel(props.index, rootContext.modelValue?.value?.length ?? 0));
    const size = useSize();
    const orientationSize = computed(() => size[orientation.size].value);
    const thumbInBoundsOffset = computed(() => {
      if (rootContext.thumbAlignment.value === "overflow" || !orientationSize.value) return 0;
      else return getThumbInBoundsOffset(orientationSize.value, percent.value, orientation.direction.value);
    });
    const isMounted = useMounted();
    return (_ctx, _cache) => {
      return openBlock(), createBlock(unref(CollectionItem), null, {
        default: withCtx(() => [createVNode(unref(Primitive), mergeProps(_ctx.$attrs, {
          ref: unref(forwardRef),
          role: "slider",
          tabindex: unref(rootContext).disabled.value ? void 0 : 0,
          "aria-label": _ctx.$attrs["aria-label"] || label.value,
          "data-disabled": unref(rootContext).disabled.value ? "" : void 0,
          "data-orientation": unref(rootContext).orientation.value,
          "aria-valuenow": value.value,
          "aria-valuemin": unref(rootContext).min.value,
          "aria-valuemax": unref(rootContext).max.value,
          "aria-orientation": unref(rootContext).orientation.value,
          "as-child": _ctx.asChild,
          as: _ctx.as,
          style: {
            transform: "var(--reka-slider-thumb-transform)",
            position: "absolute",
            [unref(orientation).startEdge.value]: `calc(${percent.value}% + ${thumbInBoundsOffset.value}px)`,
            display: !unref(isMounted) && value.value === void 0 ? "none" : void 0
          },
          onFocus: _cache[0] || (_cache[0] = () => {
            unref(rootContext).valueIndexToChangeRef.value = _ctx.index;
          })
        }), {
          default: withCtx(() => [renderSlot(_ctx.$slots, "default")]),
          _: 3
        }, 16, [
          "tabindex",
          "aria-label",
          "data-disabled",
          "data-orientation",
          "aria-valuenow",
          "aria-valuemin",
          "aria-valuemax",
          "aria-orientation",
          "as-child",
          "as",
          "style"
        ])]),
        _: 3
      });
    };
  }
});
var SliderThumbImpl_default = SliderThumbImpl_vue_vue_type_script_setup_true_lang_default;
var SliderThumb_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "SliderThumb",
  props: {
    asChild: {
      type: Boolean,
      required: false
    },
    as: {
      type: null,
      required: false,
      default: "span"
    }
  },
  setup(__props) {
    const props = __props;
    const { getItems } = useCollection();
    const { forwardRef, currentElement: thumbElement } = useForwardExpose();
    const index = computed(() => thumbElement.value ? getItems(true).findIndex((i) => i.ref === thumbElement.value) : -1);
    return (_ctx, _cache) => {
      return openBlock(), createBlock(SliderThumbImpl_default, mergeProps({ ref: unref(forwardRef) }, props, { index: index.value }), {
        default: withCtx(() => [renderSlot(_ctx.$slots, "default")]),
        _: 3
      }, 16, ["index"]);
    };
  }
});
var SliderThumb_default = SliderThumb_vue_vue_type_script_setup_true_lang_default;
var SliderTrack_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "SliderTrack",
  props: {
    asChild: {
      type: Boolean,
      required: false
    },
    as: {
      type: null,
      required: false,
      default: "span"
    }
  },
  setup(__props) {
    const rootContext = injectSliderRootContext();
    useForwardExpose();
    return (_ctx, _cache) => {
      return openBlock(), createBlock(unref(Primitive), {
        "as-child": _ctx.asChild,
        as: _ctx.as,
        "data-disabled": unref(rootContext).disabled.value ? "" : void 0,
        "data-orientation": unref(rootContext).orientation.value
      }, {
        default: withCtx(() => [renderSlot(_ctx.$slots, "default")]),
        _: 3
      }, 8, [
        "as-child",
        "as",
        "data-disabled",
        "data-orientation"
      ]);
    };
  }
});
var SliderTrack_default = SliderTrack_vue_vue_type_script_setup_true_lang_default;
var Label_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "Label",
  props: {
    for: {
      type: String,
      required: false
    },
    asChild: {
      type: Boolean,
      required: false
    },
    as: {
      type: null,
      required: false,
      default: "label"
    }
  },
  setup(__props) {
    const props = __props;
    useForwardExpose();
    return (_ctx, _cache) => {
      return openBlock(), createBlock(unref(Primitive), mergeProps(props, { onMousedown: _cache[0] || (_cache[0] = (event) => {
        if (!event.defaultPrevented && event.detail > 1) event.preventDefault();
      }) }), {
        default: withCtx(() => [renderSlot(_ctx.$slots, "default")]),
        _: 3
      }, 16);
    };
  }
});
var Label_default = Label_vue_vue_type_script_setup_true_lang_default;
const [injectSwitchRootContext, provideSwitchRootContext] = /* @__PURE__ */ createContext("SwitchRoot");
var SwitchRoot_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "SwitchRoot",
  props: {
    defaultValue: {
      type: null,
      required: false
    },
    modelValue: {
      type: null,
      required: false,
      default: void 0
    },
    disabled: {
      type: Boolean,
      required: false
    },
    id: {
      type: String,
      required: false
    },
    value: {
      type: String,
      required: false,
      default: "on"
    },
    trueValue: {
      type: null,
      required: false,
      default: () => true
    },
    falseValue: {
      type: null,
      required: false,
      default: () => false
    },
    asChild: {
      type: Boolean,
      required: false
    },
    as: {
      type: null,
      required: false,
      default: "button"
    },
    name: {
      type: String,
      required: false
    },
    required: {
      type: Boolean,
      required: false
    }
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const { disabled } = toRefs(props);
    const modelValue = useVModel(props, "modelValue", emit, {
      defaultValue: props.defaultValue ?? props.falseValue,
      passive: props.modelValue === void 0
    });
    const checked = computed(() => modelValue.value === props.trueValue);
    function toggleCheck() {
      if (disabled.value) return;
      modelValue.value = checked.value ? props.falseValue : props.trueValue;
    }
    const { forwardRef, currentElement } = useForwardExpose();
    const isFormControl = useFormControl(currentElement);
    const ariaLabel = computed(() => props.id && currentElement.value ? (void 0).querySelector(`[for="${props.id}"]`)?.innerText : void 0);
    provideSwitchRootContext({
      checked,
      toggleCheck,
      disabled
    });
    return (_ctx, _cache) => {
      return openBlock(), createBlock(unref(Primitive), mergeProps(_ctx.$attrs, {
        id: _ctx.id,
        ref: unref(forwardRef),
        role: "switch",
        type: _ctx.as === "button" ? "button" : void 0,
        value: _ctx.value,
        "aria-label": _ctx.$attrs["aria-label"] || ariaLabel.value,
        "aria-checked": checked.value,
        "aria-required": _ctx.required,
        "data-state": checked.value ? "checked" : "unchecked",
        "data-disabled": unref(disabled) ? "" : void 0,
        "as-child": _ctx.asChild,
        as: _ctx.as,
        disabled: unref(disabled),
        onClick: toggleCheck,
        onKeydown: withKeys(withModifiers(toggleCheck, ["prevent"]), ["enter"])
      }), {
        default: withCtx(() => [renderSlot(_ctx.$slots, "default", {
          modelValue: unref(modelValue),
          checked: checked.value
        }), unref(isFormControl) && _ctx.name ? (openBlock(), createBlock(unref(VisuallyHiddenInput_default), {
          key: 0,
          type: "checkbox",
          name: _ctx.name,
          disabled: unref(disabled),
          required: _ctx.required,
          value: _ctx.value,
          checked: checked.value
        }, null, 8, [
          "name",
          "disabled",
          "required",
          "value",
          "checked"
        ])) : createCommentVNode("v-if", true)]),
        _: 3
      }, 16, [
        "id",
        "type",
        "value",
        "aria-label",
        "aria-checked",
        "aria-required",
        "data-state",
        "data-disabled",
        "as-child",
        "as",
        "disabled",
        "onKeydown"
      ]);
    };
  }
});
var SwitchRoot_default = SwitchRoot_vue_vue_type_script_setup_true_lang_default;
var SwitchThumb_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "SwitchThumb",
  props: {
    asChild: {
      type: Boolean,
      required: false
    },
    as: {
      type: null,
      required: false,
      default: "span"
    }
  },
  setup(__props) {
    const rootContext = injectSwitchRootContext();
    useForwardExpose();
    return (_ctx, _cache) => {
      return openBlock(), createBlock(unref(Primitive), {
        "data-state": unref(rootContext).checked.value ? "checked" : "unchecked",
        "data-disabled": unref(rootContext).disabled.value ? "" : void 0,
        "as-child": _ctx.asChild,
        as: _ctx.as
      }, {
        default: withCtx(() => [renderSlot(_ctx.$slots, "default")]),
        _: 3
      }, 8, [
        "data-state",
        "data-disabled",
        "as-child",
        "as"
      ]);
    };
  }
});
var SwitchThumb_default = SwitchThumb_vue_vue_type_script_setup_true_lang_default;
var TooltipArrow_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "TooltipArrow",
  props: {
    width: {
      type: Number,
      required: false,
      default: 10
    },
    height: {
      type: Number,
      required: false,
      default: 5
    },
    asChild: {
      type: Boolean,
      required: false
    },
    as: {
      type: null,
      required: false,
      default: "svg"
    }
  },
  setup(__props) {
    const props = __props;
    useForwardExpose();
    return (_ctx, _cache) => {
      return openBlock(), createBlock(unref(PopperArrow_default), normalizeProps(guardReactiveProps(props)), {
        default: withCtx(() => [renderSlot(_ctx.$slots, "default")]),
        _: 3
      }, 16);
    };
  }
});
var TooltipArrow_default = TooltipArrow_vue_vue_type_script_setup_true_lang_default;
const TOOLTIP_OPEN = "tooltip.open";
const [injectTooltipRootContext, provideTooltipRootContext] = /* @__PURE__ */ createContext("TooltipRoot");
var TooltipRoot_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "TooltipRoot",
  props: {
    defaultOpen: {
      type: Boolean,
      required: false,
      default: false
    },
    open: {
      type: Boolean,
      required: false,
      default: void 0
    },
    delayDuration: {
      type: Number,
      required: false,
      default: void 0
    },
    disableHoverableContent: {
      type: Boolean,
      required: false,
      default: void 0
    },
    disableClosingTrigger: {
      type: Boolean,
      required: false,
      default: void 0
    },
    disabled: {
      type: Boolean,
      required: false,
      default: void 0
    },
    ignoreNonKeyboardFocus: {
      type: Boolean,
      required: false,
      default: void 0
    }
  },
  emits: ["update:open"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    useForwardExpose();
    const providerContext = injectTooltipProviderContext();
    const disableHoverableContent = computed(() => props.disableHoverableContent ?? providerContext.disableHoverableContent.value);
    const disableClosingTrigger = computed(() => props.disableClosingTrigger ?? providerContext.disableClosingTrigger.value);
    const disableTooltip = computed(() => props.disabled ?? providerContext.disabled.value);
    const delayDuration = computed(() => props.delayDuration ?? providerContext.delayDuration.value);
    const ignoreNonKeyboardFocus = computed(() => props.ignoreNonKeyboardFocus ?? providerContext.ignoreNonKeyboardFocus.value);
    const open = useVModel(props, "open", emit, {
      defaultValue: props.defaultOpen,
      passive: props.open === void 0
    });
    watch(open, (isOpen) => {
      if (!providerContext.onClose) return;
      if (isOpen) {
        providerContext.onOpen();
        (void 0).dispatchEvent(new CustomEvent(TOOLTIP_OPEN));
      } else providerContext.onClose();
    });
    const wasOpenDelayedRef = ref(false);
    const trigger = ref();
    const stateAttribute = computed(() => {
      if (!open.value) return "closed";
      return wasOpenDelayedRef.value ? "delayed-open" : "instant-open";
    });
    const { start: startTimer, stop: clearTimer } = useTimeoutFn(() => {
      wasOpenDelayedRef.value = true;
      open.value = true;
    }, delayDuration, { immediate: false });
    function handleOpen() {
      clearTimer();
      wasOpenDelayedRef.value = false;
      open.value = true;
    }
    function handleClose() {
      clearTimer();
      open.value = false;
    }
    function handleDelayedOpen() {
      startTimer();
    }
    provideTooltipRootContext({
      contentId: "",
      open,
      stateAttribute,
      trigger,
      onTriggerChange(el) {
        trigger.value = el;
      },
      onTriggerEnter() {
        if (providerContext.isOpenDelayed.value) handleDelayedOpen();
        else handleOpen();
      },
      onTriggerLeave() {
        if (disableHoverableContent.value) handleClose();
        else clearTimer();
      },
      onOpen: handleOpen,
      onClose: handleClose,
      disableHoverableContent,
      disableClosingTrigger,
      disabled: disableTooltip,
      ignoreNonKeyboardFocus
    });
    return (_ctx, _cache) => {
      return openBlock(), createBlock(unref(PopperRoot_default), null, {
        default: withCtx(() => [renderSlot(_ctx.$slots, "default", { open: unref(open) })]),
        _: 3
      });
    };
  }
});
var TooltipRoot_default = TooltipRoot_vue_vue_type_script_setup_true_lang_default;
var TooltipContentImpl_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "TooltipContentImpl",
  props: {
    ariaLabel: {
      type: String,
      required: false
    },
    asChild: {
      type: Boolean,
      required: false,
      default: void 0
    },
    as: {
      type: null,
      required: false
    },
    side: {
      type: null,
      required: false
    },
    sideOffset: {
      type: Number,
      required: false
    },
    align: {
      type: null,
      required: false
    },
    alignOffset: {
      type: Number,
      required: false
    },
    avoidCollisions: {
      type: Boolean,
      required: false,
      default: void 0
    },
    collisionBoundary: {
      type: null,
      required: false
    },
    collisionPadding: {
      type: [Number, Object],
      required: false
    },
    arrowPadding: {
      type: Number,
      required: false
    },
    sticky: {
      type: String,
      required: false
    },
    hideWhenDetached: {
      type: Boolean,
      required: false,
      default: void 0
    },
    positionStrategy: {
      type: String,
      required: false
    },
    updatePositionStrategy: {
      type: String,
      required: false
    }
  },
  emits: ["escapeKeyDown", "pointerDownOutside"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emits = __emit;
    const rootContext = injectTooltipRootContext();
    const providerContext = injectTooltipProviderContext();
    const { forwardRef, currentElement } = useForwardExpose();
    const ariaLabel = computed(() => props.ariaLabel || currentElement.value?.textContent);
    const popperContentProps = computed(() => {
      const { ariaLabel: _, ...restProps } = props;
      return defu(restProps, providerContext.content.value ?? {}, {
        side: "top",
        sideOffset: 0,
        align: "center",
        avoidCollisions: true,
        collisionBoundary: [],
        collisionPadding: 0,
        arrowPadding: 0,
        sticky: "partial",
        hideWhenDetached: false
      });
    });
    return (_ctx, _cache) => {
      return openBlock(), createBlock(unref(DismissableLayer_default), {
        "as-child": "",
        "disable-outside-pointer-events": false,
        onEscapeKeyDown: _cache[0] || (_cache[0] = ($event) => emits("escapeKeyDown", $event)),
        onPointerDownOutside: _cache[1] || (_cache[1] = (event) => {
          if (unref(rootContext).disableClosingTrigger.value && unref(rootContext).trigger.value?.contains(event.target)) event.preventDefault();
          emits("pointerDownOutside", event);
        }),
        onFocusOutside: _cache[2] || (_cache[2] = withModifiers(() => {
        }, ["prevent"])),
        onDismiss: _cache[3] || (_cache[3] = ($event) => unref(rootContext).onClose())
      }, {
        default: withCtx(() => [createVNode(unref(PopperContent_default), mergeProps({
          ref: unref(forwardRef),
          "data-state": unref(rootContext).stateAttribute.value
        }, {
          ..._ctx.$attrs,
          ...popperContentProps.value
        }, { style: {
          "--reka-tooltip-content-transform-origin": "var(--reka-popper-transform-origin)",
          "--reka-tooltip-content-available-width": "var(--reka-popper-available-width)",
          "--reka-tooltip-content-available-height": "var(--reka-popper-available-height)",
          "--reka-tooltip-trigger-width": "var(--reka-popper-anchor-width)",
          "--reka-tooltip-trigger-height": "var(--reka-popper-anchor-height)"
        } }), {
          default: withCtx(() => [renderSlot(_ctx.$slots, "default"), createVNode(unref(VisuallyHidden_default), {
            id: unref(rootContext).contentId,
            role: "tooltip"
          }, {
            default: withCtx(() => [createTextVNode(toDisplayString(ariaLabel.value), 1)]),
            _: 1
          }, 8, ["id"])]),
          _: 3
        }, 16, ["data-state"])]),
        _: 3
      });
    };
  }
});
var TooltipContentImpl_default = TooltipContentImpl_vue_vue_type_script_setup_true_lang_default;
var TooltipContentHoverable_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "TooltipContentHoverable",
  props: {
    ariaLabel: {
      type: String,
      required: false
    },
    asChild: {
      type: Boolean,
      required: false
    },
    as: {
      type: null,
      required: false
    },
    side: {
      type: null,
      required: false
    },
    sideOffset: {
      type: Number,
      required: false
    },
    align: {
      type: null,
      required: false
    },
    alignOffset: {
      type: Number,
      required: false
    },
    avoidCollisions: {
      type: Boolean,
      required: false
    },
    collisionBoundary: {
      type: null,
      required: false
    },
    collisionPadding: {
      type: [Number, Object],
      required: false
    },
    arrowPadding: {
      type: Number,
      required: false
    },
    sticky: {
      type: String,
      required: false
    },
    hideWhenDetached: {
      type: Boolean,
      required: false
    },
    positionStrategy: {
      type: String,
      required: false
    },
    updatePositionStrategy: {
      type: String,
      required: false
    }
  },
  setup(__props) {
    const props = __props;
    const forwardedProps = useForwardProps$1(props);
    const { forwardRef, currentElement } = useForwardExpose();
    const { trigger, onClose } = injectTooltipRootContext();
    const providerContext = injectTooltipProviderContext();
    const { isPointerInTransit, onPointerExit } = useGraceArea(trigger, currentElement);
    providerContext.isPointerInTransitRef = isPointerInTransit;
    onPointerExit(() => {
      onClose();
    });
    return (_ctx, _cache) => {
      return openBlock(), createBlock(TooltipContentImpl_default, mergeProps({ ref: unref(forwardRef) }, unref(forwardedProps)), {
        default: withCtx(() => [renderSlot(_ctx.$slots, "default")]),
        _: 3
      }, 16);
    };
  }
});
var TooltipContentHoverable_default = TooltipContentHoverable_vue_vue_type_script_setup_true_lang_default;
var TooltipContent_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "TooltipContent",
  props: {
    forceMount: {
      type: Boolean,
      required: false
    },
    ariaLabel: {
      type: String,
      required: false
    },
    asChild: {
      type: Boolean,
      required: false
    },
    as: {
      type: null,
      required: false
    },
    side: {
      type: null,
      required: false
    },
    sideOffset: {
      type: Number,
      required: false
    },
    align: {
      type: null,
      required: false
    },
    alignOffset: {
      type: Number,
      required: false
    },
    avoidCollisions: {
      type: Boolean,
      required: false
    },
    collisionBoundary: {
      type: null,
      required: false
    },
    collisionPadding: {
      type: [Number, Object],
      required: false
    },
    arrowPadding: {
      type: Number,
      required: false
    },
    sticky: {
      type: String,
      required: false
    },
    hideWhenDetached: {
      type: Boolean,
      required: false
    },
    positionStrategy: {
      type: String,
      required: false
    },
    updatePositionStrategy: {
      type: String,
      required: false
    }
  },
  emits: ["escapeKeyDown", "pointerDownOutside"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emits = __emit;
    const rootContext = injectTooltipRootContext();
    const forwarded = useForwardPropsEmits(props, emits);
    const { forwardRef } = useForwardExpose();
    return (_ctx, _cache) => {
      return openBlock(), createBlock(unref(Presence_default), { present: _ctx.forceMount || unref(rootContext).open.value }, {
        default: withCtx(() => [(openBlock(), createBlock(resolveDynamicComponent(unref(rootContext).disableHoverableContent.value ? TooltipContentImpl_default : TooltipContentHoverable_default), mergeProps({ ref: unref(forwardRef) }, unref(forwarded)), {
          default: withCtx(() => [renderSlot(_ctx.$slots, "default")]),
          _: 3
        }, 16))]),
        _: 3
      }, 8, ["present"]);
    };
  }
});
var TooltipContent_default = TooltipContent_vue_vue_type_script_setup_true_lang_default;
var TooltipPortal_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "TooltipPortal",
  props: {
    to: {
      type: null,
      required: false
    },
    disabled: {
      type: Boolean,
      required: false
    },
    defer: {
      type: Boolean,
      required: false
    },
    forceMount: {
      type: Boolean,
      required: false
    }
  },
  setup(__props) {
    const props = __props;
    return (_ctx, _cache) => {
      return openBlock(), createBlock(unref(Teleport_default), normalizeProps(guardReactiveProps(props)), {
        default: withCtx(() => [renderSlot(_ctx.$slots, "default")]),
        _: 3
      }, 16);
    };
  }
});
var TooltipPortal_default = TooltipPortal_vue_vue_type_script_setup_true_lang_default;
var TooltipTrigger_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "TooltipTrigger",
  props: {
    reference: {
      type: null,
      required: false
    },
    asChild: {
      type: Boolean,
      required: false
    },
    as: {
      type: null,
      required: false,
      default: "button"
    }
  },
  setup(__props) {
    const props = __props;
    const rootContext = injectTooltipRootContext();
    const providerContext = injectTooltipProviderContext();
    rootContext.contentId ||= useId$1(void 0, "reka-tooltip-content");
    const { forwardRef } = useForwardExpose();
    const isPointerDown = ref(false);
    const hasPointerMoveOpened = ref(false);
    const tooltipListeners = computed(() => {
      if (rootContext.disabled.value) return {};
      return {
        click: handleClick,
        focus: handleFocus,
        pointermove: handlePointerMove,
        pointerleave: handlePointerLeave,
        pointerdown: handlePointerDown,
        blur: handleBlur
      };
    });
    function handlePointerUp() {
      setTimeout(() => {
        isPointerDown.value = false;
      }, 1);
    }
    function handlePointerDown() {
      if (rootContext.open && !rootContext.disableClosingTrigger.value) rootContext.onClose();
      isPointerDown.value = true;
      (void 0).addEventListener("pointerup", handlePointerUp, { once: true });
    }
    function handlePointerMove(event) {
      if (event.pointerType === "touch") return;
      if (!hasPointerMoveOpened.value && !providerContext.isPointerInTransitRef.value) {
        rootContext.onTriggerEnter();
        hasPointerMoveOpened.value = true;
      }
    }
    function handlePointerLeave() {
      rootContext.onTriggerLeave();
      hasPointerMoveOpened.value = false;
    }
    function handleFocus(event) {
      if (isPointerDown.value) return;
      if (rootContext.ignoreNonKeyboardFocus.value && !event.target.matches?.(":focus-visible")) return;
      rootContext.onOpen();
    }
    function handleBlur() {
      rootContext.onClose();
    }
    function handleClick() {
      if (!rootContext.disableClosingTrigger.value) rootContext.onClose();
    }
    return (_ctx, _cache) => {
      return openBlock(), createBlock(unref(PopperAnchor_default), {
        "as-child": "",
        reference: _ctx.reference
      }, {
        default: withCtx(() => [createVNode(unref(Primitive), mergeProps({
          ref: unref(forwardRef),
          "aria-describedby": unref(rootContext).open.value ? unref(rootContext).contentId : void 0,
          "data-state": unref(rootContext).stateAttribute.value,
          as: _ctx.as,
          "as-child": props.asChild,
          "data-grace-area-trigger": ""
        }, toHandlers(tooltipListeners.value)), {
          default: withCtx(() => [renderSlot(_ctx.$slots, "default")]),
          _: 3
        }, 16, [
          "aria-describedby",
          "data-state",
          "as",
          "as-child"
        ])]),
        _: 3
      }, 8, ["reference"]);
    };
  }
});
var TooltipTrigger_default = TooltipTrigger_vue_vue_type_script_setup_true_lang_default;
const theme$3 = {
  "slots": {
    "root": "relative flex items-start",
    "base": [
      "inline-flex items-center shrink-0 rounded-full border-2 border-transparent focus-visible:outline-2 focus-visible:outline-offset-2 data-[state=unchecked]:bg-accented",
      "transition-[background] duration-200"
    ],
    "container": "flex items-center",
    "thumb": "group pointer-events-none rounded-full bg-default shadow-lg ring-0 transition-transform duration-200 data-[state=unchecked]:translate-x-0 data-[state=unchecked]:rtl:-translate-x-0 flex items-center justify-center",
    "icon": [
      "absolute shrink-0 group-data-[state=unchecked]:text-dimmed opacity-0 size-10/12",
      "transition-[color,opacity] duration-200"
    ],
    "wrapper": "ms-2",
    "label": "block font-medium text-default",
    "description": "text-muted"
  },
  "variants": {
    "color": {
      "primary": {
        "base": "data-[state=checked]:bg-primary focus-visible:outline-primary",
        "icon": "group-data-[state=checked]:text-primary"
      },
      "secondary": {
        "base": "data-[state=checked]:bg-secondary focus-visible:outline-secondary",
        "icon": "group-data-[state=checked]:text-secondary"
      },
      "success": {
        "base": "data-[state=checked]:bg-success focus-visible:outline-success",
        "icon": "group-data-[state=checked]:text-success"
      },
      "info": {
        "base": "data-[state=checked]:bg-info focus-visible:outline-info",
        "icon": "group-data-[state=checked]:text-info"
      },
      "warning": {
        "base": "data-[state=checked]:bg-warning focus-visible:outline-warning",
        "icon": "group-data-[state=checked]:text-warning"
      },
      "error": {
        "base": "data-[state=checked]:bg-error focus-visible:outline-error",
        "icon": "group-data-[state=checked]:text-error"
      },
      "neutral": {
        "base": "data-[state=checked]:bg-inverted focus-visible:outline-inverted",
        "icon": "group-data-[state=checked]:text-highlighted"
      }
    },
    "size": {
      "xs": {
        "base": "w-7",
        "container": "h-4",
        "thumb": "size-3 data-[state=checked]:translate-x-3 data-[state=checked]:rtl:-translate-x-3",
        "wrapper": "text-xs"
      },
      "sm": {
        "base": "w-8",
        "container": "h-4",
        "thumb": "size-3.5 data-[state=checked]:translate-x-3.5 data-[state=checked]:rtl:-translate-x-3.5",
        "wrapper": "text-xs"
      },
      "md": {
        "base": "w-9",
        "container": "h-5",
        "thumb": "size-4 data-[state=checked]:translate-x-4 data-[state=checked]:rtl:-translate-x-4",
        "wrapper": "text-sm"
      },
      "lg": {
        "base": "w-10",
        "container": "h-5",
        "thumb": "size-4.5 data-[state=checked]:translate-x-4.5 data-[state=checked]:rtl:-translate-x-4.5",
        "wrapper": "text-sm"
      },
      "xl": {
        "base": "w-11",
        "container": "h-6",
        "thumb": "size-5 data-[state=checked]:translate-x-5 data-[state=checked]:rtl:-translate-x-5",
        "wrapper": "text-base"
      }
    },
    "checked": {
      "true": {
        "icon": "group-data-[state=checked]:opacity-100"
      }
    },
    "unchecked": {
      "true": {
        "icon": "group-data-[state=unchecked]:opacity-100"
      }
    },
    "loading": {
      "true": {
        "icon": "animate-spin"
      }
    },
    "highlight": {
      "true": ""
    },
    "required": {
      "true": {
        "label": "after:content-['*'] after:ms-0.5 after:text-error"
      }
    },
    "disabled": {
      "true": {
        "root": "opacity-75",
        "base": "cursor-not-allowed",
        "label": "cursor-not-allowed",
        "description": "cursor-not-allowed"
      }
    }
  },
  "compoundVariants": [
    {
      "color": "primary",
      "highlight": true,
      "class": {
        "base": "ring ring-primary"
      }
    },
    {
      "color": "secondary",
      "highlight": true,
      "class": {
        "base": "ring ring-secondary"
      }
    },
    {
      "color": "success",
      "highlight": true,
      "class": {
        "base": "ring ring-success"
      }
    },
    {
      "color": "info",
      "highlight": true,
      "class": {
        "base": "ring ring-info"
      }
    },
    {
      "color": "warning",
      "highlight": true,
      "class": {
        "base": "ring ring-warning"
      }
    },
    {
      "color": "error",
      "highlight": true,
      "class": {
        "base": "ring ring-error"
      }
    },
    {
      "color": "neutral",
      "highlight": true,
      "class": {
        "base": "ring ring-inverted"
      }
    }
  ],
  "defaultVariants": {
    "color": "primary",
    "size": "md"
  }
};
const _sfc_main$4 = /* @__PURE__ */ Object.assign({ inheritAttrs: false }, {
  __name: "USwitch",
  __ssrInlineRender: true,
  props: {
    as: { type: null, required: false },
    color: { type: null, required: false },
    size: { type: null, required: false },
    highlight: { type: Boolean, required: false },
    loading: { type: Boolean, required: false },
    loadingIcon: { type: null, required: false },
    checkedIcon: { type: null, required: false },
    uncheckedIcon: { type: null, required: false },
    label: { type: String, required: false },
    description: { type: String, required: false },
    class: { type: null, required: false },
    ui: { type: Object, required: false },
    disabled: { type: Boolean, required: false },
    id: { type: String, required: false },
    name: { type: String, required: false },
    required: { type: Boolean, required: false },
    value: { type: String, required: false },
    defaultValue: { type: null, required: false },
    modelValue: { type: null, required: false },
    trueValue: { type: null, required: false },
    falseValue: { type: null, required: false }
  },
  emits: ["change", "update:modelValue"],
  setup(__props, { emit: __emit }) {
    const _props = __props;
    const slots = useSlots();
    const emits = __emit;
    const props = useComponentProps("switch", _props);
    const appConfig = useAppConfig();
    const rootProps = useForwardProps(reactivePick(props, "required", "value", "defaultValue", "modelValue", "trueValue", "falseValue"), emits);
    const { id: _id, emitFormChange, emitFormInput, size, color, highlight, name, disabled, ariaAttrs } = useFormField(_props);
    const id = _id.value ?? useId();
    const attrs = useAttrs();
    const forwardedAttrs = computed(() => {
      const { "data-state": _, ...rest } = attrs;
      return rest;
    });
    const ui = computed(() => tv({ extend: tv(theme$3), ...appConfig.ui?.switch || {} })({
      size: size.value ?? props.size,
      color: color.value ?? props.color,
      highlight: highlight.value ?? props.highlight,
      required: props.required,
      loading: props.loading,
      disabled: disabled.value || props.loading
    }));
    function onUpdate(value) {
      const event = new Event("change", { target: { value } });
      emits("change", event);
      emitFormChange();
      emitFormInput();
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(unref(Primitive), mergeProps({
        as: unref(props).as,
        "data-slot": "root",
        class: ui.value.root({ class: [unref(props).ui?.root, unref(props).class] })
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div data-slot="container" class="${ssrRenderClass(ui.value.container({ class: unref(props).ui?.container }))}"${_scopeId}>`);
            _push2(ssrRenderComponent(unref(SwitchRoot_default), mergeProps({ id: unref(id) }, { ...unref(rootProps), ...forwardedAttrs.value, ...unref(ariaAttrs) }, {
              name: unref(name),
              disabled: unref(disabled) || unref(props).loading,
              "data-slot": "base",
              class: ui.value.base({ class: unref(props).ui?.base }),
              "onUpdate:modelValue": onUpdate
            }), {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(unref(SwitchThumb_default), {
                    "data-slot": "thumb",
                    class: ui.value.thumb({ class: unref(props).ui?.thumb })
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        if (unref(props).loading) {
                          _push4(ssrRenderComponent(_sfc_main$d, {
                            name: unref(props).loadingIcon || unref(appConfig).ui.icons.loading,
                            "data-slot": "icon",
                            class: ui.value.icon({ class: unref(props).ui?.icon, checked: true, unchecked: true })
                          }, null, _parent4, _scopeId3));
                        } else {
                          _push4(`<!--[-->`);
                          if (unref(props).checkedIcon) {
                            _push4(ssrRenderComponent(_sfc_main$d, {
                              name: unref(props).checkedIcon,
                              "data-slot": "icon",
                              class: ui.value.icon({ class: unref(props).ui?.icon, checked: true })
                            }, null, _parent4, _scopeId3));
                          } else {
                            _push4(`<!---->`);
                          }
                          if (unref(props).uncheckedIcon) {
                            _push4(ssrRenderComponent(_sfc_main$d, {
                              name: unref(props).uncheckedIcon,
                              "data-slot": "icon",
                              class: ui.value.icon({ class: unref(props).ui?.icon, unchecked: true })
                            }, null, _parent4, _scopeId3));
                          } else {
                            _push4(`<!---->`);
                          }
                          _push4(`<!--]-->`);
                        }
                      } else {
                        return [
                          unref(props).loading ? (openBlock(), createBlock(_sfc_main$d, {
                            key: 0,
                            name: unref(props).loadingIcon || unref(appConfig).ui.icons.loading,
                            "data-slot": "icon",
                            class: ui.value.icon({ class: unref(props).ui?.icon, checked: true, unchecked: true })
                          }, null, 8, ["name", "class"])) : (openBlock(), createBlock(Fragment, { key: 1 }, [
                            unref(props).checkedIcon ? (openBlock(), createBlock(_sfc_main$d, {
                              key: 0,
                              name: unref(props).checkedIcon,
                              "data-slot": "icon",
                              class: ui.value.icon({ class: unref(props).ui?.icon, checked: true })
                            }, null, 8, ["name", "class"])) : createCommentVNode("", true),
                            unref(props).uncheckedIcon ? (openBlock(), createBlock(_sfc_main$d, {
                              key: 1,
                              name: unref(props).uncheckedIcon,
                              "data-slot": "icon",
                              class: ui.value.icon({ class: unref(props).ui?.icon, unchecked: true })
                            }, null, 8, ["name", "class"])) : createCommentVNode("", true)
                          ], 64))
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(unref(SwitchThumb_default), {
                      "data-slot": "thumb",
                      class: ui.value.thumb({ class: unref(props).ui?.thumb })
                    }, {
                      default: withCtx(() => [
                        unref(props).loading ? (openBlock(), createBlock(_sfc_main$d, {
                          key: 0,
                          name: unref(props).loadingIcon || unref(appConfig).ui.icons.loading,
                          "data-slot": "icon",
                          class: ui.value.icon({ class: unref(props).ui?.icon, checked: true, unchecked: true })
                        }, null, 8, ["name", "class"])) : (openBlock(), createBlock(Fragment, { key: 1 }, [
                          unref(props).checkedIcon ? (openBlock(), createBlock(_sfc_main$d, {
                            key: 0,
                            name: unref(props).checkedIcon,
                            "data-slot": "icon",
                            class: ui.value.icon({ class: unref(props).ui?.icon, checked: true })
                          }, null, 8, ["name", "class"])) : createCommentVNode("", true),
                          unref(props).uncheckedIcon ? (openBlock(), createBlock(_sfc_main$d, {
                            key: 1,
                            name: unref(props).uncheckedIcon,
                            "data-slot": "icon",
                            class: ui.value.icon({ class: unref(props).ui?.icon, unchecked: true })
                          }, null, 8, ["name", "class"])) : createCommentVNode("", true)
                        ], 64))
                      ]),
                      _: 1
                    }, 8, ["class"])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</div>`);
            if (unref(props).label || !!slots.label || (unref(props).description || !!slots.description)) {
              _push2(`<div data-slot="wrapper" class="${ssrRenderClass(ui.value.wrapper({ class: unref(props).ui?.wrapper }))}"${_scopeId}>`);
              if (unref(props).label || !!slots.label) {
                _push2(ssrRenderComponent(unref(Label_default), {
                  for: unref(id),
                  "data-slot": "label",
                  class: ui.value.label({ class: unref(props).ui?.label })
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      ssrRenderSlot(_ctx.$slots, "label", {
                        label: unref(props).label
                      }, () => {
                        _push3(`${ssrInterpolate(unref(props).label)}`);
                      }, _push3, _parent3, _scopeId2);
                    } else {
                      return [
                        renderSlot(_ctx.$slots, "label", {
                          label: unref(props).label
                        }, () => [
                          createTextVNode(toDisplayString(unref(props).label), 1)
                        ])
                      ];
                    }
                  }),
                  _: 3
                }, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              if (unref(props).description || !!slots.description) {
                _push2(`<p data-slot="description" class="${ssrRenderClass(ui.value.description({ class: unref(props).ui?.description }))}"${_scopeId}>`);
                ssrRenderSlot(_ctx.$slots, "description", {
                  description: unref(props).description
                }, () => {
                  _push2(`${ssrInterpolate(unref(props).description)}`);
                }, _push2, _parent2, _scopeId);
                _push2(`</p>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div>`);
            } else {
              _push2(`<!---->`);
            }
          } else {
            return [
              createVNode("div", {
                "data-slot": "container",
                class: ui.value.container({ class: unref(props).ui?.container })
              }, [
                createVNode(unref(SwitchRoot_default), mergeProps({ id: unref(id) }, { ...unref(rootProps), ...forwardedAttrs.value, ...unref(ariaAttrs) }, {
                  name: unref(name),
                  disabled: unref(disabled) || unref(props).loading,
                  "data-slot": "base",
                  class: ui.value.base({ class: unref(props).ui?.base }),
                  "onUpdate:modelValue": onUpdate
                }), {
                  default: withCtx(() => [
                    createVNode(unref(SwitchThumb_default), {
                      "data-slot": "thumb",
                      class: ui.value.thumb({ class: unref(props).ui?.thumb })
                    }, {
                      default: withCtx(() => [
                        unref(props).loading ? (openBlock(), createBlock(_sfc_main$d, {
                          key: 0,
                          name: unref(props).loadingIcon || unref(appConfig).ui.icons.loading,
                          "data-slot": "icon",
                          class: ui.value.icon({ class: unref(props).ui?.icon, checked: true, unchecked: true })
                        }, null, 8, ["name", "class"])) : (openBlock(), createBlock(Fragment, { key: 1 }, [
                          unref(props).checkedIcon ? (openBlock(), createBlock(_sfc_main$d, {
                            key: 0,
                            name: unref(props).checkedIcon,
                            "data-slot": "icon",
                            class: ui.value.icon({ class: unref(props).ui?.icon, checked: true })
                          }, null, 8, ["name", "class"])) : createCommentVNode("", true),
                          unref(props).uncheckedIcon ? (openBlock(), createBlock(_sfc_main$d, {
                            key: 1,
                            name: unref(props).uncheckedIcon,
                            "data-slot": "icon",
                            class: ui.value.icon({ class: unref(props).ui?.icon, unchecked: true })
                          }, null, 8, ["name", "class"])) : createCommentVNode("", true)
                        ], 64))
                      ]),
                      _: 1
                    }, 8, ["class"])
                  ]),
                  _: 1
                }, 16, ["id", "name", "disabled", "class"])
              ], 2),
              unref(props).label || !!slots.label || (unref(props).description || !!slots.description) ? (openBlock(), createBlock("div", {
                key: 0,
                "data-slot": "wrapper",
                class: ui.value.wrapper({ class: unref(props).ui?.wrapper })
              }, [
                unref(props).label || !!slots.label ? (openBlock(), createBlock(unref(Label_default), {
                  key: 0,
                  for: unref(id),
                  "data-slot": "label",
                  class: ui.value.label({ class: unref(props).ui?.label })
                }, {
                  default: withCtx(() => [
                    renderSlot(_ctx.$slots, "label", {
                      label: unref(props).label
                    }, () => [
                      createTextVNode(toDisplayString(unref(props).label), 1)
                    ])
                  ]),
                  _: 3
                }, 8, ["for", "class"])) : createCommentVNode("", true),
                unref(props).description || !!slots.description ? (openBlock(), createBlock("p", {
                  key: 1,
                  "data-slot": "description",
                  class: ui.value.description({ class: unref(props).ui?.description })
                }, [
                  renderSlot(_ctx.$slots, "description", {
                    description: unref(props).description
                  }, () => [
                    createTextVNode(toDisplayString(unref(props).description), 1)
                  ])
                ], 2)) : createCommentVNode("", true)
              ], 2)) : createCommentVNode("", true)
            ];
          }
        }),
        _: 3
      }, _parent));
    };
  }
});
const _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/@nuxt/ui/dist/runtime/components/Switch.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
const useColorMode = () => {
  return useState("color-mode").value;
};
const _sfc_main$3 = /* @__PURE__ */ Object.assign({ inheritAttrs: false }, {
  __name: "UColorModeSwitch",
  __ssrInlineRender: true,
  props: {
    as: { type: null, required: false },
    color: { type: null, required: false },
    size: { type: null, required: false },
    highlight: { type: Boolean, required: false },
    loading: { type: Boolean, required: false },
    loadingIcon: { type: null, required: false },
    label: { type: String, required: false },
    description: { type: String, required: false },
    class: { type: null, required: false },
    ui: { type: Object, required: false },
    disabled: { type: Boolean, required: false },
    id: { type: String, required: false },
    name: { type: String, required: false },
    required: { type: Boolean, required: false },
    value: { type: String, required: false },
    defaultValue: { type: null, required: false },
    trueValue: { type: null, required: false },
    falseValue: { type: null, required: false }
  },
  setup(__props) {
    const props = __props;
    const { t } = useLocale();
    const colorMode = useColorMode();
    const appConfig = useAppConfig();
    const switchProps = useForwardProps$1(props);
    const isDark = computed({
      get() {
        return colorMode.value === "dark";
      },
      set(_isDark) {
        colorMode.preference = _isDark ? "dark" : "light";
      }
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_ClientOnly = __nuxt_component_0$2;
      if (!unref(colorMode)?.forced) {
        _push(ssrRenderComponent(_component_ClientOnly, _attrs, {
          fallback: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_sfc_main$4, mergeProps({
                "checked-icon": unref(appConfig).ui.icons.dark,
                "unchecked-icon": unref(appConfig).ui.icons.light
              }, {
                ...unref(switchProps),
                "aria-label": isDark.value ? unref(t)("colorMode.switchToLight") : unref(t)("colorMode.switchToDark"),
                ..._ctx.$attrs
              }, { disabled: "" }), null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_sfc_main$4, mergeProps({
                  "checked-icon": unref(appConfig).ui.icons.dark,
                  "unchecked-icon": unref(appConfig).ui.icons.light
                }, {
                  ...unref(switchProps),
                  "aria-label": isDark.value ? unref(t)("colorMode.switchToLight") : unref(t)("colorMode.switchToDark"),
                  ..._ctx.$attrs
                }, { disabled: "" }), null, 16, ["checked-icon", "unchecked-icon"])
              ];
            }
          })
        }, _parent));
      } else {
        _push(`<!---->`);
      }
    };
  }
});
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/@nuxt/ui/dist/runtime/components/color-mode/ColorModeSwitch.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const kbdKeysMap = {
  meta: "",
  ctrl: "",
  alt: "",
  win: "⊞",
  command: "⌘",
  shift: "⇧",
  control: "⌃",
  option: "⌥",
  enter: "↵",
  delete: "⌦",
  backspace: "⌫",
  escape: "Esc",
  tab: "⇥",
  capslock: "⇪",
  arrowup: "↑",
  arrowright: "→",
  arrowdown: "↓",
  arrowleft: "←",
  pageup: "⇞",
  pagedown: "⇟",
  home: "↖",
  end: "↘"
};
const _useKbd = () => {
  const macOS = computed(() => false);
  const kbdKeysSpecificMap = reactive({
    meta: " ",
    alt: " ",
    ctrl: " "
  });
  function getKbdKey(value) {
    if (!value) {
      return;
    }
    if (["meta", "alt", "ctrl"].includes(value)) {
      return kbdKeysSpecificMap[value];
    }
    return kbdKeysMap[value] || value;
  }
  return {
    macOS,
    getKbdKey
  };
};
const useKbd = /* @__PURE__ */ createSharedComposable(_useKbd);
const theme$2 = {
  "base": "inline-flex items-center justify-center px-1 rounded-sm font-medium font-sans uppercase",
  "variants": {
    "color": {
      "primary": "",
      "secondary": "",
      "success": "",
      "info": "",
      "warning": "",
      "error": "",
      "neutral": ""
    },
    "variant": {
      "solid": "",
      "outline": "",
      "soft": "",
      "subtle": ""
    },
    "size": {
      "sm": "h-4 min-w-[16px] text-[10px]",
      "md": "h-5 min-w-[20px] text-[11px]",
      "lg": "h-6 min-w-[24px] text-[12px]"
    }
  },
  "compoundVariants": [
    {
      "color": "primary",
      "variant": "solid",
      "class": "text-inverted bg-primary"
    },
    {
      "color": "secondary",
      "variant": "solid",
      "class": "text-inverted bg-secondary"
    },
    {
      "color": "success",
      "variant": "solid",
      "class": "text-inverted bg-success"
    },
    {
      "color": "info",
      "variant": "solid",
      "class": "text-inverted bg-info"
    },
    {
      "color": "warning",
      "variant": "solid",
      "class": "text-inverted bg-warning"
    },
    {
      "color": "error",
      "variant": "solid",
      "class": "text-inverted bg-error"
    },
    {
      "color": "primary",
      "variant": "outline",
      "class": "ring ring-inset ring-primary/50 text-primary"
    },
    {
      "color": "secondary",
      "variant": "outline",
      "class": "ring ring-inset ring-secondary/50 text-secondary"
    },
    {
      "color": "success",
      "variant": "outline",
      "class": "ring ring-inset ring-success/50 text-success"
    },
    {
      "color": "info",
      "variant": "outline",
      "class": "ring ring-inset ring-info/50 text-info"
    },
    {
      "color": "warning",
      "variant": "outline",
      "class": "ring ring-inset ring-warning/50 text-warning"
    },
    {
      "color": "error",
      "variant": "outline",
      "class": "ring ring-inset ring-error/50 text-error"
    },
    {
      "color": "primary",
      "variant": "soft",
      "class": "text-primary bg-primary/10"
    },
    {
      "color": "secondary",
      "variant": "soft",
      "class": "text-secondary bg-secondary/10"
    },
    {
      "color": "success",
      "variant": "soft",
      "class": "text-success bg-success/10"
    },
    {
      "color": "info",
      "variant": "soft",
      "class": "text-info bg-info/10"
    },
    {
      "color": "warning",
      "variant": "soft",
      "class": "text-warning bg-warning/10"
    },
    {
      "color": "error",
      "variant": "soft",
      "class": "text-error bg-error/10"
    },
    {
      "color": "primary",
      "variant": "subtle",
      "class": "text-primary ring ring-inset ring-primary/25 bg-primary/10"
    },
    {
      "color": "secondary",
      "variant": "subtle",
      "class": "text-secondary ring ring-inset ring-secondary/25 bg-secondary/10"
    },
    {
      "color": "success",
      "variant": "subtle",
      "class": "text-success ring ring-inset ring-success/25 bg-success/10"
    },
    {
      "color": "info",
      "variant": "subtle",
      "class": "text-info ring ring-inset ring-info/25 bg-info/10"
    },
    {
      "color": "warning",
      "variant": "subtle",
      "class": "text-warning ring ring-inset ring-warning/25 bg-warning/10"
    },
    {
      "color": "error",
      "variant": "subtle",
      "class": "text-error ring ring-inset ring-error/25 bg-error/10"
    },
    {
      "color": "neutral",
      "variant": "solid",
      "class": "text-inverted bg-inverted"
    },
    {
      "color": "neutral",
      "variant": "outline",
      "class": "ring ring-inset ring-accented text-default bg-default"
    },
    {
      "color": "neutral",
      "variant": "soft",
      "class": "text-default bg-elevated"
    },
    {
      "color": "neutral",
      "variant": "subtle",
      "class": "ring ring-inset ring-accented text-default bg-elevated"
    }
  ],
  "defaultVariants": {
    "variant": "outline",
    "color": "neutral",
    "size": "md"
  }
};
const _sfc_main$2 = {
  __name: "UKbd",
  __ssrInlineRender: true,
  props: {
    as: { type: null, required: false, default: "kbd" },
    value: { type: null, required: false },
    color: { type: null, required: false },
    variant: { type: null, required: false },
    size: { type: null, required: false },
    class: { type: null, required: false },
    ui: { type: Object, required: false }
  },
  setup(__props) {
    const _props = __props;
    const props = useComponentProps("kbd", _props);
    const { getKbdKey } = useKbd();
    const appConfig = useAppConfig();
    const ui = computed(() => tv({ extend: tv(theme$2), ...appConfig.ui?.kbd || {} }));
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(unref(Primitive), mergeProps({
        as: unref(props).as,
        class: ui.value({ class: [unref(props).ui?.base, unref(props).class], color: unref(props).color, variant: unref(props).variant, size: unref(props).size })
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            ssrRenderSlot(_ctx.$slots, "default", {}, () => {
              _push2(`${ssrInterpolate(unref(getKbdKey)(unref(props).value))}`);
            }, _push2, _parent2, _scopeId);
          } else {
            return [
              renderSlot(_ctx.$slots, "default", {}, () => [
                createTextVNode(toDisplayString(unref(getKbdKey)(unref(props).value)), 1)
              ])
            ];
          }
        }),
        _: 3
      }, _parent));
    };
  }
};
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/@nuxt/ui/dist/runtime/components/Kbd.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const theme$1 = {
  "slots": {
    "content": "flex items-center gap-1 bg-default text-highlighted shadow-sm rounded-sm ring ring-default h-6 px-2.5 py-1 text-xs select-none data-[state=delayed-open]:animate-[scale-in_100ms_ease-out] data-[state=closed]:animate-[scale-out_100ms_ease-in] origin-(--reka-tooltip-content-transform-origin) pointer-events-auto",
    "arrow": "fill-bg stroke-default",
    "text": "truncate",
    "kbds": "hidden lg:inline-flex items-center shrink-0 gap-0.5 not-first-of-type:before:content-['·'] not-first-of-type:before:me-0.5",
    "kbdsSize": "sm"
  }
};
const _sfc_main$1 = {
  __name: "UTooltip",
  __ssrInlineRender: true,
  props: {
    text: { type: String, required: false },
    kbds: { type: Array, required: false },
    content: { type: Object, required: false },
    arrow: { type: [Boolean, Object], required: false },
    portal: { type: [Boolean, String], required: false, skipCheck: true, default: true },
    reference: { type: null, required: false },
    class: { type: null, required: false },
    ui: { type: Object, required: false },
    defaultOpen: { type: Boolean, required: false },
    open: { type: Boolean, required: false },
    delayDuration: { type: Number, required: false },
    disableHoverableContent: { type: Boolean, required: false },
    disableClosingTrigger: { type: Boolean, required: false },
    disabled: { type: Boolean, required: false },
    ignoreNonKeyboardFocus: { type: Boolean, required: false }
  },
  emits: ["update:open"],
  setup(__props, { emit: __emit }) {
    const _props = __props;
    const emits = __emit;
    const slots = useSlots();
    const props = useComponentProps("tooltip", _props);
    const appConfig = useAppConfig();
    const providerContext = injectTooltipProviderContext();
    const rootProps = useForwardProps(reactivePick(props, "defaultOpen", "open", "delayDuration", "disableHoverableContent", "disableClosingTrigger", "ignoreNonKeyboardFocus"), emits);
    const portalProps = usePortal(toRef(() => props.portal));
    const contentProps = toRef(() => defu(props.content, providerContext.content.value, { side: "bottom", sideOffset: 8, collisionPadding: 8 }));
    const arrowProps = toRef(() => defu(props.arrow, { rounded: true }));
    const ui = computed(() => tv({ extend: tv(theme$1), ...appConfig.ui?.tooltip || {} })({
      side: contentProps.value.side
    }));
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(unref(TooltipRoot_default), mergeProps(unref(rootProps), {
        disabled: !(unref(props).text || unref(props).kbds?.length || !!slots.content) || unref(props).disabled
      }, _attrs), {
        default: withCtx(({ open }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (!!slots.default || !!unref(props).reference) {
              _push2(ssrRenderComponent(unref(TooltipTrigger_default), mergeProps(_ctx.$attrs, {
                "as-child": "",
                reference: unref(props).reference,
                class: unref(props).class
              }), {
                default: withCtx((_, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    ssrRenderSlot(_ctx.$slots, "default", { open }, null, _push3, _parent3, _scopeId2);
                  } else {
                    return [
                      renderSlot(_ctx.$slots, "default", { open })
                    ];
                  }
                }),
                _: 2
              }, _parent2, _scopeId));
            } else {
              _push2(`<!---->`);
            }
            _push2(ssrRenderComponent(unref(TooltipPortal_default), unref(portalProps), {
              default: withCtx((_, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(unref(FieldGroupReset), null, {
                    default: withCtx((_2, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(unref(TooltipContent_default), mergeProps(contentProps.value, {
                          "data-slot": "content",
                          class: ui.value.content({ class: [!slots.default && unref(props).class, unref(props).ui?.content] })
                        }), {
                          default: withCtx((_3, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              ssrRenderSlot(_ctx.$slots, "content", { ui: ui.value }, () => {
                                if (unref(props).text) {
                                  _push5(`<span data-slot="text" class="${ssrRenderClass(ui.value.text({ class: unref(props).ui?.text }))}"${_scopeId4}>${ssrInterpolate(unref(props).text)}</span>`);
                                } else {
                                  _push5(`<!---->`);
                                }
                                if (unref(props).kbds?.length) {
                                  _push5(`<span data-slot="kbds" class="${ssrRenderClass(ui.value.kbds({ class: unref(props).ui?.kbds }))}"${_scopeId4}><!--[-->`);
                                  ssrRenderList(unref(props).kbds, (kbd, index) => {
                                    _push5(ssrRenderComponent(_sfc_main$2, mergeProps({
                                      key: index,
                                      size: unref(props).ui?.kbdsSize || ui.value.kbdsSize()
                                    }, { ref_for: true }, typeof kbd === "string" ? { value: kbd } : kbd), null, _parent5, _scopeId4));
                                  });
                                  _push5(`<!--]--></span>`);
                                } else {
                                  _push5(`<!---->`);
                                }
                              }, _push5, _parent5, _scopeId4);
                              if (!!unref(props).arrow) {
                                _push5(ssrRenderComponent(unref(TooltipArrow_default), mergeProps(arrowProps.value, {
                                  "data-slot": "arrow",
                                  class: ui.value.arrow({ class: unref(props).ui?.arrow })
                                }), null, _parent5, _scopeId4));
                              } else {
                                _push5(`<!---->`);
                              }
                            } else {
                              return [
                                renderSlot(_ctx.$slots, "content", { ui: ui.value }, () => [
                                  unref(props).text ? (openBlock(), createBlock("span", {
                                    key: 0,
                                    "data-slot": "text",
                                    class: ui.value.text({ class: unref(props).ui?.text })
                                  }, toDisplayString(unref(props).text), 3)) : createCommentVNode("", true),
                                  unref(props).kbds?.length ? (openBlock(), createBlock("span", {
                                    key: 1,
                                    "data-slot": "kbds",
                                    class: ui.value.kbds({ class: unref(props).ui?.kbds })
                                  }, [
                                    (openBlock(true), createBlock(Fragment, null, renderList(unref(props).kbds, (kbd, index) => {
                                      return openBlock(), createBlock(_sfc_main$2, mergeProps({
                                        key: index,
                                        size: unref(props).ui?.kbdsSize || ui.value.kbdsSize()
                                      }, { ref_for: true }, typeof kbd === "string" ? { value: kbd } : kbd), null, 16, ["size"]);
                                    }), 128))
                                  ], 2)) : createCommentVNode("", true)
                                ]),
                                !!unref(props).arrow ? (openBlock(), createBlock(unref(TooltipArrow_default), mergeProps({ key: 0 }, arrowProps.value, {
                                  "data-slot": "arrow",
                                  class: ui.value.arrow({ class: unref(props).ui?.arrow })
                                }), null, 16, ["class"])) : createCommentVNode("", true)
                              ];
                            }
                          }),
                          _: 2
                        }, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(unref(TooltipContent_default), mergeProps(contentProps.value, {
                            "data-slot": "content",
                            class: ui.value.content({ class: [!slots.default && unref(props).class, unref(props).ui?.content] })
                          }), {
                            default: withCtx(() => [
                              renderSlot(_ctx.$slots, "content", { ui: ui.value }, () => [
                                unref(props).text ? (openBlock(), createBlock("span", {
                                  key: 0,
                                  "data-slot": "text",
                                  class: ui.value.text({ class: unref(props).ui?.text })
                                }, toDisplayString(unref(props).text), 3)) : createCommentVNode("", true),
                                unref(props).kbds?.length ? (openBlock(), createBlock("span", {
                                  key: 1,
                                  "data-slot": "kbds",
                                  class: ui.value.kbds({ class: unref(props).ui?.kbds })
                                }, [
                                  (openBlock(true), createBlock(Fragment, null, renderList(unref(props).kbds, (kbd, index) => {
                                    return openBlock(), createBlock(_sfc_main$2, mergeProps({
                                      key: index,
                                      size: unref(props).ui?.kbdsSize || ui.value.kbdsSize()
                                    }, { ref_for: true }, typeof kbd === "string" ? { value: kbd } : kbd), null, 16, ["size"]);
                                  }), 128))
                                ], 2)) : createCommentVNode("", true)
                              ]),
                              !!unref(props).arrow ? (openBlock(), createBlock(unref(TooltipArrow_default), mergeProps({ key: 0 }, arrowProps.value, {
                                "data-slot": "arrow",
                                class: ui.value.arrow({ class: unref(props).ui?.arrow })
                              }), null, 16, ["class"])) : createCommentVNode("", true)
                            ]),
                            _: 3
                          }, 16, ["class"])
                        ];
                      }
                    }),
                    _: 2
                  }, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(unref(FieldGroupReset), null, {
                      default: withCtx(() => [
                        createVNode(unref(TooltipContent_default), mergeProps(contentProps.value, {
                          "data-slot": "content",
                          class: ui.value.content({ class: [!slots.default && unref(props).class, unref(props).ui?.content] })
                        }), {
                          default: withCtx(() => [
                            renderSlot(_ctx.$slots, "content", { ui: ui.value }, () => [
                              unref(props).text ? (openBlock(), createBlock("span", {
                                key: 0,
                                "data-slot": "text",
                                class: ui.value.text({ class: unref(props).ui?.text })
                              }, toDisplayString(unref(props).text), 3)) : createCommentVNode("", true),
                              unref(props).kbds?.length ? (openBlock(), createBlock("span", {
                                key: 1,
                                "data-slot": "kbds",
                                class: ui.value.kbds({ class: unref(props).ui?.kbds })
                              }, [
                                (openBlock(true), createBlock(Fragment, null, renderList(unref(props).kbds, (kbd, index) => {
                                  return openBlock(), createBlock(_sfc_main$2, mergeProps({
                                    key: index,
                                    size: unref(props).ui?.kbdsSize || ui.value.kbdsSize()
                                  }, { ref_for: true }, typeof kbd === "string" ? { value: kbd } : kbd), null, 16, ["size"]);
                                }), 128))
                              ], 2)) : createCommentVNode("", true)
                            ]),
                            !!unref(props).arrow ? (openBlock(), createBlock(unref(TooltipArrow_default), mergeProps({ key: 0 }, arrowProps.value, {
                              "data-slot": "arrow",
                              class: ui.value.arrow({ class: unref(props).ui?.arrow })
                            }), null, 16, ["class"])) : createCommentVNode("", true)
                          ]),
                          _: 3
                        }, 16, ["class"])
                      ]),
                      _: 3
                    })
                  ];
                }
              }),
              _: 2
            }, _parent2, _scopeId));
          } else {
            return [
              !!slots.default || !!unref(props).reference ? (openBlock(), createBlock(unref(TooltipTrigger_default), mergeProps({ key: 0 }, _ctx.$attrs, {
                "as-child": "",
                reference: unref(props).reference,
                class: unref(props).class
              }), {
                default: withCtx(() => [
                  renderSlot(_ctx.$slots, "default", { open })
                ]),
                _: 2
              }, 1040, ["reference", "class"])) : createCommentVNode("", true),
              createVNode(unref(TooltipPortal_default), unref(portalProps), {
                default: withCtx(() => [
                  createVNode(unref(FieldGroupReset), null, {
                    default: withCtx(() => [
                      createVNode(unref(TooltipContent_default), mergeProps(contentProps.value, {
                        "data-slot": "content",
                        class: ui.value.content({ class: [!slots.default && unref(props).class, unref(props).ui?.content] })
                      }), {
                        default: withCtx(() => [
                          renderSlot(_ctx.$slots, "content", { ui: ui.value }, () => [
                            unref(props).text ? (openBlock(), createBlock("span", {
                              key: 0,
                              "data-slot": "text",
                              class: ui.value.text({ class: unref(props).ui?.text })
                            }, toDisplayString(unref(props).text), 3)) : createCommentVNode("", true),
                            unref(props).kbds?.length ? (openBlock(), createBlock("span", {
                              key: 1,
                              "data-slot": "kbds",
                              class: ui.value.kbds({ class: unref(props).ui?.kbds })
                            }, [
                              (openBlock(true), createBlock(Fragment, null, renderList(unref(props).kbds, (kbd, index) => {
                                return openBlock(), createBlock(_sfc_main$2, mergeProps({
                                  key: index,
                                  size: unref(props).ui?.kbdsSize || ui.value.kbdsSize()
                                }, { ref_for: true }, typeof kbd === "string" ? { value: kbd } : kbd), null, 16, ["size"]);
                              }), 128))
                            ], 2)) : createCommentVNode("", true)
                          ]),
                          !!unref(props).arrow ? (openBlock(), createBlock(unref(TooltipArrow_default), mergeProps({ key: 0 }, arrowProps.value, {
                            "data-slot": "arrow",
                            class: ui.value.arrow({ class: unref(props).ui?.arrow })
                          }), null, 16, ["class"])) : createCommentVNode("", true)
                        ]),
                        _: 3
                      }, 16, ["class"])
                    ]),
                    _: 3
                  })
                ]),
                _: 3
              }, 16)
            ];
          }
        }),
        _: 3
      }, _parent));
    };
  }
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/@nuxt/ui/dist/runtime/components/Tooltip.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const theme = {
  "slots": {
    "root": "relative flex items-center select-none touch-none",
    "track": "relative bg-accented overflow-hidden rounded-full grow",
    "range": "absolute rounded-full",
    "thumb": "rounded-full bg-default ring-2 focus-visible:outline-2 focus-visible:outline-offset-2"
  },
  "variants": {
    "color": {
      "primary": {
        "range": "bg-primary",
        "thumb": "ring-primary focus-visible:outline-primary/50"
      },
      "secondary": {
        "range": "bg-secondary",
        "thumb": "ring-secondary focus-visible:outline-secondary/50"
      },
      "success": {
        "range": "bg-success",
        "thumb": "ring-success focus-visible:outline-success/50"
      },
      "info": {
        "range": "bg-info",
        "thumb": "ring-info focus-visible:outline-info/50"
      },
      "warning": {
        "range": "bg-warning",
        "thumb": "ring-warning focus-visible:outline-warning/50"
      },
      "error": {
        "range": "bg-error",
        "thumb": "ring-error focus-visible:outline-error/50"
      },
      "neutral": {
        "range": "bg-inverted",
        "thumb": "ring-inverted focus-visible:outline-inverted/50"
      }
    },
    "size": {
      "xs": {
        "thumb": "size-3"
      },
      "sm": {
        "thumb": "size-3.5"
      },
      "md": {
        "thumb": "size-4"
      },
      "lg": {
        "thumb": "size-4.5"
      },
      "xl": {
        "thumb": "size-5"
      }
    },
    "orientation": {
      "horizontal": {
        "root": "w-full",
        "range": "h-full"
      },
      "vertical": {
        "root": "flex-col h-full",
        "range": "w-full"
      }
    },
    "disabled": {
      "true": {
        "root": "opacity-75 cursor-not-allowed"
      }
    }
  },
  "compoundVariants": [
    {
      "orientation": "horizontal",
      "size": "xs",
      "class": {
        "track": "h-[6px]"
      }
    },
    {
      "orientation": "horizontal",
      "size": "sm",
      "class": {
        "track": "h-[7px]"
      }
    },
    {
      "orientation": "horizontal",
      "size": "md",
      "class": {
        "track": "h-[8px]"
      }
    },
    {
      "orientation": "horizontal",
      "size": "lg",
      "class": {
        "track": "h-[9px]"
      }
    },
    {
      "orientation": "horizontal",
      "size": "xl",
      "class": {
        "track": "h-[10px]"
      }
    },
    {
      "orientation": "vertical",
      "size": "xs",
      "class": {
        "track": "w-[6px]"
      }
    },
    {
      "orientation": "vertical",
      "size": "sm",
      "class": {
        "track": "w-[7px]"
      }
    },
    {
      "orientation": "vertical",
      "size": "md",
      "class": {
        "track": "w-[8px]"
      }
    },
    {
      "orientation": "vertical",
      "size": "lg",
      "class": {
        "track": "w-[9px]"
      }
    },
    {
      "orientation": "vertical",
      "size": "xl",
      "class": {
        "track": "w-[10px]"
      }
    }
  ],
  "defaultVariants": {
    "size": "md",
    "color": "primary"
  }
};
const _sfc_main = {
  __name: "USlider",
  __ssrInlineRender: true,
  props: /* @__PURE__ */ mergeModels({
    as: { type: null, required: false },
    size: { type: null, required: false },
    color: { type: null, required: false },
    orientation: { type: null, required: false, default: "horizontal" },
    tooltip: { type: [Boolean, Object], required: false },
    defaultValue: { type: [Number, Array], required: false },
    class: { type: null, required: false },
    ui: { type: Object, required: false },
    name: { type: String, required: false },
    disabled: { type: Boolean, required: false },
    inverted: { type: Boolean, required: false },
    min: { type: Number, required: false, default: 0 },
    max: { type: Number, required: false, default: 100 },
    step: { type: Number, required: false, default: 1 },
    minStepsBetweenThumbs: { type: Number, required: false }
  }, {
    "modelValue": { type: null },
    "modelModifiers": {}
  }),
  emits: /* @__PURE__ */ mergeModels(["change"], ["update:modelValue"]),
  setup(__props, { emit: __emit }) {
    const _props = __props;
    const emits = __emit;
    const props = useComponentProps("slider", _props);
    const modelValue = useModel(__props, "modelValue");
    const appConfig = useAppConfig();
    const rootProps = useForwardProps(reactivePick(props, "as", "orientation", "min", "max", "step", "minStepsBetweenThumbs", "inverted"), emits);
    const { id, emitFormChange, emitFormInput, size, color, name, disabled, ariaAttrs } = useFormField(_props);
    const defaultSliderValue = computed(() => {
      if (typeof props.defaultValue === "number") {
        return [props.defaultValue];
      }
      return props.defaultValue;
    });
    const sliderValue = computed({
      get() {
        if (typeof modelValue.value === "number") {
          return [modelValue.value];
        }
        return modelValue.value ?? defaultSliderValue.value;
      },
      set(value) {
        modelValue.value = value?.length !== 1 ? value : value[0];
      }
    });
    const thumbs = computed(() => sliderValue.value?.length ?? 1);
    const ui = computed(() => tv({ extend: tv(theme), ...appConfig.ui?.slider || {} })({
      disabled: disabled.value,
      size: size.value ?? props.size,
      color: color.value ?? props.color,
      orientation: props.orientation
    }));
    function onChange(value) {
      const event = new Event("change", { target: { value } });
      emits("change", event);
      emitFormChange();
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(unref(SliderRoot_default), mergeProps({ ...unref(rootProps), ...unref(ariaAttrs) }, {
        id: unref(id),
        modelValue: sliderValue.value,
        "onUpdate:modelValue": [($event) => sliderValue.value = $event, ($event) => unref(emitFormInput)()],
        name: unref(name),
        disabled: unref(disabled),
        "data-slot": "root",
        class: ui.value.root({ class: [unref(props).ui?.root, unref(props).class] }),
        "default-value": defaultSliderValue.value,
        onValueCommit: onChange
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(unref(SliderTrack_default), {
              "data-slot": "track",
              class: ui.value.track({ class: unref(props).ui?.track })
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(unref(SliderRange_default), {
                    "data-slot": "range",
                    class: ui.value.range({ class: unref(props).ui?.range })
                  }, null, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(unref(SliderRange_default), {
                      "data-slot": "range",
                      class: ui.value.range({ class: unref(props).ui?.range })
                    }, null, 8, ["class"])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`<!--[-->`);
            ssrRenderList(thumbs.value, (thumb) => {
              _push2(`<!--[-->`);
              if (!!unref(props).tooltip) {
                _push2(ssrRenderComponent(_sfc_main$1, mergeProps({
                  text: thumbs.value > 1 ? String(sliderValue.value?.[thumb - 1]) : String(sliderValue.value),
                  "disable-closing-trigger": ""
                }, { ref_for: true }, typeof unref(props).tooltip === "object" ? unref(props).tooltip : {}), {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(ssrRenderComponent(unref(SliderThumb_default), {
                        "data-slot": "thumb",
                        class: ui.value.thumb({ class: unref(props).ui?.thumb }),
                        "aria-label": thumbs.value === 1 ? "Thumb" : `Thumb ${thumb} of ${thumbs.value}`
                      }, null, _parent3, _scopeId2));
                    } else {
                      return [
                        createVNode(unref(SliderThumb_default), {
                          "data-slot": "thumb",
                          class: ui.value.thumb({ class: unref(props).ui?.thumb }),
                          "aria-label": thumbs.value === 1 ? "Thumb" : `Thumb ${thumb} of ${thumbs.value}`
                        }, null, 8, ["class", "aria-label"])
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
              } else {
                _push2(ssrRenderComponent(unref(SliderThumb_default), {
                  "data-slot": "thumb",
                  class: ui.value.thumb({ class: unref(props).ui?.thumb }),
                  "aria-label": thumbs.value === 1 ? "Thumb" : `Thumb ${thumb} of ${thumbs.value}`
                }, null, _parent2, _scopeId));
              }
              _push2(`<!--]-->`);
            });
            _push2(`<!--]-->`);
          } else {
            return [
              createVNode(unref(SliderTrack_default), {
                "data-slot": "track",
                class: ui.value.track({ class: unref(props).ui?.track })
              }, {
                default: withCtx(() => [
                  createVNode(unref(SliderRange_default), {
                    "data-slot": "range",
                    class: ui.value.range({ class: unref(props).ui?.range })
                  }, null, 8, ["class"])
                ]),
                _: 1
              }, 8, ["class"]),
              (openBlock(true), createBlock(Fragment, null, renderList(thumbs.value, (thumb) => {
                return openBlock(), createBlock(Fragment, { key: thumb }, [
                  !!unref(props).tooltip ? (openBlock(), createBlock(_sfc_main$1, mergeProps({
                    key: 0,
                    text: thumbs.value > 1 ? String(sliderValue.value?.[thumb - 1]) : String(sliderValue.value),
                    "disable-closing-trigger": ""
                  }, { ref_for: true }, typeof unref(props).tooltip === "object" ? unref(props).tooltip : {}), {
                    default: withCtx(() => [
                      createVNode(unref(SliderThumb_default), {
                        "data-slot": "thumb",
                        class: ui.value.thumb({ class: unref(props).ui?.thumb }),
                        "aria-label": thumbs.value === 1 ? "Thumb" : `Thumb ${thumb} of ${thumbs.value}`
                      }, null, 8, ["class", "aria-label"])
                    ]),
                    _: 2
                  }, 1040, ["text"])) : (openBlock(), createBlock(unref(SliderThumb_default), {
                    key: 1,
                    "data-slot": "thumb",
                    class: ui.value.thumb({ class: unref(props).ui?.thumb }),
                    "aria-label": thumbs.value === 1 ? "Thumb" : `Thumb ${thumb} of ${thumbs.value}`
                  }, null, 8, ["class", "aria-label"]))
                ], 64);
              }), 128))
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/@nuxt/ui/dist/runtime/components/Slider.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const severityGuidanceByLevel = [
  {
    title: "No impact",
    text: "Your condition is not really limiting you or others right now."
  },
  {
    title: "Minimal impact",
    text: "You had symptoms, but they barely changed how you functioned today."
  },
  {
    title: "Very mild impact",
    text: "Symptoms were a small bother, but daily tasks stayed mostly on track."
  },
  {
    title: "Mild impact",
    text: "Your condition got in the way now and then, but you kept going."
  },
  {
    title: "Mild to moderate impact",
    text: "You had to slow down, rest, or change plans for part of the day."
  },
  {
    title: "Moderate impact",
    text: "Your condition affected you about half the day or clearly cut what you could do."
  },
  {
    title: "Moderate to significant impact",
    text: "Symptoms shaped much of your day — skipping tasks, leaving early, or needing extra rest."
  },
  {
    title: "Significant impact",
    text: "Your condition kept you from functioning normally for most of the day."
  },
  {
    title: "Severe impact",
    text: "Daily tasks were very hard today — frequent breaks, help, or major adjustments were needed."
  },
  {
    title: "Very severe impact",
    text: "You struggled to get through basic routines for most of the day."
  },
  {
    title: "Debilitating impact",
    text: "Symptoms largely shut down your day — little to no normal function."
  }
];
function getSeverityGuidance(value) {
  const level = Math.min(10, Math.max(0, Math.round(value)));
  return severityGuidanceByLevel[level] ?? severityGuidanceByLevel[5];
}
const severityQuickPresets = [
  { label: "Barely noticed", value: 1 },
  { label: "Manageable", value: 3 },
  { label: "Half my day", value: 5 },
  { label: "Most of my day", value: 7 },
  { label: "Worst lately", value: 9 }
];

export { _sfc_main as _, _sfc_main$3 as a, getSeverityGuidance as g, severityQuickPresets as s };
//# sourceMappingURL=severityGuidance-B5KujaLU.mjs.map
