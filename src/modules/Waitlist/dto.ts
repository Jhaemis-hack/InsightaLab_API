import * as z from "zod/v4";

export const WaitlistDto = z.object({
  firstName: z.string().nonempty(),
  lastName: z.string().nonempty(),
  email: z.string().email("Invalid email format").nonempty(),
  userType: z.string().nonempty(),
});
export type IwaitlistDto = z.infer<typeof WaitlistDto>;
