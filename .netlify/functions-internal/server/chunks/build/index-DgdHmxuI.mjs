import { d as _export_sfc, e as _sfc_main$d, _ as __nuxt_component_0$1 } from './server.mjs';
import { g as getSeverityGuidance, a as _sfc_main$3, _ as _sfc_main$1, s as severityQuickPresets } from './severityGuidance-B5KujaLU.mjs';
import { u as useSupabaseAuth, m as mapEntryHistoryItem, b as useSymptomEntries, _ as _sfc_main$2, a as _sfc_main$2$1 } from './entryDisplay-DEuUZYtU.mjs';
import { _ as __nuxt_component_5 } from './StickyActionBar-DXZsYWQC.mjs';
import { defineComponent, ref, computed, shallowRef, watch, unref, withCtx, createTextVNode, openBlock, createBlock, createVNode, createCommentVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrRenderClass, ssrRenderAttr, ssrInterpolate, ssrRenderList, ssrIncludeBooleanAttr, ssrRenderStyle, ssrRenderDynamicModel } from 'vue/server-renderer';
import { CalendarDate, now, getLocalTimeZone, Time, today, toCalendarDateTime } from '@internationalized/date';
import { useRouter } from 'vue-router';
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
import './useSupabaseClient-K6OqxTB_.mjs';
import '@floating-ui/vue';
import '@supabase/supabase-js';
import 'aria-hidden';
import '@tanstack/vue-virtual';

function getTodayCalendarDate() {
  return today(getLocalTimeZone());
}
function getMinEntryCalendarDate() {
  return getTodayCalendarDate().subtract({ years: 50 });
}
function partsToLocalDateTimeString(calendarDate, time) {
  const year = calendarDate.year;
  const month = String(calendarDate.month).padStart(2, "0");
  const day = String(calendarDate.day).padStart(2, "0");
  const hour = String(time.hour).padStart(2, "0");
  const minute = String(time.minute).padStart(2, "0");
  return `${year}-${month}-${day}T${hour}:${minute}`;
}
function localDateTimeStringToParts(value) {
  const normalized = value || getMaxEntryDateTimeLocal();
  const [datePart, timePart = "12:00"] = normalized.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);
  return {
    calendarDate: new CalendarDate(year, month, day),
    time: new Time(hour, minute)
  };
}
function entryDateTimeFromParts(calendarDate, time) {
  return toCalendarDateTime(calendarDate, time, getLocalTimeZone());
}
function calendarDateToDateString(calendarDate) {
  return calendarDate.toString();
}
function coerceCalendarDate(value) {
  if (!value || typeof value !== "object") {
    return void 0;
  }
  if (value instanceof CalendarDate) {
    return value;
  }
  const candidate = value;
  if (typeof candidate.year === "number" && typeof candidate.month === "number" && typeof candidate.day === "number") {
    return new CalendarDate(candidate.year, candidate.month, candidate.day);
  }
  return void 0;
}
function formatPartsToTime24(hour12, minute, period) {
  let hour = Number(hour12);
  if (Number.isNaN(hour) || hour < 1 || hour > 12) {
    hour = 12;
  }
  const minuteNum = Number(minute);
  const minuteValue = String(
    Number.isNaN(minuteNum) ? 0 : Math.min(59, Math.max(0, minuteNum))
  ).padStart(2, "0");
  if (period === "AM") {
    if (hour === 12) {
      hour = 0;
    }
  } else if (hour !== 12) {
    hour += 12;
  }
  return `${String(hour).padStart(2, "0")}:${minuteValue}`;
}
function parseTime24ToParts(time24) {
  const [hour24Raw = "12", minuteRaw = "0"] = (time24 || "12:00").split(":");
  let hour24 = Number(hour24Raw);
  if (Number.isNaN(hour24)) {
    hour24 = 0;
  }
  const minuteNum = Number(minuteRaw);
  const minute = String(Number.isNaN(minuteNum) ? 0 : minuteNum).padStart(2, "0");
  const period = hour24 >= 12 ? "PM" : "AM";
  let hour12 = hour24 % 12;
  if (hour12 === 0) {
    hour12 = 12;
  }
  return {
    hour12: String(hour12),
    minute,
    period
  };
}
function clampTime24ToMax(time24, maxTime24) {
  return time24 > maxTime24 ? maxTime24 : time24;
}
function splitEntryDateTimeLocal(value) {
  const normalized = clampEntryDateTime(value || getMaxEntryDateTimeLocal());
  return {
    date: normalized.slice(0, 10),
    time: normalized.slice(11, 16)
  };
}
function getMaxEntryDateTimeLocal() {
  const current = now(getLocalTimeZone());
  return partsToLocalDateTimeString(
    new CalendarDate(current.year, current.month, current.day),
    new Time(current.hour, current.minute)
  );
}
function getMaxEntryDateLocal() {
  return getMaxEntryDateTimeLocal().slice(0, 10);
}
function getMaxEntryTimeLocal(dateValue) {
  if (dateValue === getMaxEntryDateLocal()) {
    return getMaxEntryDateTimeLocal().slice(11, 16);
  }
  return "23:59";
}
function clampEntryDateTime(value) {
  if (!value) {
    return getMaxEntryDateTimeLocal();
  }
  const { calendarDate, time } = localDateTimeStringToParts(value);
  const selected = entryDateTimeFromParts(calendarDate, time);
  if (selected.compare(now(getLocalTimeZone())) > 0) {
    return getMaxEntryDateTimeLocal();
  }
  return value;
}
function isFutureEntryDateTime(value) {
  if (!value) {
    return false;
  }
  const { calendarDate, time } = localDateTimeStringToParts(value);
  const selected = entryDateTimeFromParts(calendarDate, time);
  return selected.compare(now(getLocalTimeZone())) > 0;
}
function formatEntryDateTimePreview(value) {
  if (!value) {
    return "Select when this happened";
  }
  const { calendarDate, time } = localDateTimeStringToParts(value);
  const date = new Date(
    calendarDate.year,
    calendarDate.month - 1,
    calendarDate.day,
    time.hour,
    time.minute
  );
  return date.toLocaleString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}
