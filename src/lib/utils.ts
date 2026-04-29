import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * دمج اختصاصات `tailwind-merge` مع `clsx` لدعم الفئات الشرطية
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
