import { z } from "zod";

// ── listTemplates ─────────────────────────────────────────────────────────────

export const listTemplatesInputModel = z.undefined();

export const templateItemModel = z.object({
  id:          z.string(),
  title:       z.string(),
  description: z.string().nullable(),
  category:    z.enum(["feedback", "hr", "education", "events", "research", "health", "business", "personal"]),
  emoji:       z.string().nullable(),
  isPaid:      z.boolean(),
  usageCount:  z.number(),
});

export const listTemplatesOutputModel = z.array(templateItemModel);
