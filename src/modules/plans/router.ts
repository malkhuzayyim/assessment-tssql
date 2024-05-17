import { router, protectedProcedure, trpcError } from "../../trpc/core";
import { z } from "zod";
import { db, schema } from "../../db/client";
import { eq } from "drizzle-orm";

export const plans = router({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        price: z.number(),
      })
    )
    .mutation(async ({ ctx: { user }, input }) => {
      const { userId } = user;

      try {
        const userInDb = await db.query.users.findFirst({
          where: eq(schema.users.id, userId),
        });
        if (!userInDb!.isAdmin) {
          throw new trpcError({
            code: "UNAUTHORIZED",
          });
        }
        const [createdPlan] = await db
          .insert(schema.plans)
          .values({
            ...input,
          })
          .returning();
        return createdPlan;
      } catch (error) {
        throw error;
      }
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string(),
        price: z.number(),
      })
    )
    .mutation(async ({ ctx: { user }, input }) => {
      const { userId } = user;

      try {
        const userInDb = await db.query.users.findFirst({
          where: eq(schema.users.id, userId),
        });
        if (!userInDb!.isAdmin) {
          throw new trpcError({
            code: "UNAUTHORIZED",
          });
        }
        db.update(schema.plans).set(input).where(eq(schema.plans.id, input.id));
        return { success: true };
      } catch (error) {
        throw error;
      }
    }),
});
