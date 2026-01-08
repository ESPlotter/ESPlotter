import { useEffect, useRef } from 'react';

import type { EChartsType } from 'echarts';

type Hotkey =
  | { key: string; ctrl?: boolean; meta?: boolean; shift?: boolean; alt?: boolean }
  | ((e: KeyboardEvent) => boolean);

type UseEChartsHotkeyOpts = {
  enabled?: boolean;
  active?: boolean;
  ignoreWhenTyping?: boolean;
  preventDefault?: boolean;
  stopPropagation?: boolean;
};

function matchHotkey(e: KeyboardEvent, hk: Exclude<Hotkey, (e: KeyboardEvent) => boolean>) {
  const key = hk.key.length === 1 ? hk.key.toLowerCase() : hk.key;
  const pressed = e.key.length === 1 ? e.key.toLowerCase() : e.key;

  if (pressed !== key) return false;
  if (hk.ctrl !== undefined && e.ctrlKey !== hk.ctrl) return false;
  if (hk.meta !== undefined && e.metaKey !== hk.meta) return false;
  if (hk.shift !== undefined && e.shiftKey !== hk.shift) return false;
  if (hk.alt !== undefined && e.altKey !== hk.alt) return false;
  return true;
}

function isTypingTarget(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName?.toLowerCase();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return tag === 'input' || tag === 'textarea' || (el as any).isContentEditable;
}

export function useChartsHotkey(
  getChart: () => EChartsType | null,
  hotkey: Hotkey,
  action: (chart: EChartsType, e: KeyboardEvent) => void,
  opts: UseEChartsHotkeyOpts = {},
) {
  const {
    enabled = true,
    active = true,
    ignoreWhenTyping = true,
    preventDefault = true,
    stopPropagation = false,
  } = opts;

  // avoid re-subscribing the listener if action changes
  const actionRef = useRef(action);
  actionRef.current = action;

  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (!active) return;
      if (ignoreWhenTyping && isTypingTarget(e.target)) return;

      const ok = typeof hotkey === 'function' ? hotkey(e) : matchHotkey(e, hotkey);

      if (!ok) return;

      const chart = getChart();
      if (!chart || chart.isDisposed()) return;

      if (preventDefault) e.preventDefault();
      if (stopPropagation) e.stopPropagation();

      actionRef.current(chart, e);
    };

    window.addEventListener('keydown', onKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [enabled, active, ignoreWhenTyping, preventDefault, stopPropagation, getChart, hotkey]);
}
