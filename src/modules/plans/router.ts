import { router, trpcError, protectedProcedure, publicProcedure } from "../../trpc/core";
import { z } from "zod";
import { schema, db } from "../../db/client";
import { eq } from "drizzle-orm";

export const plans = router({
  // Public read method to fetch all plans
  getAll: publicProcedure.query(async () => {
    try {
      const plans = await db.query.plans.findMany();
      return plans;
    } catch (error) {
      console.error("Error fetching plans", error);
      return [];
    }
  }),

  // Admin-only create method
  create: protectedProcedure
    .input(z.object({
      name: z.string(),
      price: z.number(),
      description: z.string().optional(),
      defaultUsers: z.number().optional(),
      pricePerUser: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        const [newPlan] = await db
          .insert(schema.plans)
          .values({
            ...input
          })
          .returning();
        return { success: true, plan: newPlan };
      } catch (error) {
        console.error("Error creating plan", error);
        throw new trpcError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create plan",
        });
      }
    }),

  // Admin-only update method
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      price: z.number().optional(),
      description: z.string().optional(),
      defaultUsers: z.number().optional(),
      pricePerUser: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        await db.update(schema.plans)
          .set(input)
          .where(eq(schema.plans.id, input.id));
        return { success: true };
      } catch (error) {
        console.error("Error updating plan", error);
        throw new trpcError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update plan",
        });
      }
    }),
    calculateUpgradeCost: protectedProcedure
    .input(z.object({
      currentPlanId: z.number(),
      newPlanId: z.number(),
      daysRemaining: z.number(),
    }))
    .query(async ({ input }) => {
      const { currentPlanId, newPlanId, daysRemaining } = input;

      const currentPlan = await db.query.plans.findFirst({
        where: eq(schema.plans.id, currentPlanId),
      });
      const newPlan = await db.query.plans.findFirst({
        where: eq(schema.plans.id, newPlanId),
      });

      if (!currentPlan || !newPlan) {
        throw new trpcError({
          code: "NOT_FOUND",
          message: "Plan not found",
        });
      }

      const priceDifference = newPlan.price - currentPlan.price;
      const daysInMonth = 30; // Assuming 30 days in a month for simplicity
      const proratedCost = priceDifference * (daysRemaining / daysInMonth);

      return {
        proratedCost,
      };
    }),
});

