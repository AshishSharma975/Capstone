/**
 * cn.js — Merge Tailwind class names conditionally
 * Simple utility (no clsx/tailwind-merge dependency needed)
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}
