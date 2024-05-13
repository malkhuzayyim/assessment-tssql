import { describe, it, expect, beforeEach } from "vitest";
import { db, schema } from "../../db/client";
import { createAuthenticatedCaller, createCaller } from "../helpers/utils";
import { eq } from "drizzle-orm";
import { User } from "../../contracts";
 

describe("Plans Module", () => {
  let adminCaller: any;
  let userCaller: any;

  const admin:User = {
    email: "admin@mail.com",
    password: "P@ssw0rd",
    name: "test",
    timezone: "Asia/Riyadh",
    locale: "en",
    role: "ADMIN"
  };
  
  const user:User = {
    email: "mail@mail.com",
    password: "P@ssw0rd",
    name: "test",
    timezone: "Asia/Riyadh",
    locale: "en",
    role: "USER"
  };
  

  beforeEach(async () => {
    await createCaller({}).auth.register(user);
    await createCaller({}).auth.register(admin);

    const userInDb = await db.query.users.findFirst({
      where: eq(schema.users.email, user.email),
    });

    const adminInDb = await db.query.users.findFirst({
      where: eq(schema.users.email, user.email),
    });
    
    adminCaller = createAuthenticatedCaller({ userId: adminInDb!.id});
    userCaller = createAuthenticatedCaller({ userId: userInDb!.id });
  });

  // Test for creating a plan
  it("should allow an admin to create a plan", async () => {
    const plan = await adminCaller.plans.create({ name: "Premium", price: 200 });
    expect(plan.name).toBe("Premium");
    expect(plan.price).toBe(200);
  });

  it("should not allow a non-admin user to create a plan", async () => {
    await expect(userCaller.plans.create({ name: "Premium", price: 200 }))
      .rejects
      .toThrow("Unauthorized");
  });

  // Test for updating a plan
  it("should allow an admin to update a plan", async () => {
    const createdPlan = await adminCaller.plans.create({ name: "Standard", price: 150 });
    const updatedPlan = await adminCaller.plans.update({ id: createdPlan.id, price: 180 });
    expect(updatedPlan.price).toBe(180);
  });

  it("should not allow a non-admin user to update a plan", async () => {
    const createdPlan = await adminCaller.plans.create({ name: "Standard", price: 150 });
    await expect(userCaller.plans.update({ id: createdPlan.id, price: 180 }))
      .rejects
      .toThrow("Unauthorized");
  });

  // Test for reading plans
  it("should allow anyone to read plans", async () => {
    await adminCaller.plans.create({ name: "Basic", price: 100 });
    const plans = await userCaller.plans.read();
    expect(plans.length).toBeGreaterThan(0);
  });

  // Test for calculating upgrade price
  it("should calculate the correct upgrade price", async () => {
    const basicPlan = await adminCaller.plans.create({ name: "Basic", price: 100 });
    const premiumPlan = await adminCaller.plans.create({ name: "Premium", price: 300 });
    const upgradePrice = await userCaller.plans.calculateUpgradePrice({
      currentPlanId: basicPlan.id,
      newPlanId: premiumPlan.id,
      daysRemaining: 15
    });
    expect(upgradePrice.upgradePrice).toBe(100); // (300 - 100) / 30 * 15
  });

  it("should handle non-existent plans in upgrade price calculation", async () => {
    await expect(userCaller.plans.calculateUpgradePrice({
      currentPlanId: 999, // non-existent ID
      newPlanId: 1000, // non-existent ID
      daysRemaining: 15
    })).rejects.toThrow("One of the plans does not exist.");
  });
});