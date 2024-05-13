# Assessment in Typescript & SQL

## Getting started

This repo runs using fastify, trpc, zod, drizzle, and sqlite.

It uses node 20 & pnpm.

To get started, run the following commands:
```
pnpm install
```

Initiate the Sqlite DB:
```
pnpm db:push
```

Then, you can run typechecking, linting, or testing via the following commands:
```
pnpm typecheck

pnpm lint

pnpm test:int
```

## Intro to the SaaS API design

This system has a few core modules that support a B2B SaaS setup.

The current API supports the following models:
- auth: login, register, email verify, password reset
- account: for user to manage his own account
- teams: for users to create teams

The next features to be added are related to billing, the subscriptions module would include four main tables:
- plans: this is the base definition for a plan, it includes plan name & price 
- subscriptions: this is the list of active subscriptions
- subscriptionActivations: this is the table where we track billing cycles for each paid "month" or "year"
- orders: an order when paid creates an "Activation" record

the lifecycle of a subscription is:
- user creates a team subscription, with a reference to a specific team they own and a plan choice from the system
- subscriptions, aslong as they are active, will always issue orders via background cron jobs (if an activation record doesn't exist for the current period)
- orders, when paid, create subscriptionActivations

more tables may exist in a more complete "realistic" scenario, but this is a simplified version of a subscriptions system.

## Problem Statement (required)

Define the plans module & write atleast 5 tests that verify the core functionality works in the plans module.

The module should support a number of method:
1. create & update methods, not publicly accessible, admin access only
2. read method, accessible publicly
3. a prorated upgrade price calculation method: the system should allow upgrading to a more expensive plan in the middle of a subscription, so, we need to create a method that can determine the price for an "upgrade", based on price difference between two plans and the number of days remaining in the currently paid cycle, you can assume all plans are monthly cycles only, no annual plans are to be considered here

The best way to test the endpoints/methods you are building is by running the integration tests and creating testing scenarios for the new plans module, in the integration testing directory, by following the conventions done by other tests.

Trpc won't work well with playground testing tools like postman.


## schema design implementation (bonus)

without defining all the other modules in the billing module, just define the shape of the tables to be defined for the following:
- subscriptions
- orders
- subscriptionActivations

And create some scaffolding for the tests, the tests would be failing initially, by simply defining the purpose of some of the core integration tests for these modules

## question (bonus)

If you were to introduce two more props to plans:

1. defaultUsers: number of users included in the plan by default
2. pricePerUser: price per additional user beyond the default

How would this affect the current plan upgrade calculation?

### answer here:

Introducing two additional properties—`defaultUsers` and `pricePerUser`—to the `plans` table can significantly affect the calculations related to upgrading plans, especially when calculating the prorated upgrade cost. Here's a detailed exploration of how these properties can be integrated and their impact:

#### New Properties Description
- **`defaultUsers`**: This property indicates the number of users included in the plan by default, which is part of the base offering of the plan.
- **`pricePerUser`**: This represents the cost per additional user that exceeds the number included by the `defaultUsers` property.

#### Impact on Plan Upgrade Calculation
When upgrading from one plan to another, particularly mid-cycle, the cost calculation needs to consider not just the base price difference but also the difference in value provided by any change in the `defaultUsers` count and the cost associated with additional users.

##### Scenario and Calculation Approach
Assume a scenario where a customer wants to upgrade their subscription in the middle of a billing cycle from Plan A to Plan B:

- **Plan A**: 
  - Price: $100 
  - `defaultUsers`: 5 
  - `pricePerUser`: $10
- **Plan B**: 
  - Price: $200
  - `defaultUsers`: 10
  - `pricePerUser`: $15

If a customer has 7 users, the prorated upgrade cost needs to consider:
- The difference in the base plan costs.
- The difference in costs due to user count changes, adjusted for the number of days remaining in the cycle.

**Step-by-Step Calculation**:
1. **Calculate the base price difference** for the remaining days in the cycle:
   - Base Price Difference = (Plan B Price - Plan A Price)
   - Pro-rata this difference for the remaining days in the cycle.

2. **Adjust for user count**:
   - For Plan A, since 7 users are registered and 5 are included, there is an additional charge for 2 users.
   - For Plan B, 10 users are included by default, so no additional user charge.
   - Calculate the extra cost incurred due to additional users in Plan A that would no longer apply in Plan B, again prorated for the remaining days in the cycle.

**Formula**:
`Total Upgrade Cost = (Base Price Difference * (Days Remaining / Total Days in Month)) +
((Extra Users Cost in Plan A - Extra Users Cost in Plan B) * (Days Remaining / Total Days in Month))`

Where:
- `Extra Users Cost in Plan A` = (User Count - defaultUsers in Plan A) * pricePerUser in Plan A
- `Extra Users Cost in Plan B` = (User Count - defaultUsers in Plan B) * pricePerUser in Plan B (if positive)

#### Conclusion
Adding `defaultUsers` and `pricePerUser` introduces complexity into the calculation but allows the pricing model to be more flexible and potentially more fair, as it adjusts to the actual usage and needs of the customer. The calculation now needs to handle varying user counts and their costs dynamically, adapting to what each plan specifically offers. This approach ensures that customers are charged fairly based on their actual usage relative to what their plans allow.

