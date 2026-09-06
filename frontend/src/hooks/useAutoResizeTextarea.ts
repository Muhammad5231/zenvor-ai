"use client";

import { useEffect, useRef } from "react";

/**
 * Grows a <textarea> to fit its content as the user types, up to an
 * optional max height (after which it scrolls internally instead of
 * pushing the rest of the layout around).
 *
 * Usage:
 *   const textareaRef = useAutoResizeTextarea(value, { maxHeight: 240 });
 *   <textarea ref={textareaRef} value={value} ... />
 */
export function useAutoResizeTextarea<T extends HTMLTextAreaElement>(
  value: string,
  options?: { minHeight?: number; maxHeight?: number }
) {
  const ref = useRef<T | null>(null);
  const { minHeight, maxHeight = 320 } = options || {};

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Reset first so shrinking (e.g. after clearing the input) is measured
    // correctly instead of only ever growing.
    node.style.height = "auto";

    const nextHeight = Math.max(
      minHeight ?? 0,
      Math.min(node.scrollHeight, maxHeight)
    );

    node.style.height = `${nextHeight}px`;
    node.style.overflowY = node.scrollHeight > maxHeight ? "auto" : "hidden";
  }, [value, minHeight, maxHeight]);

  return ref;
}