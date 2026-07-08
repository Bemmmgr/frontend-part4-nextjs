import { expect, jest, test } from "@jest/globals";
import { generateAccessToken, paypal } from "@/lib/paypal";
import { mock } from "node:test";

// 079 - jest testing for access token
// test to generate access token from paypal
test("generates token from paypal", async () => {
  const tokenResponse = await generateAccessToken();
  expect(typeof tokenResponse).toBe("string");
  expect(tokenResponse.length).toBeGreaterThan(0);
});

// 081 - test to create a paypal order
test("creates a paypal order", async () => {
  const price = 10.0;

  const orderRes = await paypal.createOrder(price);
  console.log(orderRes);

  expect(orderRes).toHaveProperty("id");
  expect(orderRes.status).toBe("CREATED");
});

// test to capture payment with mock order
test("simulate capyuring a payment from an order", async () => {
  const orderId = "101";

  const mockCapturePayment = jest
    .spyOn(paypal, "capturePayment")
    .mockResolvedValue({
      status: "COMPLETED",
    });

  const captureRes = await paypal.capturePayment(orderId);
  expect(captureRes).toHaveProperty("status", "COMPLETED");

  mockCapturePayment.mockRestore();
});
