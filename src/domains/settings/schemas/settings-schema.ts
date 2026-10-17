import { z } from "zod";

export const userSettingsSchema = z.object({
	bmrFormula: z.enum(["mifflin", "harris"]),
});
