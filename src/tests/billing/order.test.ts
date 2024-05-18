import { beforeAll, describe, it, expect } from "vitest";
import resetDb from "../helpers/resetDb";
import { createAuthenticatedCaller, createCaller } from "../helpers/utils";
import { eq } from "drizzle-orm";
import { db, schema } from "../../db/client";

describe("order routes", async () => {
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

  /*
    checks the basic functionality of creating 
    an order entity in the database and associate
    it to a subscription.
  */
  describe("order creation", async () => {
    it("should create an order", async () => {});
  });

  /*
    Verifies that the payment status of an order 
    can be updated correctly. For example, updating
    the status from 'Pending' to 'Paid'
  */
  it("should update the payment status of an order", async () => {});

  /*
    checks that creating an order with invalid data 
    (e.g., negative amount) throws an error.
  */
  it("should throw an error for invalid order creation", async () => {});

  /*
    ensure that duplicate orders for the same subscription 
    within the same period are not allowed.
  */
  it("should not allow duplicate orders for the same subscription in the same period", async () => {});
});
