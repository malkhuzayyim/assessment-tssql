import { beforeAll, describe, it, expect } from "vitest";
import resetDb from "../helpers/resetDb";
import { createAuthenticatedCaller, createCaller } from "../helpers/utils";
import { eq } from "drizzle-orm";
import { db, schema } from "../../db/client";

describe("subscriptions routes", async () => {
  let adminId: number;

  beforeAll(async () => {
    await resetDb();

    const admin = {
      email: "user@mail.com",
      password: "P@ssw0rd",
      name: "User",
      timezone: "Asia/Riyadh",
      locale: "en",
      isAdmin: true,
    };

    await createCaller({}).auth.register(admin);

    const adminInDb = await db.query.users.findFirst({
      where: eq(schema.users.email, admin.email),
    });

    adminId = adminInDb!.id;
  });

  describe("Subscription Creation", async () => {
    /*
    checks the basic functionality of creating and 
    saving a Subscription entity in the database.
    */
    it("should create a subscription", async () => {
      const adminCaller = createAuthenticatedCaller({ userId: adminId });
      const team = { name: "Black Panther" };
      await adminCaller.teams.create(team);

      const createdTeam = await adminCaller.teams.get();

      const plan = { name: "Basic", price: 10 };
      const planInDb = await adminCaller.plans.create(plan);

      const subscription = {
        teamId: createdTeam[0]!.id,
        planId: planInDb?.id,
        isActive: true,
        createdAt: new Date(),
      };

      const subscriptionInDb = await adminCaller.subscription.create(team);
      expect(subscriptionInDb).toBeDefined();
      expect(subscriptionInDb!.teamId).toBe(subscription.teamId);
    });

    /*
    checks the basic functionality of updating and 
    saving a Subscription entity in the database.
    */
    it("should update subscription", async () => {});

    /*
    ensures that the Subscription entity can 
    be properly activated and deactivated.
    */
    it("should activate/deactivate subscription", async () => {});
  });
});
