import {
  router,
  protectedProcedure,
  trpcError,
  publicProcedure,
} from "../../trpc/core";
import { z } from "zod";
import { db, schema } from "../../db/client";
import { eq } from "drizzle-orm";
import { upgradePriceCalculation } from "./model";

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
        name: z.string().optional(),
        price: z.number().optional(),
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
  get: publicProcedure.query(async () => {
    try {
      const plans = await db.query.plans.findMany();
      return plans;
    } catch (error) {
      console.error("Error fetching plans", error);
      return [];
    }
  }),
  calculateUpgradePrice: publicProcedure
    .input(
      z.object({
        currentPlanId: z.number(),
        newPlanId: z.number(),
        daysRemaining: z.number(),
      })
    )
    .query(async ({ input }) => {
      const { currentPlanId, newPlanId, daysRemaining } = input;

      if (currentPlanId === newPlanId) {
        throw new Error("Plans can not be same.");
      }

      const newPlan = await db.query.plans.findFirst({
        where: eq(schema.plans.id, newPlanId),
      });

      const currentPlan = await db.query.plans.findFirst({
        where: eq(schema.plans.id, currentPlanId),
      });

      if (!newPlan) {
        throw new Error("Invalid a plan to upgrade to.");
      }

      if (!currentPlan) {
        throw new Error("Invalid a plan to upgrade from.");
      }

      const upgradePrice = upgradePriceCalculation({
        currentPrice: currentPlan.price,
        newPrice: newPlan.price,
        daysRemaining,
      });
      return { upgradePrice };
    }),
});
