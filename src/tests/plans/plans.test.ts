import { beforeAll, describe, expect, it } from "vitest";
import { db, schema } from "../../db/client";
import { createAuthenticatedCaller, createCaller } from "../helpers/utils";
import resetDb from "../helpers/resetDb";
import { eq } from "drizzle-orm";

describe("plans routes", async () => {
  let adminId: number;

  beforeAll(async () => {
    await resetDb();

    const admin = {
      email: "admin@mail.com",
      password: "P@ssw0rd",
      name: "Admin",
      timezone: "Asia/Riyadh",
      locale: "en",
      isAdmin: true,
    };

    const user = {
      email: "user@mail.com",
      password: "P@ssw0rd",
      name: "User",
      timezone: "Asia/Riyadh",
      locale: "en",
      isAdmin: false,
    };

    await createCaller({}).auth.register(admin);
    await createCaller({}).auth.register(user);

    const adminInDb = await db.query.users.findFirst({
      where: eq(schema.users.email, admin.email),
    });

    adminId = adminInDb!.id;
  });

  describe("Create Plan", async () => {
    it("should allow an admin user type to create a plan", async () => {
      const adminCaller = createAuthenticatedCaller({ userId: adminId });
      const plan = { name: "Basic", price: 10 }
      const planInDb = await adminCaller.plans.create(plan);
      expect(planInDb).toBeDefined();
      expect(planInDb!.name).toBe(plan.name);
      expect(planInDb!.price).toBe(plan.price);
      expect(planInDb!.id).toBeDefined();
    });
  });

  describe("Update Plan", async () => {});

  describe("Read Plans", async () => {
    it("should allow anyone to read all plans", async () => {});
  });
});
