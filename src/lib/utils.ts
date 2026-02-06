import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function createSlug(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')     // Space to -
    .replace(/[^\w\u0621-\u064A-]+/g, '') // Keep alphanumeric and Arabic chars
    .replace(/--+/g, '-')     // Double - to single -
    .replace(/^-+/, '')       // Trim from start
    .replace(/-+$/, '');      // Trim from end
}
