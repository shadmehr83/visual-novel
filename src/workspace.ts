import { z } from "zod";
import { useState, useEffect } from "react";
export const workspaceSchema = z.object({
  previewLocked: z.boolean().default(true),
  previewCustom: z.boolean().default(false),
  previewWidth: z.number().min(280).max(3200).default(1000),
  previewHeight: z.number().min(180).max(1800).default(600),
  topDockHeight: z.number().min(140).max(460).default(240),
  splitDocks: z.boolean().default(false),
  font: z
    .enum(["Arial", "Verdana", "Trebuchet MS", "Georgia", "monospace"])
    .default("Arial"),
  fontSize: z.number().min(10).max(20).default(12),
  libraryCollapsed: z.boolean().default(false),
  libraryWidth: z.number().min(160).max(400).default(233),
  controlsWidth: z.number().min(250).max(450).default(290),
  previewScale: z.number().min(0.5).max(2).default(1),
  bottomHeight: z.number().min(100).max(600).default(200),
  dialogueMode: z.enum(["pinned", "page", "hidden"]).default("pinned"),
  theme: z.enum(["dark", "light", "warm"]).default("dark"),
  panels: z.record(z.string().regex(/^#[a-fA-F0-9]{6}$/)).default({}),
  help: z.boolean().default(true),
});
export type WorkspaceSettings = z.infer<typeof workspaceSchema>;
export const defaults = () => workspaceSchema.parse({});
export function useWorkspace() {
  const [settings, setSettings] = useState<WorkspaceSettings>(() => {
    try {
      return workspaceSchema.parse(
        JSON.parse(localStorage.getItem("stillframe-workspace") || "{}"),
      );
    } catch {
      return defaults();
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem("stillframe-workspace", JSON.stringify(settings));
    } catch {}
  }, [settings]);
  return [settings, setSettings] as const;
}
export function contrast(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return ((n >> 16) & 255) * 0.299 +
    ((n >> 8) & 255) * 0.587 +
    (n & 255) * 0.114 >
    145
    ? "#17242e"
    : "#e7e9e4";
}
