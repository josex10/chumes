import { z } from "zod";
import { RESEARCH_STATUS } from "@/lib/research/constants";

export const createResearchRequestSchema = z.object({
  eventId: z.string().uuid(),
  title: z
    .string()
    .trim()
    .min(1, "Escribí qué hay que investigar.")
    .max(80, "Usá un título más corto."),
});

export const addResearchNoteSchema = z.object({
  requestId: z.string().uuid(),
  body: z
    .string()
    .trim()
    .min(1, "Escribí la nota.")
    .max(2000, "La nota es demasiado larga."),
});

export const researchRequestStatusSchema = z.enum([
  RESEARCH_STATUS.OPEN,
  RESEARCH_STATUS.WAITING_CLIENT,
  RESEARCH_STATUS.DONE,
]);

export type CreateResearchRequestValues = z.infer<
  typeof createResearchRequestSchema
>;
export type AddResearchNoteValues = z.infer<typeof addResearchNoteSchema>;
