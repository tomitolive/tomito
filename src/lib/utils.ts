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

const DOODSTREAM_MIRRORS: Record<string, string> = {
  "doodstream.com": "playmogo.com",
};

export function fixEmbedUrl(url: string): string {
  if (!url) return url;
  const match = url.match(/^https?:\/\/([^/]+)(\/.*)?$/i);
  if (!match) return url;
  const host = match[1].toLowerCase();
  const replacement = DOODSTREAM_MIRRORS[host];
  if (!replacement) return url;
  const cleanPath = match[2] || "";
  const normalizedPath = cleanPath.replace(/^\/(?:embed|d)\//i, "/e/");
  return `https://${replacement}${normalizedPath}`;
}
