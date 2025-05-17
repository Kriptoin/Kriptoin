import { z } from "zod";

export const formSchema = z
  .object({
    name: z.string().max(20, { message: "Name must be at most 20 characters" }),
    amount: z.coerce
      .number()
      .min(0.0001, { message: "Amount must be at least 0.0001" }),
    message: z
      .string()
      .min(1, { message: "Message must be at least 1 character" })
      .max(250, { message: "Message must be at most 250 characters" }),
    anonymous: z.boolean(),
  })
  .refine(
    ({ anonymous, name }) => {
      if (!anonymous && name.length === 0) {
        return false;
      }
      return true;
    },
    {
      message: "Name must be at least 1 character",
      path: ["name"],
    }
  );

export const messageApprovalSchema = z.object({
  message: z
    .string()
    .min(1, { message: "Message must be at least 1 character" })
    .max(250, { message: "Message must be at most 250 characters" }),
});
