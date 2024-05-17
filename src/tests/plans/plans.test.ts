import { beforeAll, describe, expect, it } from "vitest";
import { db, schema } from "../../db/client";
import { createAuthenticatedCaller, createCaller } from "../helpers/utils";
import resetDb from "../helpers/resetDb";
import { eq } from "drizzle-orm";
import { trpcError } from "../../trpc/core";

describe("plans routes", async () => {
  let adminId: number;
  let userId: number;

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

    const userInDb = await db.query.users.findFirst({
      where: eq(schema.users.email, user.email),
    });

    const adminInDb = await db.query.users.findFirst({
      where: eq(schema.users.email, admin.email),
    });

    adminId = adminInDb!.id;
    userId = userInDb!.id;
  });

  describe("Create Plan", async () => {
    it("should allow an admin user type to create a plan", async () => {
      const adminCaller = createAuthenticatedCaller({ userId: adminId });
      const plan = { name: "Basic", price: 10 };
      const planInDb = await adminCaller.plans.create(plan);
      expect(planInDb).toBeDefined();
      expect(planInDb!.name).toBe(plan.name);
      expect(planInDb!.price).toBe(plan.price);
      expect(planInDb!.id).toBeDefined();
    });

    it("should throw an error if user type is not an admin", async () => {
      const userCaller = createAuthenticatedCaller({ userId: userId });
      await expect(
        userCaller.plans.create({ name: "Basic", price: 10 })
      ).rejects.toThrowError(
        new trpcError({
          code: "UNAUTHORIZED",
        })
      );
    });
  });

  describe("Update Plan", async () => {
    it("should allow an admin user type to update a plan", async () => {
      const adminCaller = createAuthenticatedCaller({ userId: adminId });
      const plan = { name: "Basic", price: 10 };
      const planInDb = await adminCaller.plans.create(plan);
      const result = await adminCaller.plans.update({
        id: planInDb!.id,
        name: "Standard",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("Read Plans", async () => {
    it("should allow anyone to read all plans", async () => {});
  });
});
