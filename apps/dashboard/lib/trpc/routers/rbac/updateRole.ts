import { insertAuditLogs } from "@/lib/audit";
import { db, eq, schema } from "@/lib/db";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { requireUser, requireWorkspace, t } from "../../trpc";
const nameSchema = z
  .string()
  .min(3)
  .regex(/^[a-zA-Z0-9_:\-\.\*]+$/, {
    message:
      "Must be at least 3 characters long and only contain alphanumeric, colons, periods, dashes and underscores",
  });

export const updateRole = t.procedure
  .use(requireUser)
  .use(requireWorkspace)
  .input(
    z.object({
      id: z.string(),
      name: nameSchema,
      description: z.string().nullable(),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    const role = await db.query.roles.findFirst({
      where: (table, { and, eq }) =>
        and(eq(table.workspaceId, ctx.workspace.id), eq(table.id, input.id)),
    });

    if (!role) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message:
          "We are unable to find the correct role. Please try again or contact support@unkey.dev.",
      });
    }
    await db
      .transaction(async (tx) => {
        await tx.update(schema.roles).set(input).where(eq(schema.roles.id, role.id));
        await insertAuditLogs(tx, {
          workspaceId: ctx.workspace.id,
          actor: { type: "user", id: ctx.user.id },
          event: "role.update",
          description: `Updated role ${input.id}`,
          resources: [
            {
              type: "role",
              id: input.id,
              name: input.name,
            },
          ],
          context: {
            location: ctx.audit.location,
            userAgent: ctx.audit.userAgent,
          },
        });
      })
      .catch((err) => {
        console.error(err);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "We are unable to update the role. Please try again or contact support@unkey.dev.",
        });
      });
  });
