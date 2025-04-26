import { z } from "zod";
import { formSchema } from "./schemas";

export type TipFormData = z.infer<typeof formSchema>;