const durationPresets = [
  { label: "15 min", value: "15 minutes" },
  { label: "30 min", value: "30 minutes" },
  { label: "1 hour", value: "1 hour" },
  { label: "2 hours", value: "2 hours" },
  { label: "4 hours", value: "4 hours" },
  { label: "All day", value: "All day" }
];
const stopActivityPresets = [
  { label: "No", value: "No - kept going" },
  { label: "Slowed down", value: "Slowed down but continued" },
  { label: "Had to rest", value: "Yes - had to rest or lie down" },
  { label: "Stopped work", value: "Yes - left work or stopped activity" },
  { label: "Cancelled plans", value: "Yes - cancelled plans or errands" }
];
const sleepLimitPresets = [
  { label: "Slept OK", value: "Sleep was mostly OK" },
  { label: "Wake-ups", value: "Woke up several times" },
  { label: "Hard to fall asleep", value: "Hard to fall asleep" },
  { label: "Barely slept", value: "Barely slept" },
  { label: "No useful rest", value: "No useful rest" }
];
const episodeTypePresets = [
  { label: "Panic", value: "Panic" },
  { label: "Nightmare", value: "Nightmare" },
  { label: "Flashback", value: "Flashback" },
  { label: "Isolation", value: "Isolation" },
  { label: "Irritability", value: "Irritability" }
];
function getEntryFieldPresets(fieldLabel) {
  switch (fieldLabel) {
    case "Duration":
    case "Episode duration":
      return durationPresets;
    case "Had to stop activity?":
      return stopActivityPresets;
    case "Kept you from sleeping?":
      return sleepLimitPresets;
    case "Episode type":
      return episodeTypePresets;
    default:
      return [];
  }
}
const conditionImageAssets = {
  mentalHealth: "/image/ptsd-mental-health.png",
  backJointPain: "/image/back-joint-pain.png",
  nerveRadiculopathy: "/image/nerve-radiculopathy.png",
  migraineHeadache: "/image/migraine-headache.png",
  gerdIbs: "/image/gerd-ibs.png",
  sleepIssues: "/image/sleep-issues.png"
};
const categoryImageMap = {
  "Mental Health": conditionImageAssets.mentalHealth,
  Neurological: conditionImageAssets.migraineHeadache,
  Sleep: conditionImageAssets.sleepIssues,
  "Back, Neck, and Joint": conditionImageAssets.backJointPain,
  Nerve: conditionImageAssets.nerveRadiculopathy,
  Digestive: conditionImageAssets.gerdIbs
};
const defaultConditionImage = conditionImageAssets.mentalHealth;
const conditionTitleImageOverrides = {
  "Sleep apnea": conditionImageAssets.sleepIssues
};
const carouselConditions = [
  {
    title: "PTSD / Mental Health",
    image: conditionImageAssets.mentalHealth
  },
  {
    title: "Back or Joint Pain",
    image: conditionImageAssets.backJointPain
  },
  {
    title: "Nerve / Radiculopathy",
    image: conditionImageAssets.nerveRadiculopathy
  },
  {
    title: "Migraine / Headache",
    image: conditionImageAssets.migraineHeadache
  },
  {
    title: "GERD / IBS",
    image: conditionImageAssets.gerdIbs
  },
  {
    title: "Sleep Issues",
    image: conditionImageAssets.sleepIssues
  }
];
function getConditionImage(title, category) {
  return conditionTitleImageOverrides[title] ?? categoryImageMap[category] ?? defaultConditionImage;
}
const submissionHighlightDurationMs = 1400;
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const {
      user,
      isAuthLoading,
      authError
    } = useSupabaseAuth();
    useRouter();
    const activeIndex = ref(0);
    const activeHistoryTab = ref("Entries");
    const isEntryOpen = ref(false);
    const isConditionPickerOpen = ref(false);
    const customConditionInput = ref("");
    const debouncedCustomConditionPreview = ref("");
    const isAuthPanelOpen = ref(false);
    const authMode = ref("login");
    const authName = ref("");
    const authEmail = ref("");
    const authPassword = ref("");
    const authConfirmPassword = ref("");
    const authMessage = ref("");
    const isAuthSubmitting = ref(false);
    const hasActiveDraft = ref(false);
    const entryStep = ref(0);
    const editingEntryId = ref(null);
    const editingEntryConditionLabel = ref(null);
    const severityValue = ref(5);
    const isEditingEntry = computed(() => Boolean(editingEntryId.value));
    const severityGuidance = computed(() => getSeverityGuidance(severityValue.value));
    const entryForm = ref({});
    const isSavingEntry = ref(false);
    const entryError = ref("");
    const isLoadingEntries = ref(false);
    const entriesError = ref("");
    const savedEntries = ref([]);
    const isExportingPdf = ref(false);
    const exportError = ref("");
    const transitionDirection = ref("next");
    const showInstallCard = ref(false);
    const installPlatform = ref("desktop");
    const deferredInstallPrompt = ref(null);
    const historyExpanded = ref(false);
    ref(null);
    ref(null);
    const isConditionScrolling = ref(false);
    const isSubmissionDropdownOpen = ref(false);
    const lastSeenSubmissionAt = ref("");
    const highlightedSubmissionId = ref(null);
    const searchQuery = ref("");
    const debouncedSearchQuery = ref("");
    const selectedSearchCondition = ref(null);
    const initialEntryDateTime = splitEntryDateTimeLocal(getMaxEntryDateTimeLocal());
    const initialEntryTimeParts = parseTime24ToParts(initialEntryDateTime.time);
    const entryCalendarDate = shallowRef(
      void 0
    );
    const entryTimeInput = ref(initialEntryDateTime.time);
    const entryTimeHour = ref(initialEntryTimeParts.hour12);
    const entryTimeMinute = ref(initialEntryTimeParts.minute);
    const entryTimePeriod = ref(initialEntryTimeParts.period);
    const entryPickerViewMonth = ref({
      year: (/* @__PURE__ */ new Date()).getFullYear(),
      month: (/* @__PURE__ */ new Date()).getMonth()
    });
    const entryHourOptions = Array.from({ length: 12 }, (_, index2) => String(index2 + 1));
    const entryMinuteOptions = Array.from({ length: 60 }, (_, index2) => String(index2).padStart(2, "0"));
    const entryPeriodOptions = ["AM", "PM"];
    const entryTimeSelectUi = {
      base: "w-full justify-center border-0 ring-0 shadow-none bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800",
      content: "bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-700",
      item: "dark:text-white"
    };
    const maxEntryTimeInput = computed(() => {
      if (!entryCalendarDate.value) {
        return "23:59";
      }
      return getMaxEntryTimeLocal(calendarDateToDateString(entryCalendarDate.value));
    });
    const entryDateTimePreview = computed(() => {
      return formatEntryDateTimePreview(entryForm.value.date_and_time || "");
    });
    const entryPickerMonthLabel = computed(() => {
      return new Date(entryPickerViewMonth.value.year, entryPickerViewMonth.value.month, 1).toLocaleString("en-US", {
        month: "long",
        year: "numeric"
      });
    });
    const canShowNextEntryPickerMonth = computed(() => {
      const now2 = /* @__PURE__ */ new Date();
      const view = entryPickerViewMonth.value;
      return view.year < now2.getFullYear() || view.year === now2.getFullYear() && view.month < now2.getMonth();
    });
    const entryPickerDays = computed(() => {
      const year = entryPickerViewMonth.value.year;
      const month = entryPickerViewMonth.value.month;
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const firstDay = new Date(year, month, 1).getDay();
      const mondayOffset = firstDay === 0 ? 6 : firstDay - 1;
      const selectedDate = coerceCalendarDate(entryCalendarDate.value);
      const days = [];
      for (let index2 = 0; index2 < mondayOffset; index2 += 1) {
        days.push({
          key: `entry-empty-${year}-${month}-${index2}`,
          dayNumber: 0,
          selectable: false,
          selected: false,
          label: "Empty calendar day"
        });
      }
      for (let dayNumber = 1; dayNumber <= daysInMonth; dayNumber += 1) {
        const calendarDate = new CalendarDate(year, month + 1, dayNumber);
        const minDate = getMinEntryCalendarDate();
        const maxDate = getTodayCalendarDate();
        const selectable = calendarDate.compare(minDate) >= 0 && calendarDate.compare(maxDate) <= 0;
        const selected = selectedDate ? selectedDate.year === calendarDate.year && selectedDate.month === calendarDate.month && selectedDate.day === calendarDate.day : false;
        days.push({
          key: `entry-${year}-${month}-${dayNumber}`,
          year,
          month,
          dayNumber,
          selectable,
          selected,
          label: new Date(year, month, dayNumber).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric"
          })
        });
      }
      return days;
    });
    const historyTabs = ["Entries", "Calendar"];
    const pendingDelete = ref(null);
    const isShareLinkOpen = ref(false);
    const shareLinkEntry = ref(null);
    const shareLinkLabel = ref("");
    const shareLinkCreatedUrl = ref("");
    const shareLinkCopied = ref(false);
    const shareLinkError = ref("");
    const isCreatingShareLink = ref(false);
    const conditions = [...carouselConditions];
    const conditionResultDefinitions = [
      {
        title: "Migraine",
        category: "Neurological",
        description: "Frequency, duration, severity, triggers, and daily impact."
      },
      {
        title: "Tension headaches",
        category: "Neurological",
        description: "Headache pattern, pain level, work impact, and medication use."
      },
      {
        title: "Vertigo / Dizziness",
        category: "Neurological",
        description: "Dizzy spells, falls, nausea, balance issues, and missed activity."
      },
      {
        title: "Seizures",
        category: "Neurological",
        description: "Episode timing, recovery, injuries, witnesses, and daily impact."
      },
      {
        title: "PTSD",
        category: "Mental Health",
        description: "Nightmares, flashbacks, panic, isolation, irritability, and missed work."
      },
      {
        title: "Anxiety",
        category: "Mental Health",
        description: "Triggers, panic symptoms, avoidance, sleep, and social impact."
      },
      {
        title: "Depression",
        category: "Mental Health",
        description: "Mood, motivation, hygiene, isolation, sleep, and daily functioning."
      },
      {
        title: "Panic attacks",
        category: "Mental Health",
        description: "Immediate episode logs for panic symptoms, duration, and recovery."
      },
      {
        title: "Insomnia / Sleep disturbances",
        category: "Sleep",
        description: "Hours slept, wake-ups, nightmares, fatigue, and next-day effects."
      },
      {
        title: "Lower back pain",
        category: "Back, Neck, and Joint",
        description: "Pain level, flare-ups, limits sitting, standing, walking, and lifting."
      },
      {
        title: "Neck pain",
        category: "Back, Neck, and Joint",
        description: "Range of motion, flare-ups, pain level, and activity limits."
      },
      {
        title: "Knee conditions",
        category: "Back, Neck, and Joint",
        description: "Pain, swelling, instability, walking limits, stairs, and missed activity."
      },
      {
        title: "Shoulder conditions",
        category: "Back, Neck, and Joint",
        description: "Pain, range of motion, lifting limits, sleep interruption, and flare-ups."
      },
      {
        title: "Arthritis",
        category: "Back, Neck, and Joint",
        description: "Joint pain, stiffness, flare-ups, movement limits, and medication use."
      },
      {
        title: "Radiculopathy",
        category: "Nerve",
        description: "Left/right symptoms, numbness, tingling, burning, weakness, and falls."
      },
      {
        title: "Sciatica",
        category: "Nerve",
        description: "Radiating pain, leg weakness, numbness, sitting limits, and flare-ups."
      },
      {
        title: "Peripheral neuropathy",
        category: "Nerve",
        description: "Numbness, tingling, burning, weakness, walking issues, and falls."
      },
      {
        title: "GERD",
        category: "Digestive",
        description: "Heartburn, regurgitation, medication, sleep interruption, and diet triggers."
      },
      {
        title: "IBS",
        category: "Digestive",
        description: "Pain, diarrhea, constipation, urgency, missed activity, and triggers."
      },
      {
        title: "Chronic diarrhea",
        category: "Digestive",
        description: "Frequency, urgency, dehydration, medication, and daily interruptions."
      },
      {
        title: "Constipation",
        category: "Digestive",
        description: "Frequency, pain, medication, diet triggers, and functional impact."
      },
      {
        title: "Asthma",
        category: "Respiratory",
        description: "Shortness of breath, rescue inhaler use, attacks, and triggers."
      },
      {
        title: "Sleep apnea",
        category: "Respiratory",
        description: "Sleep problems, fatigue, CPAP use, headaches, and daytime impact."
      },
      {
        title: "Sinusitis",
        category: "Respiratory",
        description: "Congestion, headaches, flare-ups, infections, medication, and missed activity."
      },
      {
        title: "Rhinitis",
        category: "Respiratory",
        description: "Congestion, runny nose, sneezing, breathing issues, and triggers."
      },
      {
        title: "Eczema",
        category: "Skin",
        description: "Area affected, itching, flare-ups, treatment, and photos later."
      },
      {
        title: "Psoriasis",
        category: "Skin",
        description: "Area affected, plaques, itching, flare-ups, treatment, and photos later."
      },
      {
        title: "Dermatitis",
        category: "Skin",
        description: "Rash location, itching, triggers, flare-ups, treatment, and photos later."
      },
      {
        title: "Fibromyalgia",
        category: "Chronic Pain / Fatigue",
        description: "Pain, fatigue, brain fog, flare-ups, and days unable to function normally."
      },
      {
        title: "Chronic fatigue",
        category: "Chronic Pain / Fatigue",
        description: "Fatigue level, brain fog, rest needs, and functional limitations."
      }
    ];
    const conditionResults = conditionResultDefinitions.map((condition) => ({
      ...condition,
      image: getConditionImage(condition.title, condition.category)
    }));
    const historyEntries = computed(() => {
      return savedEntries.value.map((entry) => mapEntryHistoryItem(entry));
    });
    const submissionNotifications = computed(() => {
      return savedEntries.value.map((entry) => {
        const entryDate = entry.occurred_at ? new Date(entry.occurred_at) : new Date(entry.created_at);
        return {
          id: entry.id,
          condition: entry.condition_label,
          source: entry.source === "family" ? "Family" : "Veteran",
          title: entry.summary || entry.condition_label,
          summary: entry.impact || "No impact note added",
          createdAt: entry.created_at || entry.occurred_at || "",
          timeLabel: entryDate.toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit"
          })
        };
      }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    });
    const unreadSubmissionCount = computed(() => {
      if (!lastSeenSubmissionAt.value) {
        return submissionNotifications.value.length;
      }
      const lastSeenTime = new Date(lastSeenSubmissionAt.value).getTime();
      return submissionNotifications.value.filter((submission) => {
        return new Date(submission.createdAt).getTime() > lastSeenTime;
      }).length;
    });
    const weekDays = ["M", "T", "W", "T", "F", "S", "S"];
    const historyViewMonth = ref({
      year: (/* @__PURE__ */ new Date()).getFullYear(),
      month: (/* @__PURE__ */ new Date()).getMonth()
    });
    const historyMonthLabel = computed(() => {
      return new Date(historyViewMonth.value.year, historyViewMonth.value.month, 1).toLocaleString("en-US", {
        month: "long",
        year: "numeric"
      });
    });
    const canShowNextHistoryMonth = computed(() => {
      const now2 = /* @__PURE__ */ new Date();
      const view = historyViewMonth.value;
      return view.year < now2.getFullYear() || view.year === now2.getFullYear() && view.month < now2.getMonth();
    });
    const calendarDays = computed(() => {
      const year = historyViewMonth.value.year;
      const month = historyViewMonth.value.month;
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const firstDay = new Date(year, month, 1).getDay();
      const mondayOffset = firstDay === 0 ? 6 : firstDay - 1;
      const days = [];
      for (let index2 = 0; index2 < mondayOffset; index2 += 1) {
        days.push({
          key: `empty-${index2}`,
          date: "",
          label: "Empty calendar day",
          currentMonth: false,
          entry: false
        });
      }
      for (let day = 1; day <= daysInMonth; day += 1) {
        const matchingEntries = savedEntries.value.filter((entry) => {
          const entryDate = entry.occurred_at ? new Date(entry.occurred_at) : new Date(entry.created_at);
          return entryDate.getFullYear() === year && entryDate.getMonth() === month && entryDate.getDate() === day;
        });
        const entryCount = matchingEntries.length;
        const severity = entryCount ? matchingEntries.reduce((highest, entry) => Math.max(highest, entry.severity ?? 0), 0) : null;
        days.push({
          key: `${year}-${month}-${day}`,
          date: day,
          label: new Date(year, month, day).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric"
          }),
          currentMonth: true,
          entry: entryCount > 0,
          entryCount,
          icon: severity !== null && severity >= 7 ? "i-lucide-frown" : severity !== null && severity >= 4 ? "i-lucide-meh" : "i-lucide-smile",
          color: severity !== null && severity >= 7 ? "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300" : severity !== null && severity >= 4 ? "bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-300" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
        });
      }
      return days;
    });
    const defaultEntryFields = [
      {
        label: "Date and time",
        type: "datetime",
        placeholder: ""
      },
      {
        label: "How bad was it?",
        type: "slider",
        placeholder: ""
      },
      {
        label: "What happened?",
        type: "textarea",
        placeholder: "Short note about the symptom, episode, or flare-up."
      },
      {
        label: "Daily impact",
        type: "textarea",
        placeholder: "Missed work, family activity, sleep, errands, walking, lifting, or other limits."
      }
    ];
    const durationField = {
      label: "Duration",
      type: "text",
      placeholder: "Example: 30 minutes, 4 hours, all day"
    };
    const episodeDurationField = {
      label: "Episode duration",
      type: "text",
      placeholder: "Example: 20 minutes, 2 hours, most of the day"
    };
    const stopActivityField = {
      label: "Had to stop activity?",
      type: "text",
      placeholder: "Lie down, leave work, cancel plans, or avoid movement?"
    };
    const sleepLimitField = {
      label: "Kept you from sleeping?",
      type: "text",
      placeholder: "Hard to fall asleep, stay asleep, or get useful rest?"
    };
    const episodeTypeField = {
      label: "Episode type",
      type: "text",
      placeholder: "Panic, nightmare, flashback, isolation, irritability..."
    };
    const conditionEpisodeConfig = {
      "Migraine / Headache": {
        duration: durationField
      },
      "PTSD / Mental Health": {
        duration: episodeDurationField,
        followUp: episodeTypeField
      },
      "Back or Joint Pain": {
        duration: durationField,
        followUp: stopActivityField
      },
      "Nerve / Radiculopathy": {
        duration: durationField,
        followUp: stopActivityField
      },
      "Sleep Issues": {
        duration: durationField,
        followUp: sleepLimitField
      }
    };
    function buildEntryFields(conditionTitle, extraFields = []) {
      const fields = [
        defaultEntryFields[0],
        defaultEntryFields[1]
      ];
      const episodeConfig = conditionEpisodeConfig[conditionTitle];
      if (episodeConfig) {
        fields.push({ ...episodeConfig.duration, stepRole: "duration" });
        if (episodeConfig.followUp) {
          fields.push({ ...episodeConfig.followUp, stepRole: "followUp" });
        }
      }
      fields.push(
        defaultEntryFields[2],
        defaultEntryFields[3],
        ...extraFields
      );
      return fields;
    }
    function isEpisodeDurationField(field) {
      return field.stepRole === "duration";
    }
    function isEpisodeFollowUpField(field) {
      return field.stepRole === "followUp";
    }
    const entryFieldsByCondition = {
      "PTSD / Mental Health": buildEntryFields("PTSD / Mental Health", [
        {
          label: "Safety note",
          type: "textarea",
          placeholder: "Optional: anything important to remember or discuss with care team."
        }
      ]),
      "Back or Joint Pain": buildEntryFields("Back or Joint Pain", [
        {
          label: "Movement limit",
          type: "text",
          placeholder: "Sitting, standing, walking, lifting, bending..."
        },
        {
          label: "Flare-up trigger",
          type: "text",
          placeholder: "Driving, stairs, lifting groceries, weather, unknown..."
        }
      ]),
      "Nerve / Radiculopathy": buildEntryFields("Nerve / Radiculopathy", [
        {
          label: "Side affected",
          type: "text",
          placeholder: "Left, right, both, arm, leg, foot..."
        },
        {
          label: "Nerve symptoms",
          type: "textarea",
          placeholder: "Numbness, tingling, burning, weakness, falls, radiating pain."
        }
      ]),
      "Migraine / Headache": buildEntryFields("Migraine / Headache"),
      "GERD / IBS": [
        ...defaultEntryFields,
        {
          label: "Digestive symptom",
          type: "text",
          placeholder: "Heartburn, regurgitation, diarrhea, constipation, urgency..."
        },
        {
          label: "Medication or food trigger",
          type: "text",
          placeholder: "Medication used, meal trigger, or unknown."
        }
      ],
      "Sleep Issues": buildEntryFields("Sleep Issues", [
        {
          label: "Hours slept",
          type: "number",
          placeholder: "Example: 4"
        },
        {
          label: "Sleep interruption",
          type: "textarea",
          placeholder: "Nightmares, wake-ups, pain, reflux, panic, breathing issues, fatigue."
        }
      ])
    };
    const totalSlides = computed(() => conditions.length + 1);
    const isSearchSlide = computed(() => activeIndex.value === 0);
    const activeCondition = computed(() => conditions[Math.max(activeIndex.value - 1, 0)]);
    const entryTitle = computed(() => {
      if (isConditionPickerOpen.value) {
        const previewName = debouncedCustomConditionPreview.value.trim();
        if (previewName) {
          return previewName;
        }
      }
      if (selectedSearchCondition.value) {
        return selectedSearchCondition.value.title;
      }
      const customName = entryForm.value.condition_name?.trim();
      if (customName) {
        return customName;
      }
      if (editingEntryConditionLabel.value) {
        return editingEntryConditionLabel.value;
      }
      if (isSearchSlide.value) {
        return "Custom condition";
      }
      return activeCondition.value.title;
    });
    const activeEntryImage = computed(() => {
      if (selectedSearchCondition.value?.image) {
        return selectedSearchCondition.value.image;
      }
      if (isSearchSlide.value) {
        return conditionImageAssets.mentalHealth;
      }
      return activeCondition.value.image;
    });
    const activeEntryFields = computed(() => {
      if (selectedSearchCondition.value) {
        return getEntryFieldsForSearchCondition(selectedSearchCondition.value);
      }
      const customName = entryForm.value.condition_name?.trim();
      if (customName) {
        return [
          {
            label: "Condition name",
            type: "text",
            placeholder: "Example: tinnitus, sinusitis, skin flare-up..."
          },
          ...defaultEntryFields
        ];
      }
      if (editingEntryConditionLabel.value) {
        return entryFieldsByCondition[editingEntryConditionLabel.value] || defaultEntryFields;
      }
      if (isSearchSlide.value) {
        return [
          {
            label: "Condition name",
            type: "text",
            placeholder: "Example: tinnitus, sinusitis, skin flare-up..."
          },
          ...defaultEntryFields
        ];
      }
      return entryFieldsByCondition[activeCondition.value.title] || defaultEntryFields;
    });
    const entrySteps = computed(() => {
      const fields = activeEntryFields.value;
      const steps = [];
      let index2 = 0;
      while (index2 < fields.length) {
        const field = fields[index2];
        if (field.type === "datetime" || field.type === "slider") {
          steps.push([field]);
          index2 += 1;
          continue;
        }
        if (isEpisodeDurationField(field)) {
          const nextField = fields[index2 + 1];
          if (nextField && isEpisodeFollowUpField(nextField)) {
            steps.push([field, nextField]);
            index2 += 2;
          } else {
            steps.push([field]);
            index2 += 1;
          }
          continue;
        }
        if (isEpisodeFollowUpField(field)) {
          steps.push([field]);
          index2 += 1;
          continue;
        }
        steps.push(fields.slice(index2, index2 + 2));
        index2 += 2;
      }
      return steps;
    });
    const currentEntryStepFields = computed(() => entrySteps.value[entryStep.value] || []);
    const isLastEntryStep = computed(() => entryStep.value >= entrySteps.value.length - 1);
    const entryProgressWidth = computed(() => {
      if (!entrySteps.value.length) {
        return "0%";
      }
      return `${(entryStep.value + 1) / entrySteps.value.length * 100}%`;
    });
    computed(() => {
      if (transitionDirection.value === "expand") {
        return "transition duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]";
      }
      return "transition duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]";
    });
    computed(() => {
      if (transitionDirection.value === "expand") {
        return "transition duration-0";
      }
      return "transition duration-300 ease-[cubic-bezier(0.55,0,1,0.45)]";
    });
    computed(() => {
      if (transitionDirection.value === "expand") {
        return "translate-y-0 opacity-100";
      }
      if (transitionDirection.value === "previous") {
        return "translate-x-8 opacity-0";
      }
      if (transitionDirection.value === "next") {
        return "-translate-x-8 opacity-0";
      }
      if (transitionDirection.value === "collapse") {
        return "-translate-y-3 opacity-0";
      }
      return "translate-y-3 opacity-0";
    });
    computed(() => {
      if (transitionDirection.value === "expand") {
        return "translate-y-0 opacity-0";
      }
      if (transitionDirection.value === "previous") {
        return "-translate-x-8 opacity-0";
      }
      if (transitionDirection.value === "next") {
        return "translate-x-8 opacity-0";
      }
      if (transitionDirection.value === "collapse") {
        return "translate-y-3 opacity-0";
      }
      return "-translate-y-3 opacity-0";
    });
    function filterConditionResults(query) {
      const normalized = query.trim().toLowerCase();
      if (!normalized) {
        return conditionResults;
      }
      return conditionResults.filter((condition) => {
        const searchableText = [
          condition.title,
          condition.category,
          condition.description
        ].join(" ").toLowerCase();
        return searchableText.includes(normalized);
      });
    }
    const filteredConditionResults = computed(() => filterConditionResults(debouncedSearchQuery.value));
    const hasConditionSearch = computed(() => debouncedSearchQuery.value.trim().length > 0);
    const showConditionSearchEmptyState = computed(
      () => hasConditionSearch.value && filteredConditionResults.value.length === 0
    );
    const filteredPickerConditionResults = computed(() => filterConditionResults(debouncedCustomConditionPreview.value));
    const hasCustomConditionSearch = computed(() => debouncedCustomConditionPreview.value.trim().length > 0);
    const showCustomConditionEmptyState = computed(
      () => hasCustomConditionSearch.value && filteredPickerConditionResults.value.length === 0
    );
    const canPromptInstall = computed(() => Boolean(deferredInstallPrompt.value));
    const installInstructionText = computed(() => {
      if (installPlatform.value === "ios") {
        return "On iPhone: open this in Safari, tap the Share button, then tap Add to Home Screen.";
      }
      if (installPlatform.value === "android") {
        return canPromptInstall.value ? "On Android: tap Install app, or use Chrome menu > Add to Home screen." : "On Android: open Chrome menu, then tap Add to Home screen or Install app.";
      }
      return "Open this link on your phone, then add it to your home screen for the app-like experience.";
    });
    let searchTimer;
    let customConditionTimer;
    let submissionHighlightTimer;
    watch(searchQuery, (value) => {
      if (searchTimer) {
        clearTimeout(searchTimer);
      }
      searchTimer = setTimeout(() => {
        debouncedSearchQuery.value = value;
      }, 250);
    });
    watch(customConditionInput, (value) => {
      if (customConditionTimer) {
        clearTimeout(customConditionTimer);
      }
      customConditionTimer = setTimeout(() => {
        debouncedCustomConditionPreview.value = value;
      }, 250);
    });
    watch(isConditionPickerOpen, (open) => {
      if (!open) {
        debouncedCustomConditionPreview.value = "";
        if (customConditionTimer) {
          clearTimeout(customConditionTimer);
        }
      }
    });
    watch(user, (currentUser) => {
      if (currentUser) {
        isAuthPanelOpen.value = false;
        loadEntries();
        return;
      }
      savedEntries.value = [];
      closeEntryPanel(true);
    });
    function fieldKey(label) {
      return label.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
    }
    function syncEntryInputsFromForm() {
      const { time } = splitEntryDateTimeLocal(
        entryForm.value.date_and_time || getMaxEntryDateTimeLocal()
      );
      entryTimeInput.value = time;
      syncEntryTimePartsFromInput();
    }
    function syncEntryFormFromInputs() {
      const calendarDate = coerceCalendarDate(entryCalendarDate.value);
      if (!calendarDate || !entryTimeInput.value) {
        return;
      }
      entryCalendarDate.value = calendarDate;
      const dateTimeValue = `${calendarDateToDateString(calendarDate)}T${entryTimeInput.value}`;
      if (isFutureEntryDateTime(dateTimeValue)) {
        setEntryDateTimeNow();
        return;
      }
      entryForm.value.date_and_time = dateTimeValue;
    }
    function syncEntryTimePartsFromInput() {
      const parts = parseTime24ToParts(entryTimeInput.value);
      entryTimeHour.value = parts.hour12;
      entryTimeMinute.value = parts.minute;
      entryTimePeriod.value = parts.period;
    }
    function onEntryTimePartsChange() {
      const nextTime = formatPartsToTime24(
        entryTimeHour.value,
        entryTimeMinute.value,
        entryTimePeriod.value
      );
      entryTimeInput.value = clampTime24ToMax(nextTime, maxEntryTimeInput.value);
      syncEntryTimePartsFromInput();
      syncEntryFormFromInputs();
    }
    function setEntryDateTimeNow() {
      entryForm.value.date_and_time = getMaxEntryDateTimeLocal();
      syncEntryInputsFromForm();
    }
    function clampEntryDateTimeField() {
      syncEntryFormFromInputs();
    }
    function currentStepHasDateTimeField() {
      return currentEntryStepFields.value.some((field) => field.type === "datetime");
    }
    function currentStepHasSliderField() {
      return currentEntryStepFields.value.some((field) => field.type === "slider");
    }
    function currentStepIsEpisodeDetailStep() {
      const fields = currentEntryStepFields.value;
      return fields.some((field) => isEpisodeDurationField(field)) && fields.some((field) => isEpisodeFollowUpField(field));
    }
    function validateEntryDateTimeStep() {
      clampEntryDateTimeField();
      if (!entryForm.value.date_and_time) {
        entryError.value = "Choose when this happened.";
        return false;
      }
      if (isFutureEntryDateTime(entryForm.value.date_and_time)) {
        entryError.value = "Date and time cannot be in the future.";
        return false;
      }
      entryError.value = "";
      return true;
    }
    function conditionKey(label) {
      return label.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
    }
    async function loadEntries() {
      if (!user.value) {
        savedEntries.value = [];
        isSubmissionDropdownOpen.value = false;
        lastSeenSubmissionAt.value = "";
        highlightedSubmissionId.value = null;
        return;
      }
      isLoadingEntries.value = true;
      entriesError.value = "";
      try {
        const { listEntries } = useSymptomEntries();
        savedEntries.value = await listEntries();
        updateSubmissionHighlights(savedEntries.value);
      } catch (error) {
        entriesError.value = getErrorMessage(error);
      } finally {
        isLoadingEntries.value = false;
      }
    }
    function updateSubmissionHighlights(entries) {
      const lastSeenTime = lastSeenSubmissionAt.value ? new Date(lastSeenSubmissionAt.value).getTime() : 0;
      const latestUnseenSubmission = entries.filter((entry) => {
        const createdAt = entry.created_at || entry.occurred_at;
        return createdAt && new Date(createdAt).getTime() > lastSeenTime;
      }).sort((a, b) => {
        const bTime = new Date(b.created_at || b.occurred_at).getTime();
        const aTime = new Date(a.created_at || a.occurred_at).getTime();
        return bTime - aTime;
      })[0];
      if (!latestUnseenSubmission) {
        return;
      }
      highlightedSubmissionId.value = latestUnseenSubmission.id;
      if (submissionHighlightTimer) {
        clearTimeout(submissionHighlightTimer);
      }
      submissionHighlightTimer = setTimeout(() => {
        highlightedSubmissionId.value = null;
      }, submissionHighlightDurationMs);
    }
    async function saveEntry() {
      if (!user.value) {
        entryError.value = "Please sign in before saving symptom entries.";
        isAuthPanelOpen.value = true;
        return;
      }
      if (!validateEntryDateTimeStep()) {
        return;
      }
      isSavingEntry.value = true;
      entryError.value = "";
      try {
        const { createEntry, updateEntry } = useSymptomEntries();
        const details = { ...entryForm.value };
        const occurredAt = entryForm.value.date_and_time ? new Date(entryForm.value.date_and_time).toISOString() : null;
        const payload = {
          condition_key: conditionKey(entryTitle.value),
          condition_label: entryTitle.value,
          severity: severityValue.value,
          occurred_at: occurredAt,
          summary: entryForm.value.what_happened || entryForm.value.condition_name || entryTitle.value,
          impact: entryForm.value.daily_impact || null,
          details
        };
        if (editingEntryId.value) {
          await updateEntry(editingEntryId.value, payload);
        } else {
          await createEntry(payload);
        }
        hasActiveDraft.value = false;
        closeEntryPanel(true);
        await loadEntries();
      } catch (error) {
        entryError.value = getErrorMessage(error);
      } finally {
        isSavingEntry.value = false;
      }
    }
    function openShareLinkForEntry(entryId) {
      if (!user.value) {
        isAuthPanelOpen.value = true;
        return;
      }
      const entry = savedEntries.value.find((item) => item.id === entryId);
      if (!entry || entry.source === "family") {
        return;
      }
      shareLinkEntry.value = entry;
      shareLinkLabel.value = "";
      shareLinkCreatedUrl.value = "";
      shareLinkCopied.value = false;
      shareLinkError.value = "";
      isShareLinkOpen.value = true;
    }
    function getErrorMessage(error) {
      if (error instanceof Error) {
        return error.message;
      }
      return "Something went wrong. Please try again.";
    }
    function getEntryFieldsForSearchCondition(condition) {
      const title = condition.title.toLowerCase();
      const category = condition.category.toLowerCase();
      if (category.includes("mental")) {
        return entryFieldsByCondition["PTSD / Mental Health"];
      }
      if (category.includes("back") || title.includes("arthritis") || title.includes("knee") || title.includes("shoulder")) {
        return entryFieldsByCondition["Back or Joint Pain"];
      }
      if (category.includes("nerve") || title.includes("sciatica") || title.includes("neuropathy")) {
        return entryFieldsByCondition["Nerve / Radiculopathy"];
      }
      if (category.includes("neurological") || title.includes("migraine") || title.includes("headache") || title.includes("vertigo")) {
        return entryFieldsByCondition["Migraine / Headache"];
      }
      if (category.includes("digestive") || title.includes("gerd") || title.includes("ibs")) {
        return entryFieldsByCondition["GERD / IBS"];
      }
      if (category.includes("sleep") || title.includes("sleep")) {
        return entryFieldsByCondition["Sleep Issues"];
      }
      return defaultEntryFields;
    }
    function closeEntryPanel(clearDraft = false) {
      if (isEntryOpen.value) {
        transitionDirection.value = "collapse";
      }
      if (clearDraft) {
        hasActiveDraft.value = false;
      }
      editingEntryId.value = null;
      editingEntryConditionLabel.value = null;
      selectedSearchCondition.value = null;
      isConditionPickerOpen.value = false;
      customConditionInput.value = "";
      debouncedCustomConditionPreview.value = "";
      isEntryOpen.value = false;
    }
    function showNextEntryStep() {
      if (!isLastEntryStep.value) {
        entryStep.value += 1;
      }
    }
    function handleEntryPrimaryAction() {
      if (currentStepHasDateTimeField() && !validateEntryDateTimeStep()) {
        return;
      }
      if (isLastEntryStep.value) {
        saveEntry();
        return;
      }
      showNextEntryStep();
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UIcon = _sfc_main$d;
      const _component_UColorModeSwitch = _sfc_main$3;
      const _component_NuxtLink = __nuxt_component_0$1;
      const _component_USlider = _sfc_main$1;
      const _component_USelectMenu = _sfc_main$2;
      const _component_StickyActionBar = __nuxt_component_5;
      const _component_UBadge = _sfc_main$2$1;
      _push(`<!--[--><main class="h-dvh max-h-dvh overflow-hidden bg-slate-50 text-slate-950 transition-colors dark:bg-slate-950 dark:text-white" data-v-c7dedc53><section class="mx-auto flex h-full max-h-dvh w-full max-w-md flex-col overflow-hidden pt-4 pb-0 sm:max-w-lg" data-v-c7dedc53><header class="flex shrink-0 items-center justify-between gap-3 px-4" data-v-c7dedc53><div data-v-c7dedc53><p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400" data-v-c7dedc53>Today</p><h1 class="mt-1 text-2xl font-bold tracking-tight text-slate-950 dark:text-white" data-v-c7dedc53>Symptom Tracker</h1></div>`);
      if (isEntryOpen.value) {
        _push(`<div class="flex items-center gap-2" data-v-c7dedc53><button type="button" class="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800" data-v-c7dedc53> Cancel </button><button type="button" class="rounded-full bg-slate-950 px-4 py-2 text-sm font-bold text-white shadow-sm dark:bg-white dark:text-slate-950" data-v-c7dedc53> Done </button></div>`);
      } else {
        _push(`<div class="flex items-center gap-2" data-v-c7dedc53>`);
        if (hasActiveDraft.value) {
          _push(`<button type="button" class="relative grid size-10 place-items-center rounded-full bg-white text-slate-950 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-100 dark:bg-slate-900 dark:text-white dark:ring-slate-800 dark:hover:bg-slate-800" aria-label="Open active draft" data-v-c7dedc53>`);
          _push(ssrRenderComponent(_component_UIcon, {
            name: "i-lucide-files",
            class: "size-5"
          }, null, _parent));
          _push(`<span class="absolute right-0.5 top-0.5 size-2.5 rounded-full bg-red-500 ring-2 ring-slate-950" data-v-c7dedc53></span></button>`);
        } else {
          _push(`<!---->`);
        }
        _push(ssrRenderComponent(_component_UColorModeSwitch, {
          size: "md",
          color: "primary",
          class: "header-color-toggle"
        }, null, _parent));
        if (unref(user)) {
          _push(`<div class="relative" data-v-c7dedc53><button type="button" class="${ssrRenderClass([isSubmissionDropdownOpen.value ? "bg-sky-500 text-white ring-sky-400 dark:bg-sky-500 dark:text-white dark:ring-sky-400" : "bg-white text-slate-950 ring-slate-200 hover:bg-slate-100 dark:bg-slate-900 dark:text-white dark:ring-slate-800 dark:hover:bg-slate-800", "relative z-[60] grid size-10 place-items-center rounded-full shadow-sm ring-1 transition"])}"${ssrRenderAttr("aria-expanded", isSubmissionDropdownOpen.value)} aria-label="Open submission notifications" data-v-c7dedc53>`);
          _push(ssrRenderComponent(_component_UIcon, {
            name: "i-lucide-inbox",
            class: "size-5"
          }, null, _parent));
          if (unreadSubmissionCount.value) {
            _push(`<span class="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-sky-500 px-1.5 text-[0.65rem] font-bold leading-5 text-white ring-2 ring-slate-50 dark:ring-slate-950" data-v-c7dedc53>${ssrInterpolate(unreadSubmissionCount.value)}</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</button>`);
          if (isSubmissionDropdownOpen.value) {
            _push(`<div class="fixed inset-0 z-40" data-v-c7dedc53></div>`);
          } else {
            _push(`<!---->`);
          }
          if (isSubmissionDropdownOpen.value) {
            _push(`<div class="absolute right-0 top-12 z-[70] w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/15 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/40" data-v-c7dedc53><div class="border-b border-slate-200 px-4 py-3 dark:border-slate-800" data-v-c7dedc53><div class="flex items-center gap-2" data-v-c7dedc53>`);
            _push(ssrRenderComponent(_component_UIcon, {
              name: "i-lucide-inbox",
              class: "size-4 text-sky-500"
            }, null, _parent));
            _push(`<p class="text-[0.875rem] font-bold text-slate-950 dark:text-white" data-v-c7dedc53>Submissions</p></div><p class="mt-1 text-xs text-slate-500 dark:text-slate-400" data-v-c7dedc53> All observations submitted to your tracker. </p></div>`);
            if (!submissionNotifications.value.length) {
              _push(`<div class="px-4 py-6 text-center text-[0.875rem] text-slate-500 dark:text-slate-400" data-v-c7dedc53> No submissions yet. </div>`);
            } else {
              _push(`<div class="max-h-80 overflow-y-auto no-scrollbar p-2" data-v-c7dedc53><!--[-->`);
              ssrRenderList(submissionNotifications.value, (submission) => {
                _push(`<button type="button" class="flex w-full items-start gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-slate-100 dark:hover:bg-slate-800/80" data-v-c7dedc53><span class="${ssrRenderClass([highlightedSubmissionId.value === submission.id ? "bg-sky-500 text-white" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300", "mt-0.5 grid size-9 shrink-0 place-items-center rounded-full"])}" data-v-c7dedc53>`);
                _push(ssrRenderComponent(_component_UIcon, {
                  name: "i-lucide-message-square-text",
                  class: "size-4"
                }, null, _parent));
                _push(`</span><span class="min-w-0 flex-1" data-v-c7dedc53><span class="block truncate text-[0.875rem] font-bold text-slate-950 dark:text-white" data-v-c7dedc53>${ssrInterpolate(submission.title)}</span><span class="mt-1 line-clamp-2 block text-xs leading-5 text-slate-500 dark:text-slate-400" data-v-c7dedc53>${ssrInterpolate(submission.summary)}</span><span class="mt-1 block text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500" data-v-c7dedc53>${ssrInterpolate(submission.source)} · ${ssrInterpolate(submission.condition)} · ${ssrInterpolate(submission.timeLabel)}</span></span></button>`);
              });
              _push(`<!--]--></div>`);
            }
            _push(`</div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<button type="button" class="grid size-10 place-items-center rounded-full bg-white text-slate-950 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-100 dark:bg-slate-900 dark:text-white dark:ring-slate-800 dark:hover:bg-slate-800"${ssrRenderAttr("aria-label", unref(user) ? "Open account" : "Sign in")} data-v-c7dedc53>`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: unref(user) ? "i-lucide-user-check" : "i-lucide-user-round",
          class: "size-5"
        }, null, _parent));
        _push(`</button></div>`);
      }
      _push(`</header>`);
      if (showInstallCard.value && !isEntryOpen.value) {
        _push(`<section class="mx-4 mt-5 shrink-0 rounded-4xl border border-teal-200 bg-teal-50 p-4 shadow-lg shadow-teal-950/5 dark:border-teal-500/30 dark:bg-teal-950/30 dark:shadow-black/20" data-v-c7dedc53><div class="flex items-start justify-between gap-3" data-v-c7dedc53><div data-v-c7dedc53><p class="text-xs font-bold uppercase tracking-[0.2em] text-teal-700 dark:text-teal-200" data-v-c7dedc53>Install on phone</p><h2 class="mt-1 text-lg font-bold text-slate-950 dark:text-white" data-v-c7dedc53>Use this like an app</h2></div><button type="button" class="grid size-8 shrink-0 place-items-center rounded-full bg-white text-slate-600 ring-1 ring-slate-200 dark:bg-slate-900/80 dark:text-slate-300 dark:ring-0" aria-label="Dismiss install instructions" data-v-c7dedc53>`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "i-lucide-x",
          class: "size-4"
        }, null, _parent));
        _push(`</button></div><p class="mt-3 text-sm leading-6 text-teal-950/90 dark:text-teal-50/90" data-v-c7dedc53>${ssrInterpolate(installInstructionText.value)}</p><div class="mt-4 flex flex-wrap gap-2" data-v-c7dedc53>`);
        if (canPromptInstall.value) {
          _push(`<button type="button" class="rounded-full bg-slate-950 px-4 py-2 text-sm font-bold text-white shadow-sm dark:bg-white dark:text-slate-950" data-v-c7dedc53> Install app </button>`);
        } else {
          _push(`<!---->`);
        }
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/install",
          class: "rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-950 ring-1 ring-teal-200 dark:bg-slate-900/80 dark:text-white dark:ring-teal-500/30"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` How to install `);
            } else {
              return [
                createTextVNode(" How to install ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div></section>`);
      } else {
        _push(`<!---->`);
      }
      if (isAuthPanelOpen.value) {
        _push(`<div class="fixed inset-0 z-50 flex items-start justify-center bg-slate-200/70 px-4 pt-20 backdrop-blur-sm dark:bg-slate-950/70" data-v-c7dedc53><section class="w-full max-w-md rounded-4xl border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-950/10 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/40" data-v-c7dedc53><div class="flex items-start justify-between gap-3" data-v-c7dedc53><div data-v-c7dedc53><p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400" data-v-c7dedc53>${ssrInterpolate(unref(user) ? "Account" : authMode.value === "login" ? "Welcome back" : "Create account")}</p><h2 class="mt-1 text-xl font-bold text-slate-950 dark:text-white" data-v-c7dedc53>${ssrInterpolate(unref(user) ? unref(user).email : authMode.value === "login" ? "Sign in to save entries" : "Start saving your tracker")}</h2></div><button type="button" class="grid size-9 place-items-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300" aria-label="Close account panel" data-v-c7dedc53>`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "i-lucide-x",
          class: "size-4"
        }, null, _parent));
        _push(`</button></div>`);
        if (unref(user)) {
          _push(`<div class="mt-4 space-y-3" data-v-c7dedc53>`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: "/profile",
            class: "flex w-full items-center justify-center rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700",
            onClick: ($event) => isAuthPanelOpen.value = false
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(` Account settings `);
              } else {
                return [
                  createTextVNode(" Account settings ")
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`<button type="button" class="w-full rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-950"${ssrIncludeBooleanAttr(isAuthSubmitting.value) ? " disabled" : ""} data-v-c7dedc53>${ssrInterpolate(isAuthSubmitting.value ? "Signing out..." : "Sign out")}</button>`);
          if (unref(authError)) {
            _push(`<p class="text-center text-sm font-medium text-red-300" data-v-c7dedc53>${ssrInterpolate(unref(authError))}</p>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        } else {
          _push(`<form class="mt-4 space-y-3" data-v-c7dedc53>`);
          if (authMode.value === "signup") {
            _push(`<label class="block" data-v-c7dedc53><span class="mb-2 block px-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-400" data-v-c7dedc53>Name</span><input${ssrRenderAttr("value", authName.value)} type="text" autocomplete="name" class="w-full rounded-3xl border border-slate-300 bg-white px-4 py-4 text-base font-medium text-slate-950 outline-none placeholder:text-slate-400 focus:border-slate-500 dark:border-slate-600/70 dark:bg-slate-800/70 dark:text-white dark:focus:border-slate-400" placeholder="Your full name" required data-v-c7dedc53></label>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<label class="block" data-v-c7dedc53><span class="mb-2 block px-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-400" data-v-c7dedc53>Email</span><input${ssrRenderAttr("value", authEmail.value)} type="email" autocomplete="email" class="w-full rounded-3xl border border-slate-300 bg-white px-4 py-4 text-base font-medium text-slate-950 outline-none placeholder:text-slate-400 focus:border-slate-500 dark:border-slate-600/70 dark:bg-slate-800/70 dark:text-white dark:focus:border-slate-400" placeholder="you@example.com" required data-v-c7dedc53></label>`);
          if (authMode.value === "signup") {
            _push(`<label class="block" data-v-c7dedc53><span class="mb-2 block px-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-400" data-v-c7dedc53>Confirm password</span><input${ssrRenderAttr("value", authConfirmPassword.value)} type="password" autocomplete="new-password" class="w-full rounded-3xl border border-slate-300 bg-white px-4 py-4 text-base font-medium text-slate-950 outline-none placeholder:text-slate-400 focus:border-slate-500 dark:border-slate-600/70 dark:bg-slate-800/70 dark:text-white dark:focus:border-slate-400" placeholder="Re-enter password" required data-v-c7dedc53></label>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<label class="block" data-v-c7dedc53><span class="mb-2 block px-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-400" data-v-c7dedc53>Password</span><input${ssrRenderAttr("value", authPassword.value)} type="password" autocomplete="current-password" class="w-full rounded-3xl border border-slate-300 bg-white px-4 py-4 text-base font-medium text-slate-950 outline-none placeholder:text-slate-400 focus:border-slate-500 dark:border-slate-600/70 dark:bg-slate-800/70 dark:text-white dark:focus:border-slate-400" placeholder="At least 6 characters" required data-v-c7dedc53></label><button type="submit" class="w-full rounded-2xl bg-white px-4 py-4 text-base font-bold text-slate-950"${ssrIncludeBooleanAttr(isAuthSubmitting.value) ? " disabled" : ""} data-v-c7dedc53>${ssrInterpolate(isAuthSubmitting.value ? "Working..." : authMode.value === "login" ? "Sign in" : "Create account")}</button><button type="button" class="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-100 px-4 py-4 text-base font-bold text-slate-950 ring-1 ring-slate-200 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-white dark:ring-slate-700 dark:hover:bg-slate-700"${ssrIncludeBooleanAttr(isAuthSubmitting.value) ? " disabled" : ""} data-v-c7dedc53>`);
          _push(ssrRenderComponent(_component_UIcon, {
            name: "i-lucide-chrome",
            class: "size-5"
          }, null, _parent));
          _push(` Continue with Google </button>`);
          if (authMode.value === "login") {
            _push(`<button type="button" class="w-full rounded-2xl px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300"${ssrIncludeBooleanAttr(isAuthSubmitting.value) ? " disabled" : ""} data-v-c7dedc53> Forgot password? </button>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<button type="button" class="w-full rounded-2xl px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300" data-v-c7dedc53>${ssrInterpolate(authMode.value === "login" ? "Need an account? Sign up" : "Already have an account? Sign in")}</button>`);
          if (authMessage.value) {
            _push(`<p class="text-center text-sm font-medium text-slate-300" data-v-c7dedc53>${ssrInterpolate(authMessage.value)}</p>`);
          } else {
            _push(`<!---->`);
          }
          if (unref(authError)) {
            _push(`<p class="text-center text-sm font-medium text-red-300" data-v-c7dedc53>${ssrInterpolate(unref(authError))}</p>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</form>`);
        }
        _push(`</section></div>`);
      } else {
        _push(`<!---->`);
      }
      if (isEntryOpen.value) {
        _push(`<section class="mt-3 flex min-h-0 flex-1 flex-col overflow-hidden" data-v-c7dedc53><div class="flex min-h-0 flex-1 flex-col overflow-hidden px-5" data-v-c7dedc53><div class="flex min-h-0 flex-1 flex-col overflow-hidden" data-v-c7dedc53><div class="mb-6 shrink-0 flex items-center gap-4" data-v-c7dedc53><img${ssrRenderAttr("src", activeEntryImage.value)}${ssrRenderAttr("alt", entryTitle.value)} class="size-16 shrink-0 rounded-2xl object-cover" data-v-c7dedc53><div class="min-w-0 flex-1" data-v-c7dedc53><p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400" data-v-c7dedc53>${ssrInterpolate(isEditingEntry.value ? "Edit Entry" : "New Entry")}</p><div class="mt-1.5 flex items-center gap-2" data-v-c7dedc53><h2 class="min-w-0 truncate text-xl font-bold text-slate-950 dark:text-white" data-v-c7dedc53>${ssrInterpolate(entryTitle.value)}</h2><button type="button" class="${ssrRenderClass([isConditionPickerOpen.value ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950" : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700", "grid size-8 shrink-0 place-items-center rounded-full transition"])}"${ssrRenderAttr("aria-label", isConditionPickerOpen.value ? "Close condition picker" : "Change condition")}${ssrRenderAttr("aria-expanded", isConditionPickerOpen.value)} data-v-c7dedc53>`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "i-lucide-pencil",
          class: "size-4"
        }, null, _parent));
        _push(`</button></div><p class="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400" data-v-c7dedc53>Log what you know right now.</p></div></div>`);
        if (isConditionPickerOpen.value) {
          _push(`<div class="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" data-v-c7dedc53><div class="border-b border-slate-200 px-3 py-3 dark:border-slate-800" data-v-c7dedc53><label class="mb-2 block text-[0.65rem] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400" data-v-c7dedc53> Custom condition </label><div class="flex gap-2" data-v-c7dedc53><input${ssrRenderAttr("value", customConditionInput.value)} type="text" placeholder="Example: tinnitus, sinusitis, skin flare-up..." class="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-950 outline-none placeholder:text-slate-400 focus:border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-slate-500" data-v-c7dedc53><button type="button" class="inline-flex shrink-0 items-center rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-40 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"${ssrIncludeBooleanAttr(!customConditionInput.value.trim()) ? " disabled" : ""} data-v-c7dedc53> Use </button></div></div><div class="border-b border-slate-200 px-3 py-2 dark:border-slate-800" data-v-c7dedc53><p class="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400" data-v-c7dedc53>${ssrInterpolate(hasCustomConditionSearch.value ? filteredPickerConditionResults.value.length ? "Matching conditions" : "No matches" : "Or pick from the list")}</p></div><div class="no-scrollbar max-h-52 space-y-0.5 overflow-y-auto p-2" data-v-c7dedc53>`);
          if (showCustomConditionEmptyState.value) {
            _push(`<div class="rounded-xl px-3 py-4 text-center" data-v-c7dedc53><p class="text-sm font-bold text-slate-950 dark:text-white" data-v-c7dedc53> No results </p><p class="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400" data-v-c7dedc53> Tap <span class="font-bold text-slate-950 dark:text-white" data-v-c7dedc53>Use</span> to add <span class="font-semibold text-slate-700 dark:text-slate-200" data-v-c7dedc53>&quot;${ssrInterpolate(debouncedCustomConditionPreview.value.trim())}&quot;</span> as a custom condition. </p></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<!--[-->`);
          ssrRenderList(filteredPickerConditionResults.value, (result) => {
            _push(`<button type="button" class="${ssrRenderClass([result.title === entryTitle.value ? "bg-slate-100 ring-1 ring-slate-300 dark:bg-slate-800 dark:ring-slate-600" : "hover:bg-slate-50 dark:hover:bg-slate-800/80", "flex w-full items-center gap-2.5 rounded-xl p-2 text-left transition"])}" data-v-c7dedc53><img${ssrRenderAttr("src", result.image)}${ssrRenderAttr("alt", result.title)} class="size-10 shrink-0 rounded-xl object-cover" data-v-c7dedc53><span class="min-w-0 flex-1" data-v-c7dedc53><span class="block truncate text-sm font-bold text-slate-950 dark:text-white" data-v-c7dedc53>${ssrInterpolate(result.title)}</span><span class="mt-0.5 block truncate text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400" data-v-c7dedc53>${ssrInterpolate(result.category)}</span></span>`);
            if (result.title === entryTitle.value) {
              _push(ssrRenderComponent(_component_UIcon, {
                name: "i-lucide-check",
                class: "size-4 shrink-0 text-slate-950 dark:text-white"
              }, null, _parent));
            } else {
              _push(`<!---->`);
            }
            _push(`</button>`);
          });
          _push(`<!--]--></div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="flex min-h-0 flex-1 flex-col overflow-hidden" data-v-c7dedc53><div class="relative z-10 mb-6 shrink-0 flex items-center justify-between gap-4 bg-slate-50 px-1 dark:bg-slate-950" data-v-c7dedc53><button type="button" class="grid size-10 place-items-center rounded-full bg-slate-100 text-slate-950 transition hover:bg-slate-200 disabled:opacity-30 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"${ssrIncludeBooleanAttr(entryStep.value === 0) ? " disabled" : ""} aria-label="Previous entry step" data-v-c7dedc53>`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "i-lucide-chevron-left",
          class: "size-5"
        }, null, _parent));
        _push(`</button><div class="min-w-0 flex-1" data-v-c7dedc53><p class="text-center text-xs font-bold uppercase tracking-[0.18em] text-slate-500" data-v-c7dedc53> Step ${ssrInterpolate(entryStep.value + 1)} of ${ssrInterpolate(entrySteps.value.length)}</p><div class="mt-2.5 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800" data-v-c7dedc53><div class="h-full rounded-full bg-slate-950 transition-all duration-300 dark:bg-white" style="${ssrRenderStyle({ width: entryProgressWidth.value })}" data-v-c7dedc53></div></div></div><button type="button" class="grid size-10 place-items-center rounded-full bg-slate-100 text-slate-950 transition hover:bg-slate-200 disabled:opacity-30 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"${ssrIncludeBooleanAttr(isLastEntryStep.value) ? " disabled" : ""} aria-label="Next entry step" data-v-c7dedc53>`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "i-lucide-chevron-right",
          class: "size-5"
        }, null, _parent));
        _push(`</button></div><div class="flex min-h-0 flex-1 flex-col overflow-hidden" data-v-c7dedc53><div class="${ssrRenderClass([currentStepHasSliderField() && currentEntryStepFields.value.length === 1 ? "justify-center px-1 py-4" : currentStepIsEpisodeDetailStep() ? "mt-8 justify-start space-y-12 overflow-y-auto no-scrollbar pt-2" : "mt-6 justify-start space-y-6 overflow-y-auto no-scrollbar", "flex min-h-0 flex-1 flex-col"])}" data-v-c7dedc53><!--[-->`);
        ssrRenderList(currentEntryStepFields.value, (field, fieldIndex) => {
          _push(`<label class="${ssrRenderClass([fieldIndex > 0 && isEpisodeFollowUpField(field) ? "border-t border-slate-200/80 pt-10 dark:border-slate-700/80" : "", "block w-full"])}" data-v-c7dedc53>`);
          if (field.type !== "datetime" && field.type !== "slider") {
            _push(`<span class="${ssrRenderClass([isEpisodeDurationField(field) || isEpisodeFollowUpField(field) ? "mb-5" : "", "mb-4 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400"])}" data-v-c7dedc53>${ssrInterpolate(field.label)}</span>`);
          } else {
            _push(`<!---->`);
          }
          if (field.type === "slider") {
            _push(`<div class="w-full space-y-5" data-v-c7dedc53><div class="space-y-1 text-center" data-v-c7dedc53><p class="text-xs font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400" data-v-c7dedc53> How much did today affect you? </p><p class="text-xs leading-5 text-slate-500 dark:text-slate-400" data-v-c7dedc53> Slide between a best day and a worst day for this condition. </p></div><div class="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400" data-v-c7dedc53><span data-v-c7dedc53>Best day</span><span data-v-c7dedc53>Worst day</span></div>`);
            _push(ssrRenderComponent(_component_USlider, {
              modelValue: severityValue.value,
              "onUpdate:modelValue": ($event) => severityValue.value = $event,
              min: 0,
              max: 10,
              step: 1,
              size: "xl",
              color: "neutral",
              tooltip: ""
            }, null, _parent));
            _push(`<div class="flex flex-wrap justify-center gap-2" data-v-c7dedc53><!--[-->`);
            ssrRenderList(unref(severityQuickPresets), (preset) => {
              _push(`<button type="button" class="${ssrRenderClass([severityValue.value === preset.value ? "border-slate-950 bg-slate-950 text-white dark:border-white dark:bg-white dark:text-slate-950" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800", "rounded-full border px-3 py-1.5 text-xs font-bold transition"])}" data-v-c7dedc53>${ssrInterpolate(preset.label)}</button>`);
            });
            _push(`<!--]--></div><div class="min-h-[5rem] overflow-hidden" data-v-c7dedc53><div class="rounded-2xl bg-slate-100/80 px-5 py-4 dark:bg-slate-800/80" data-v-c7dedc53><p class="text-sm font-bold text-slate-950 dark:text-white" data-v-c7dedc53>${ssrInterpolate(severityGuidance.value.title)}</p><p class="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300" data-v-c7dedc53>${ssrInterpolate(severityGuidance.value.text)}</p></div></div></div>`);
          } else if (field.type === "datetime") {
            _push(`<div class="space-y-4" data-v-c7dedc53><div class="flex items-start justify-between gap-3" data-v-c7dedc53><div class="min-w-0 flex-1" data-v-c7dedc53><span class="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400" data-v-c7dedc53> When did this happen? </span><p class="text-sm leading-6 font-medium text-slate-950 dark:text-white" data-v-c7dedc53>${ssrInterpolate(entryDateTimePreview.value)}</p></div><button type="button" class="relative z-10 inline-flex shrink-0 items-center gap-1 rounded-full border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-950 shadow-sm transition hover:bg-slate-100 active:scale-[0.98] dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700" data-v-c7dedc53>`);
            _push(ssrRenderComponent(_component_UIcon, {
              name: "i-lucide-clock-3",
              class: "size-3.5"
            }, null, _parent));
            _push(` Now </button></div><div class="space-y-4" data-v-c7dedc53><div class="flex items-center justify-center gap-2" data-v-c7dedc53><button type="button" class="grid size-8 place-items-center rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800" aria-label="Previous month" data-v-c7dedc53>`);
            _push(ssrRenderComponent(_component_UIcon, {
              name: "i-lucide-chevron-left",
              class: "size-4"
            }, null, _parent));
            _push(`</button><p class="min-w-[8rem] text-center text-sm font-bold text-slate-950 dark:text-white" data-v-c7dedc53>${ssrInterpolate(entryPickerMonthLabel.value)}</p><button type="button" class="grid size-8 place-items-center rounded-full text-slate-500 hover:bg-slate-100 disabled:opacity-30 dark:text-slate-400 dark:hover:bg-slate-800" aria-label="Next month"${ssrIncludeBooleanAttr(!canShowNextEntryPickerMonth.value) ? " disabled" : ""} data-v-c7dedc53>`);
            _push(ssrRenderComponent(_component_UIcon, {
              name: "i-lucide-chevron-right",
              class: "size-4"
            }, null, _parent));
            _push(`</button></div><div class="grid grid-cols-7 text-center text-xs font-semibold text-slate-500 dark:text-slate-400" data-v-c7dedc53><!--[-->`);
            ssrRenderList(weekDays, (day) => {
              _push(`<span data-v-c7dedc53>${ssrInterpolate(day)}</span>`);
            });
            _push(`<!--]--></div><div class="grid grid-cols-7 gap-y-2 text-center" data-v-c7dedc53><!--[-->`);
            ssrRenderList(entryPickerDays.value, (day) => {
              _push(`<div class="flex justify-center" data-v-c7dedc53>`);
              if (day.dayNumber) {
                _push(`<button type="button" class="${ssrRenderClass([day.selected ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950" : day.selectable ? "text-slate-950 hover:bg-slate-100 dark:text-white dark:hover:bg-slate-800" : "cursor-not-allowed text-slate-300 dark:text-slate-600", "grid size-8 place-items-center rounded-full text-xs font-bold transition"])}"${ssrIncludeBooleanAttr(!day.selectable) ? " disabled" : ""}${ssrRenderAttr("aria-label", day.label)}${ssrRenderAttr("aria-pressed", day.selected)} data-v-c7dedc53>${ssrInterpolate(day.dayNumber)}</button>`);
              } else {
                _push(`<!---->`);
              }
              _push(`</div>`);
            });
            _push(`<!--]--></div><div class="mt-6 space-y-3" data-v-c7dedc53><p class="text-center text-xs font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400" data-v-c7dedc53> Time </p><div class="grid grid-cols-3 gap-3" data-v-c7dedc53>`);
            _push(ssrRenderComponent(_component_USelectMenu, {
              modelValue: entryTimeHour.value,
              "onUpdate:modelValue": [($event) => entryTimeHour.value = $event, onEntryTimePartsChange],
              items: unref(entryHourOptions),
              ui: entryTimeSelectUi,
              color: "neutral",
              variant: "ghost",
              size: "md",
              "aria-label": "Hour",
              class: "sym-entry-time-menu w-full",
              popper: { strategy: "fixed" }
            }, null, _parent));
            _push(ssrRenderComponent(_component_USelectMenu, {
              modelValue: entryTimeMinute.value,
              "onUpdate:modelValue": [($event) => entryTimeMinute.value = $event, onEntryTimePartsChange],
              items: unref(entryMinuteOptions),
              ui: entryTimeSelectUi,
              color: "neutral",
              variant: "ghost",
              size: "md",
              "aria-label": "Minute",
              class: "sym-entry-time-menu w-full",
              popper: { strategy: "fixed" }
            }, null, _parent));
            _push(ssrRenderComponent(_component_USelectMenu, {
              modelValue: entryTimePeriod.value,
              "onUpdate:modelValue": [($event) => entryTimePeriod.value = $event, onEntryTimePartsChange],
              items: entryPeriodOptions,
              ui: entryTimeSelectUi,
              color: "neutral",
              variant: "ghost",
              size: "md",
              "aria-label": "AM or PM",
              class: "sym-entry-time-menu w-full",
              popper: { strategy: "fixed" }
            }, null, _parent));
            _push(`</div></div></div></div>`);
          } else if (isEpisodeDurationField(field) || isEpisodeFollowUpField(field)) {
            _push(`<div class="space-y-5" data-v-c7dedc53><div class="flex flex-wrap gap-2.5" data-v-c7dedc53><!--[-->`);
            ssrRenderList(unref(getEntryFieldPresets)(field.label), (preset) => {
              _push(`<button type="button" class="${ssrRenderClass([entryForm.value[fieldKey(field.label)] === preset.value ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950" : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700", "rounded-full px-3 py-1.5 text-xs font-bold transition"])}" data-v-c7dedc53>${ssrInterpolate(preset.label)}</button>`);
            });
            _push(`<!--]--></div><input${ssrRenderAttr("value", entryForm.value[fieldKey(field.label)])} type="text"${ssrRenderAttr("placeholder", field.placeholder)} class="w-full border-0 bg-transparent px-0 py-3 text-base font-medium text-slate-950 outline-none placeholder:text-slate-400 dark:text-white" data-v-c7dedc53></div>`);
          } else if (field.type === "textarea") {
            _push(`<textarea${ssrRenderAttr("placeholder", field.placeholder)} rows="4" class="w-full resize-none border-0 border-b border-slate-300/80 bg-transparent px-0 py-4 text-base font-medium leading-7 text-slate-950 outline-none placeholder:text-slate-400 focus:border-slate-500 dark:border-slate-700 dark:text-white dark:focus:border-slate-400" data-v-c7dedc53>${ssrInterpolate(entryForm.value[fieldKey(field.label)])}</textarea>`);
          } else if (field.type !== "slider" && field.type !== "datetime" && !isEpisodeDurationField(field) && !isEpisodeFollowUpField(field)) {
            _push(`<input${ssrRenderDynamicModel(field.type, entryForm.value[fieldKey(field.label)], null)}${ssrRenderAttr("type", field.type)}${ssrRenderAttr("placeholder", field.placeholder)} class="w-full border-0 border-b border-slate-300/80 bg-transparent px-0 py-4 text-base font-medium text-slate-950 outline-none placeholder:text-slate-400 focus:border-slate-500 dark:border-slate-700 dark:text-white dark:focus:border-slate-400" data-v-c7dedc53>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</label>`);
        });
        _push(`<!--]--></div></div></div><div class="mt-auto shrink-0" data-v-c7dedc53>`);
        _push(ssrRenderComponent(_component_StickyActionBar, { class: "-mx-5 rounded-none border-x-0 dark:border-slate-800" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              if (isEditingEntry.value && unref(user)) {
                _push2(`<button type="button" class="mb-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-100 px-5 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700" data-v-c7dedc53${_scopeId}>`);
                _push2(ssrRenderComponent(_component_UIcon, {
                  name: "i-lucide-link",
                  class: "size-4"
                }, null, _parent2, _scopeId));
                _push2(` Create private link for this entry </button>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`<button type="button" class="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-4 text-base font-bold text-white shadow-lg transition hover:bg-slate-800 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"${ssrIncludeBooleanAttr(isSavingEntry.value) ? " disabled" : ""} data-v-c7dedc53${_scopeId}>${ssrInterpolate(isSavingEntry.value ? "Saving..." : isLastEntryStep.value ? isEditingEntry.value ? "Save changes" : "Finish" : "Continue")} `);
              _push2(ssrRenderComponent(_component_UIcon, {
                name: isLastEntryStep.value ? "i-lucide-check" : "i-lucide-arrow-right",
                class: "size-5"
              }, null, _parent2, _scopeId));
              _push2(`</button>`);
              if (entryError.value) {
                _push2(`<p class="mt-3 text-center text-sm font-medium text-red-300" data-v-c7dedc53${_scopeId}>${ssrInterpolate(entryError.value)}</p>`);
              } else {
                _push2(`<!---->`);
              }
            } else {
              return [
                isEditingEntry.value && unref(user) ? (openBlock(), createBlock("button", {
                  key: 0,
                  type: "button",
                  class: "mb-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-100 px-5 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700",
                  onClick: ($event) => openShareLinkForEntry(editingEntryId.value)
                }, [
                  createVNode(_component_UIcon, {
                    name: "i-lucide-link",
                    class: "size-4"
                  }),
                  createTextVNode(" Create private link for this entry ")
                ], 8, ["onClick"])) : createCommentVNode("", true),
                createVNode("button", {
                  type: "button",
                  class: "flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-4 text-base font-bold text-white shadow-lg transition hover:bg-slate-800 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600",
                  disabled: isSavingEntry.value,
                  onClick: handleEntryPrimaryAction
                }, [
                  createTextVNode(toDisplayString(isSavingEntry.value ? "Saving..." : isLastEntryStep.value ? isEditingEntry.value ? "Save changes" : "Finish" : "Continue") + " ", 1),
                  createVNode(_component_UIcon, {
                    name: isLastEntryStep.value ? "i-lucide-check" : "i-lucide-arrow-right",
                    class: "size-5"
                  }, null, 8, ["name"])
                ], 8, ["disabled"]),
                entryError.value ? (openBlock(), createBlock("p", {
                  key: 1,
                  class: "mt-3 text-center text-sm font-medium text-red-300"
                }, toDisplayString(entryError.value), 1)) : createCommentVNode("", true)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div></div></div></section>`);
      } else {
        _push(`<div class="mt-3 flex min-h-0 flex-1 flex-col overflow-hidden" data-v-c7dedc53><div class="${ssrRenderClass([historyExpanded.value ? "pb-1" : "pb-2", "shrink-0 px-4 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"])}" data-v-c7dedc53><div class="relative flex min-h-0 flex-col" data-v-c7dedc53><div class="${ssrRenderClass([historyExpanded.value ? "h-[40dvh]" : "h-[55dvh]", "relative w-full shrink-0 overflow-hidden rounded-[1.75rem] transition-[height,max-height] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"])}" data-v-c7dedc53>`);
        if (isSearchSlide.value) {
          _push(`<div class="absolute inset-0 flex h-full flex-col px-2 pt-3 pb-20" data-v-c7dedc53><p class="px-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400" data-v-c7dedc53> 1 of ${ssrInterpolate(totalSlides.value)}</p><input${ssrRenderAttr("value", searchQuery.value)} type="search" placeholder="Find a condition or + custom" class="mt-2 w-full border-0 border-b border-slate-300/80 bg-transparent px-1 py-2.5 text-lg font-semibold text-slate-950 outline-none placeholder:text-slate-400 focus:border-slate-500 dark:border-slate-700 dark:text-white dark:placeholder:text-slate-500" data-v-c7dedc53><div class="relative mt-2 min-h-0 flex-1" data-v-c7dedc53><div class="no-scrollbar h-full space-y-1 overflow-y-auto px-1 pb-16" data-v-c7dedc53>`);
          if (showConditionSearchEmptyState.value) {
            _push(`<div class="rounded-2xl px-3 py-6 text-center" data-v-c7dedc53><p class="text-lg font-bold text-slate-950 dark:text-white" data-v-c7dedc53> No results </p><p class="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300" data-v-c7dedc53> Press <span class="inline-grid size-7 translate-y-0.5 align-middle place-items-center rounded-full bg-slate-950 text-white dark:bg-white dark:text-slate-950" data-v-c7dedc53>`);
            _push(ssrRenderComponent(_component_UIcon, {
              name: "i-lucide-plus",
              class: "size-4"
            }, null, _parent));
            _push(`</span> to add <span class="font-semibold text-slate-950 dark:text-white" data-v-c7dedc53>&quot;${ssrInterpolate(debouncedSearchQuery.value.trim())}&quot;</span> as a custom condition. </p></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<!--[-->`);
          ssrRenderList(filteredConditionResults.value, (result) => {
            _push(`<button type="button" class="flex w-full items-start gap-3 rounded-2xl px-2 py-2.5 text-left transition hover:bg-slate-100 active:scale-[0.99] dark:hover:bg-slate-800/80" data-v-c7dedc53><img${ssrRenderAttr("src", result.image)}${ssrRenderAttr("alt", result.title)} class="size-16 shrink-0 rounded-2xl object-cover" data-v-c7dedc53><span class="min-w-0 flex-1" data-v-c7dedc53><span class="block text-lg font-bold leading-snug text-slate-950 dark:text-white" data-v-c7dedc53>${ssrInterpolate(result.title)}</span><span class="mt-1 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400" data-v-c7dedc53>${ssrInterpolate(result.category)}</span><span class="mt-1 block text-sm leading-5 text-slate-600 dark:text-slate-300" data-v-c7dedc53>${ssrInterpolate(result.description)}</span></span></button>`);
          });
          _push(`<!--]--></div>`);
          if (filteredConditionResults.value.length > 2 && !showConditionSearchEmptyState.value) {
            _push(`<div class="${ssrRenderClass([isConditionScrolling.value ? "opacity-0" : "opacity-100", "pointer-events-none absolute inset-x-0 bottom-3 flex h-10 items-end justify-center bg-linear-to-t from-white via-white/75 to-transparent pb-1.5 transition-opacity duration-200 dark:from-slate-950 dark:via-slate-950/75"])}" data-v-c7dedc53><span class="rounded-full bg-slate-950/85 px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-white shadow-lg shadow-slate-950/20 ring-1 ring-white/40 dark:bg-white/90 dark:text-slate-950 dark:shadow-black/30 dark:ring-slate-700/40" data-v-c7dedc53> Scroll for more </span></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div>`);
        } else {
          _push(`<div class="absolute inset-0" role="button" tabindex="0"${ssrRenderAttr("aria-label", `Start entry for ${activeCondition.value.title}`)} data-clickable="true" data-v-c7dedc53><img${ssrRenderAttr("src", activeCondition.value.image)}${ssrRenderAttr("alt", activeCondition.value.title)} class="h-full w-full object-cover" data-v-c7dedc53><div class="absolute inset-x-0 top-0 bg-linear-to-b from-black/70 via-black/20 to-transparent p-5 pb-16" data-v-c7dedc53><div class="flex items-start justify-between gap-4" data-v-c7dedc53><p class="text-xs font-semibold uppercase tracking-[0.2em] text-white/70" data-v-c7dedc53>${ssrInterpolate(activeIndex.value + 1)} of ${ssrInterpolate(totalSlides.value)}</p><button type="button" class="grid size-10 place-items-center rounded-full bg-slate-950/70 text-white shadow-sm ring-1 ring-white/10 backdrop-blur transition hover:bg-slate-900" aria-label="Search conditions" data-v-c7dedc53>`);
          _push(ssrRenderComponent(_component_UIcon, {
            name: "i-lucide-search",
            class: "size-5"
          }, null, _parent));
          _push(`</button></div><h2 class="mt-1 text-2xl font-bold text-white" data-v-c7dedc53>${ssrInterpolate(activeCondition.value.title)}</h2></div></div>`);
        }
        _push(`<div class="${ssrRenderClass([isSearchSlide.value ? "bg-linear-to-t from-white via-white/95 to-transparent dark:from-slate-950 dark:via-slate-950/95" : "bg-linear-to-t from-slate-950 via-slate-950/90 to-transparent", "pointer-events-none absolute inset-x-0 bottom-0 z-10 px-3 pb-1 pt-6"])}" data-v-c7dedc53><div class="pointer-events-auto flex flex-col items-center gap-1.5" data-v-c7dedc53><div class="flex justify-center gap-2" data-v-c7dedc53><!--[-->`);
        ssrRenderList(totalSlides.value, (_, index2) => {
          _push(`<button type="button" class="${ssrRenderClass([[
            index2 === activeIndex.value ? "w-7" : "w-2",
            isSearchSlide.value ? index2 === activeIndex.value ? "bg-slate-950 dark:bg-white" : "bg-slate-300 dark:bg-white/35" : index2 === activeIndex.value ? "bg-white" : "bg-white/35"
          ], "h-2 rounded-full transition-all"])}"${ssrRenderAttr("aria-label", `Show condition ${index2 + 1}`)} data-v-c7dedc53></button>`);
        });
        _push(`<!--]--></div><div class="flex items-center justify-center gap-4" data-v-c7dedc53><button type="button" class="grid size-11 place-items-center rounded-full bg-white text-slate-950 shadow-lg transition hover:bg-slate-100 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800" aria-label="Previous condition" data-v-c7dedc53>`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "i-lucide-chevron-left",
          class: "size-5"
        }, null, _parent));
        _push(`</button><button type="button" class="${ssrRenderClass([historyExpanded.value ? "scale-90" : "scale-100", "grid size-[4.5rem] place-items-center rounded-full bg-white text-slate-950 shadow-xl transition hover:bg-slate-100 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"])}"${ssrRenderAttr("aria-label", isSearchSlide.value ? "Add custom condition" : `Add ${activeCondition.value.title} entry`)} data-v-c7dedc53>`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "i-lucide-plus",
          class: "size-9"
        }, null, _parent));
        _push(`</button><button type="button" class="grid size-11 place-items-center rounded-full bg-white text-slate-950 shadow-lg transition hover:bg-slate-100 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800" aria-label="Next condition" data-v-c7dedc53>`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "i-lucide-chevron-right",
          class: "size-5"
        }, null, _parent));
        _push(`</button></div></div></div></div></div></div><section class="flex min-h-0 flex-1 flex-col overflow-hidden rounded-t-[1.75rem] border-t border-slate-200/80 bg-white transition-[flex] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] dark:border-slate-800 dark:bg-slate-900" data-v-c7dedc53><button type="button" class="flex w-full shrink-0 justify-center py-2.5"${ssrRenderAttr("aria-label", historyExpanded.value ? "Collapse history" : "Expand history")} data-v-c7dedc53><span class="h-1 w-10 rounded-full bg-slate-300 dark:bg-slate-600" data-v-c7dedc53></span></button><div class="shrink-0 px-4" data-v-c7dedc53><div class="flex items-start justify-between gap-3" data-v-c7dedc53><h2 class="text-2xl font-bold text-slate-950 dark:text-white" data-v-c7dedc53>History</h2><button type="button" class="inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-slate-600 transition hover:text-slate-950 disabled:opacity-40 dark:text-slate-300 dark:hover:text-white"${ssrIncludeBooleanAttr(!savedEntries.value.length || isExportingPdf.value) ? " disabled" : ""} data-v-c7dedc53>`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "i-lucide-download",
          class: "size-4"
        }, null, _parent));
        _push(` ${ssrInterpolate(isExportingPdf.value ? "Exporting..." : "PDF")}</button></div>`);
        if (exportError.value) {
          _push(`<p class="mt-2 text-sm font-medium text-red-600 dark:text-red-300" data-v-c7dedc53>${ssrInterpolate(exportError.value)}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="mt-4 rounded-full bg-slate-100 p-1 dark:bg-slate-800/80" data-v-c7dedc53><div class="grid grid-cols-2 gap-1" data-v-c7dedc53><!--[-->`);
        ssrRenderList(historyTabs, (tab) => {
          _push(`<button type="button" class="${ssrRenderClass([activeHistoryTab.value === tab ? "bg-white text-slate-950 shadow-sm dark:bg-slate-700 dark:text-white" : "text-slate-500 dark:text-slate-400", "rounded-full px-4 py-3 text-sm font-semibold transition"])}" data-v-c7dedc53>${ssrInterpolate(tab)}</button>`);
        });
        _push(`<!--]--></div></div></div><div class="${ssrRenderClass([historyExpanded.value ? "overflow-y-auto" : "overflow-hidden touch-pan-y", "min-h-0 flex-1 overscroll-contain px-4 pb-2 pt-3 no-scrollbar"])}" data-v-c7dedc53>`);
        if (activeHistoryTab.value === "Entries") {
          _push(`<div class="divide-y divide-slate-200 dark:divide-slate-800" data-v-c7dedc53>`);
          if (!unref(user) && !unref(isAuthLoading)) {
            _push(`<div class="py-8 text-center" data-v-c7dedc53><p class="font-bold text-slate-950 dark:text-white" data-v-c7dedc53>Sign in to save entries</p><p class="mt-1 text-sm text-slate-600 dark:text-slate-400" data-v-c7dedc53> Your symptom logs sync to your account once you sign in. </p><button type="button" class="mt-4 rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white dark:bg-white dark:text-slate-950" data-v-c7dedc53> Sign in </button></div>`);
          } else if (isLoadingEntries.value) {
            _push(`<div class="py-8 text-center text-sm text-slate-500 dark:text-slate-400" data-v-c7dedc53> Loading entries... </div>`);
          } else if (entriesError.value) {
            _push(`<div class="py-8 text-center text-sm text-red-600 dark:text-red-300" data-v-c7dedc53>${ssrInterpolate(entriesError.value)}</div>`);
          } else if (!historyEntries.value.length) {
            _push(`<div class="py-8 text-center" data-v-c7dedc53><p class="font-bold text-slate-950 dark:text-white" data-v-c7dedc53>No entries yet</p><p class="mt-1 text-sm text-slate-600 dark:text-slate-400" data-v-c7dedc53>Tap a condition or use search to create your first log.</p></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<!--[-->`);
          ssrRenderList(historyEntries.value, (entry) => {
            _push(`<article${ssrRenderAttr("data-entry-id", entry.id)} class="${ssrRenderClass([highlightedSubmissionId.value === entry.id ? "submission-flash bg-sky-50 ring-2 ring-sky-300 shadow-lg shadow-sky-950/10 dark:bg-sky-950/30 dark:ring-sky-500/70 dark:shadow-black/20" : "", "rounded-2xl px-2 py-3 transition duration-500 hover:bg-slate-50 active:bg-slate-100 dark:hover:bg-slate-900/70 dark:active:bg-slate-900"])}" data-v-c7dedc53><div class="flex items-center gap-3" data-v-c7dedc53><button type="button" class="${ssrRenderClass([entry.statusColor, "grid size-14 shrink-0 place-items-center rounded-2xl bg-slate-100 text-center transition dark:bg-slate-800"])}"${ssrRenderAttr("aria-label", `Edit ${entry.title}`)} data-v-c7dedc53><div data-v-c7dedc53><p class="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400" data-v-c7dedc53>${ssrInterpolate(entry.month)}</p><p class="text-lg font-bold leading-none text-slate-950 dark:text-white" data-v-c7dedc53>${ssrInterpolate(entry.day)}</p></div></button><button type="button" class="min-w-0 flex-1 text-left"${ssrRenderAttr("aria-label", `View and edit ${entry.title}`)} data-v-c7dedc53><div class="flex flex-wrap items-center gap-2" data-v-c7dedc53>`);
            _push(ssrRenderComponent(_component_UBadge, {
              color: "neutral",
              variant: "soft",
              size: "sm"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`${ssrInterpolate(entry.condition)}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(entry.condition), 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
            _push(ssrRenderComponent(_component_UBadge, {
              color: entry.source === "Family" ? "info" : "primary",
              variant: "soft",
              size: "sm"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`${ssrInterpolate(entry.source)}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(entry.source), 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
            if (entry.wasEdited) {
              _push(ssrRenderComponent(_component_UBadge, {
                color: "warning",
                variant: "soft",
                size: "sm"
              }, {
                default: withCtx((_, _push2, _parent2, _scopeId) => {
                  if (_push2) {
                    _push2(` Edited `);
                  } else {
                    return [
                      createTextVNode(" Edited ")
                    ];
                  }
                }),
                _: 2
              }, _parent));
            } else {
              _push(`<!---->`);
            }
            _push(`</div><h3 class="mt-2 truncate font-bold text-slate-950 dark:text-white" data-v-c7dedc53>${ssrInterpolate(entry.title)}</h3><div class="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-slate-400" data-v-c7dedc53><span class="inline-flex items-center gap-1" data-v-c7dedc53>`);
            _push(ssrRenderComponent(_component_UIcon, {
              name: "i-lucide-clock-3",
              class: "size-3.5"
            }, null, _parent));
            _push(` ${ssrInterpolate(entry.time)}</span><span class="text-slate-300 dark:text-slate-700" data-v-c7dedc53>•</span><span data-v-c7dedc53>Severity ${ssrInterpolate(entry.severity)}/10</span><span class="text-slate-300 dark:text-slate-700" data-v-c7dedc53>•</span><span data-v-c7dedc53>${ssrInterpolate(entry.summary)}</span></div>`);
            if (entry.editedLabel) {
              _push(`<p class="mt-1 text-xs text-slate-400 dark:text-slate-500" data-v-c7dedc53>${ssrInterpolate(entry.editedLabel)}</p>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</button>`);
            if (entry.source === "Veteran") {
              _push(`<button type="button" class="grid size-10 shrink-0 place-items-center rounded-full text-slate-400 transition hover:bg-sky-50 hover:text-sky-600 dark:hover:bg-sky-950/40 dark:hover:text-sky-300"${ssrRenderAttr("aria-label", `Create private link for ${entry.title}`)} data-v-c7dedc53>`);
              _push(ssrRenderComponent(_component_UIcon, {
                name: "i-lucide-link",
                class: "size-4"
              }, null, _parent));
              _push(`</button>`);
            } else {
              _push(`<!---->`);
            }
            _push(`<button type="button" class="grid size-10 shrink-0 place-items-center rounded-full text-slate-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-300"${ssrRenderAttr("aria-label", `Delete ${entry.title}`)} data-v-c7dedc53>`);
            _push(ssrRenderComponent(_component_UIcon, {
              name: "i-lucide-trash-2",
              class: "size-4"
            }, null, _parent));
            _push(`</button></div></article>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<div class="py-1" data-v-c7dedc53><div class="flex items-center justify-between" data-v-c7dedc53><button type="button" class="grid size-8 place-items-center rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800" aria-label="Previous month" data-v-c7dedc53>`);
          _push(ssrRenderComponent(_component_UIcon, {
            name: "i-lucide-chevron-left",
            class: "size-4"
          }, null, _parent));
          _push(`</button><p class="font-bold text-slate-950 dark:text-white" data-v-c7dedc53>${ssrInterpolate(historyMonthLabel.value)}</p><button type="button" class="grid size-8 place-items-center rounded-full text-slate-500 hover:bg-slate-100 disabled:opacity-30 dark:text-slate-400 dark:hover:bg-slate-800" aria-label="Next month"${ssrIncludeBooleanAttr(!canShowNextHistoryMonth.value) ? " disabled" : ""} data-v-c7dedc53>`);
          _push(ssrRenderComponent(_component_UIcon, {
            name: "i-lucide-chevron-right",
            class: "size-4"
          }, null, _parent));
          _push(`</button></div><div class="mt-4 grid grid-cols-7 text-center text-xs font-semibold text-slate-500 dark:text-slate-400" data-v-c7dedc53><!--[-->`);
          ssrRenderList(weekDays, (day) => {
            _push(`<span data-v-c7dedc53>${ssrInterpolate(day)}</span>`);
          });
          _push(`<!--]--></div><div class="mt-3 grid grid-cols-7 gap-y-3 text-center" data-v-c7dedc53><!--[-->`);
          ssrRenderList(calendarDays.value, (day) => {
            _push(`<div class="flex justify-center" data-v-c7dedc53><button type="button" class="${ssrRenderClass([day.entry ? day.color : day.currentMonth ? "text-slate-400" : "text-slate-700", "relative grid size-8 place-items-center rounded-full text-xs font-bold"])}"${ssrRenderAttr("aria-label", day.entry ? `${day.label} has ${day.entryCount} ${day.entryCount === 1 ? "entry" : "entries"}` : day.label)} data-v-c7dedc53>`);
            if (day.entry) {
              _push(`<span class="relative inline-flex" data-v-c7dedc53>`);
              _push(ssrRenderComponent(_component_UIcon, {
                name: day.icon,
                class: "size-5"
              }, null, _parent));
              if (day.entryCount > 1) {
                _push(`<span class="absolute -right-1.5 -top-1.5 grid min-w-[0.85rem] place-items-center rounded-full bg-slate-950 px-0.5 text-[0.55rem] font-bold leading-none text-white dark:bg-white dark:text-slate-950" data-v-c7dedc53>${ssrInterpolate(day.entryCount)}</span>`);
              } else {
                _push(`<!---->`);
              }
              _push(`</span>`);
            } else {
              _push(`<span data-v-c7dedc53>${ssrInterpolate(day.date)}</span>`);
            }
            _push(`</button></div>`);
          });
          _push(`<!--]--></div></div>`);
        }
        _push(`<p class="mt-4 text-center text-xs leading-5 text-slate-500" data-v-c7dedc53> Swipe up on history to expand. </p><div class="mt-2 flex items-center justify-center gap-3 pb-1 text-xs font-semibold text-slate-500" data-v-c7dedc53>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/install",
          class: "hover:text-slate-700 dark:hover:text-slate-300"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`Install`);
            } else {
              return [
                createTextVNode("Install")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/privacy",
          class: "hover:text-slate-700 dark:hover:text-slate-300"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`Privacy`);
            } else {
              return [
                createTextVNode("Privacy")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/disclaimer",
          class: "hover:text-slate-700 dark:hover:text-slate-300"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`Disclaimer`);
            } else {
              return [
                createTextVNode("Disclaimer")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div></div></section></div>`);
      }
      _push(`</section></main>`);
      if (pendingDelete.value) {
        _push(`<div class="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/55 p-4 sm:items-center" data-v-c7dedc53><div class="w-full max-w-md rounded-[1.75rem] bg-white p-5 shadow-2xl dark:bg-slate-900" data-v-c7dedc53><p class="text-xs font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400" data-v-c7dedc53> Move to deleted </p><h3 class="mt-2 text-xl font-bold text-slate-950 dark:text-white" data-v-c7dedc53> Delete this entry? </h3><p class="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300" data-v-c7dedc53><span class="font-semibold text-slate-950 dark:text-white" data-v-c7dedc53>${ssrInterpolate(pendingDelete.value.title)}</span> will move to Deleted in your account settings. You can restore it later from there. </p><div class="mt-5 grid grid-cols-2 gap-3" data-v-c7dedc53><button type="button" class="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700" data-v-c7dedc53> Cancel </button><button type="button" class="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200" data-v-c7dedc53> Move to Deleted </button></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (isShareLinkOpen.value && shareLinkEntry.value) {
        _push(`<div class="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/55 p-4 sm:items-center" data-v-c7dedc53><div class="w-full max-w-md rounded-[1.75rem] bg-white p-5 shadow-2xl dark:bg-slate-900" data-v-c7dedc53><p class="text-xs font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400" data-v-c7dedc53> Private supporter link </p><h3 class="mt-2 text-xl font-bold text-slate-950 dark:text-white" data-v-c7dedc53> Share this entry </h3><p class="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300" data-v-c7dedc53> Create a one-time private URL for someone you trust to report what they observed about <span class="font-semibold text-slate-950 dark:text-white" data-v-c7dedc53>${ssrInterpolate(shareLinkEntry.value.summary || shareLinkEntry.value.condition_label)}</span>. </p>`);
        if (!shareLinkCreatedUrl.value) {
          _push(`<div class="mt-5 space-y-4" data-v-c7dedc53><label class="block" data-v-c7dedc53><span class="mb-2 block px-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400" data-v-c7dedc53>Link label (optional)</span><input${ssrRenderAttr("value", shareLinkLabel.value)} type="text" class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base font-medium text-slate-950 outline-none placeholder:text-slate-400 focus:border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white" placeholder="Example: Spouse, caregiver" data-v-c7dedc53></label><div class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950" data-v-c7dedc53><p class="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400" data-v-c7dedc53>Visible condition</p><p class="mt-1 font-semibold text-slate-950 dark:text-white" data-v-c7dedc53>${ssrInterpolate(shareLinkEntry.value.condition_label)}</p></div><button type="button" class="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white dark:bg-white dark:text-slate-950"${ssrIncludeBooleanAttr(isCreatingShareLink.value) ? " disabled" : ""} data-v-c7dedc53>${ssrInterpolate(isCreatingShareLink.value ? "Creating..." : "Create private link")}</button></div>`);
        } else {
          _push(`<div class="mt-5 space-y-4" data-v-c7dedc53><p class="break-all rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100" data-v-c7dedc53>${ssrInterpolate(shareLinkCreatedUrl.value)}</p><button type="button" class="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white" data-v-c7dedc53>`);
          _push(ssrRenderComponent(_component_UIcon, {
            name: shareLinkCopied.value ? "i-lucide-check" : "i-lucide-copy",
            class: "size-4"
          }, null, _parent));
          _push(` ${ssrInterpolate(shareLinkCopied.value ? "Copied to clipboard" : "Copy link")}</button></div>`);
        }
        if (shareLinkError.value) {
          _push(`<p class="mt-4 text-center text-sm font-medium text-red-600 dark:text-red-300" data-v-c7dedc53>${ssrInterpolate(shareLinkError.value)}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<button type="button" class="mt-4 w-full rounded-2xl px-4 py-2 text-sm font-semibold text-slate-500 dark:text-slate-400" data-v-c7dedc53> Close </button></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<!--]-->`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-c7dedc53"]]);

export { index as default };
//# sourceMappingURL=index-DgdHmxuI.mjs.map
