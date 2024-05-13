import { router, protectedProcedure, publicProcedure } from "../../trpc/core";
import { z } from "zod";
import { db, schema } from "../../db/client";
import { eq } from "drizzle-orm";
import { calculateProratedUpgradePrice } from "./model";

export const plans = router({
    create: protectedProcedure
        .input(z.object({ name: z.string(), price: z.number(), defaultUsers: z.number().optional(), pricePerUser: z.number().optional() }))
        .mutation(async ({ input }) => {
            const plan = await db.insert(schema.plans).values(input).returning();
            return plan;
        }),
    update: protectedProcedure
        .input(z.object({ id: z.number(), name: z.string().optional(), price: z.number().optional(), defaultUsers: z.number().optional(), pricePerUser: z.number().optional() }))
        .mutation(async ({ input }) => {
            const updatedPlan = await db.update(schema.plans).set(input).where(eq(schema.plans.id, input.id)).returning();
            return updatedPlan;
        }),
    read: publicProcedure
        .query(async () => {
            const plans = await db.query.plans.findMany();
            return plans;
        }),
        calculateUpgradePrice: publicProcedure
        .input(z.object({ currentPlanId: z.number(), newPlanId: z.number(), daysRemaining: z.number() }))
        .query(async ({ input }) => {
            const { currentPlanId, newPlanId, daysRemaining } = input;
            const currentPlan = await db.query.plans.findFirst({ where: eq(schema.plans.id, currentPlanId) });
            const newPlan = await db.query.plans.findFirst({ where: eq(schema.plans.id, newPlanId) });
            if (!currentPlan || !newPlan) {
                throw new Error('One of the plans does not exist.');
            }
            const upgradePrice = calculateProratedUpgradePrice(currentPlan.price, newPlan.price, daysRemaining);
            return { upgradePrice };
        }),
});