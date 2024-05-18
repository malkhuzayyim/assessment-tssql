import { beforeAll, describe, it } from "vitest";
import resetDb from "../helpers/resetDb";
import { createCaller } from "../helpers/utils";
import { eq } from "drizzle-orm";
import { db, schema } from "../../db/client";

describe("subscription activation routes", async () => {
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

  describe("subscription activation creation", async () => {
    /*
    verifies that a subscription activation
    can be created successfully.
    */
    it("should create a subscription activation", async () => {});

    /*
    checks that a subscription activation 
    can be correctly associated with an order.
    */
    it("should associate an activation with an order", async () => {});

    /**/
    it("should check if subscription activation exists for the current period", async () => {});
  });
});
