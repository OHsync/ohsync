import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

import { commonValidations } from "@/common/utils/commonValidation";

extendZodWithOpenApi(z);

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(), // Email address as a string.
  first_name: z.string(), // First name, no length constraint needed.
  last_name: z.string(), // Last name, no length constraint needed.

  access_token: z.string(), // OAuth access token, storing as a string.
  refresh_token: z.string().optional(), // Optional OAuth refresh token, storing as a string.
  token_expiration: z.date(), // Token expiration date and time.

  is_active: z.boolean(), // Boolean to track active/deactivated status.
  ical_link: z.string().optional(), // Optional iCal link, stored as a string.

  created_at: z.date(), // Timestamp for when the user was created in your system.
  updated_at: z.date(), // Timestamp for the last update.
});

export type User = z.infer<typeof UserSchema>;

// Input Validation for 'GET users/:id' endpoint
export const GetUserSchema = z.object({
  params: z.object({ id: commonValidations.id }),
});
