import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { z } from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateErrorMessages(errors: z.ZodError) {
  return errors.issues
    .map((issue) => `${issue.path}: ${issue.message}`)
    .join("\n");
}