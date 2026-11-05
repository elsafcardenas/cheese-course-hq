"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { ES, ES_PATTERNS } from "@/lib/i18n/es";

const SKIP = new Set(["SCRIPT", "STYLE", "TEXTAREA", "CODE", "PRE", "KBD"]);
const ORIGINAL = new WeakMap<Node, string>();

function translateText(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed || trimmed.length > 300) return null;
  const hit = ES[trimmed];
  if (hit !== undefined) return raw.replace(trimmed, hit);
  for (const [re, fn] of ES_PATTERNS) {
    const m = trimmed.match(re);
    if (m) return raw.replace(trimmed, fn(m));
  }
  return null;
}

function skip(el: Element | null) {
  for (let e = el; e; e = e.parentElement) {
    if (SKIP.has(e.tagName) || e.hasAttribute("data-no-translate") || e.getAttribute("contenteditable") === "true") return true;
  }
  return false;
}

function translateNode(n: Node) {
  if (n.nodeType === Node.TEXT_NODE) {
    if (skip(n.parentElement)) return;
    const current = n.nodeValue ?? "";
    const out = translateText(current);
    if (out !== null && out !== current) {
      ORIGINAL.set(n, current);
      n.nodeValue = out;
    }
    return;
  }
  if (n.nodeType !== Node.ELEMENT_NODE) return;
  const el = n as Element;
  if (skip(el)) return;
  for (const attr of ["placeholder", "title", "aria-label"]) {
    const v = el.getAttribute(attr);
    if (v) {
      const out = translateText(v);
      if (out && out !== v) el.setAttribute(attr, out);
    }
  }
  el.childNodes.forEach(translateNode);
}

/**
 * Spanish interface: swaps known interface text (menus, buttons, labels, statuses, dates) for its
 * Spanish version as pages render. What people type (tasks, captions, notes) is left as written.
 */
export function AutoTranslate({ lang }: { lang: "en" | "es" }) {
  const path = usePathname();
  useEffect(() => {
    document.documentElement.lang = lang;
    if (lang !== "es") return;
    translateNode(document.body);
    let queued = false;
    const pending = new Set<Node>();
    const obs = new MutationObserver((muts) => {
      for (const m of muts) {
        if (m.type === "characterData") pending.add(m.target);
        m.addedNodes.forEach((n) => pending.add(n));
        if (m.type === "attributes") pending.add(m.target);
      }
      if (!queued) {
        queued = true;
        requestAnimationFrame(() => {
          queued = false;
          obs.disconnect();
          pending.forEach(translateNode);
          pending.clear();
          obs.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ["placeholder", "title"] });
        });
      }
    });
    obs.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ["placeholder", "title"] });
    return () => obs.disconnect();
  }, [lang, path]);
  return null;
}
