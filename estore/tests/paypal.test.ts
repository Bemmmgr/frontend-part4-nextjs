import { expect, test } from "@jest/globals";
import { generateAccessToken } from "@/lib/paypal";

// 079 - jest testing for access token
// test to generate access token from paypal
test("generates token from paypal", async () => {
  const tokenResponse = await generateAccessToken();
  expect(typeof tokenResponse).toBe("string");
  expect(tokenResponse.length).toBeGreaterThan(0);
});
