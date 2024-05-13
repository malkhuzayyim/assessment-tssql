import { beforeAll, describe, expect, it } from "vitest";
import { db, schema } from "../../db/client";
import { createAuthenticatedCaller, createCaller } from "../helpers/utils";
import resetDb from "../helpers/resetDb";
import { eq } from "drizzle-orm";

describe("plans routes", async () => {
  let adminUserId: number;

  beforeAll(async () => {
    await resetDb();

    // Create a test admin user
    const adminUser = {
      email: "admin@mail.com",
      password: "Admin@123",
      timezone: "Asia/Riyadh",
      name: "Admin User",
      locale: "en",
      //role: "admin"
    };

    await createCaller({}).auth.register(adminUser);
    const userInDb = await db.query.users.findFirst({
      where: eq(schema.users.email, adminUser.email),
    });
    adminUserId = userInDb!.id;
  });

  describe("Public access to plans", () => {
    it("should allow anyone to read all plans", async () => {
      const publicCaller = createCaller({});
      const plans = await publicCaller.plans.getAll();
      expect(plans).toBeInstanceOf(Array);
    });
  });

  describe("Admin access to plans", () => {
    it("should allow only admins to create a new plan", async () => {
      const adminCaller = createAuthenticatedCaller({ userId: adminUserId });
      const newPlan = {
        name: "Enterprise",
        price: 299.99,
        description: "For large businesses"
      };
      const response = await adminCaller.plans.create(newPlan);
      expect(response.success).toBe(true);
      console.log(response);
      expect(response.plan.name).toBe(newPlan.name);
    });

    it("should allow only admins to update a plan", async () => {
      const adminCaller = createAuthenticatedCaller({ userId: adminUserId });
      const planToUpdate = await db.query.plans.findFirst();
      const response = await adminCaller.plans.update({
        id: planToUpdate!.id,
        name: "Updated Enterprise"
      });
      expect(response.success).toBe(true);
      const updatedPlan = await db.query.plans.findFirst({
        where: eq(schema.plans.id, planToUpdate!.id),
      });
      expect(updatedPlan!.name).toBe("Updated Enterprise");
    });
  });

  describe("Prorated cost calculation", () => {
    it("should calculate prorated upgrade cost correctly", async () => {
      const adminCaller = createAuthenticatedCaller({ userId: adminUserId });
      const basicPlanResponse = await adminCaller.plans.create({
        name: "Basic",
        price: 100.00
      });
      const premiumPlanResponse = await adminCaller.plans.create({
        name: "Premium",
        price: 200.00
      });
      let basicPlan = basicPlanResponse.plan;
      let  premiumPlan = premiumPlanResponse.plan;
    const proratedCostResponse = await adminCaller.plans.calculateUpgradeCost({
        currentPlanId: basicPlan.id,
        newPlanId: premiumPlan.id,
        daysRemaining: 15
      });
      const expectedCost = ((premiumPlan.price - basicPlan.price) * (15 / 30));
  expect(proratedCostResponse.proratedCost).toBeCloseTo(expectedCost);
    });
  });
});
