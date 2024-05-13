import { beforeAll, describe, expect, it } from "vitest";
import { router, trpcError, protectedProcedure, publicProcedure } from "../../trpc/core";
import { z } from "zod";
import { schema, db } from "../../db/client";
import { eq } from "drizzle-orm";
describe("Orders Module", () => {
    beforeAll(async () => {
      // Preparation tasks such as resetting the database
    });
  
    it("should record a new order when a subscription is made", async () => {
      // Test order creation upon new subscription
      // Expectations: Order is correctly linked to a subscription and recorded with an initial status
    });
  
    it("should update the status of an order", async () => {
      // Test updating the status of an order to 'paid' or 'cancelled'
      // Expectations: Order status in the database reflects the change accurately
    });
  });