import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function createSlug(text: string): string {
  if (!text) return "";
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

export function createSlugWithId(id: number | string, title: string): string {
  return `${id}-${createSlug(title)}`;
}

export function getIdFromSlug(slug: string): number | null {
  const match = slug.match(/^(\d+)/);
  return match ? parseInt(match[1]) : null;
}
