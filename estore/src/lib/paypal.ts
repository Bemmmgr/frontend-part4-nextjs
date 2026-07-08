// 078 - generate access token
const base = process.env.PAYPAL_API_URL || "https://api-m.sandbox.paypal.com";

export const paypal = {
  // 080 - create order & capture payment request
  createOrder: async function createOrder(price: number) {
    const accessToken = await generateAccessToken();
    const url = `${base}/v2/checkout/orders`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: price.toFixed(2),
            },
          },
        ],
      }),
    });

    return handleResponse(response);
  },

  capturePayment: async function capturePayment(orderId: string) {
    const accessToken = await generateAccessToken();
    const url = `${base}/v2/checkout/orders/${orderId}/capture`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return handleResponse(response);
  },
};

// generate access token
async function generateAccessToken() {
  // get client ID and app secret
  const { PAYPAL_CLIENT_ID, PAYPAL_APP_SECRET } = process.env;
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_APP_SECRET}`).toString(
    "base64",
  );

  const response = await fetch(`${base}/v1/oauth2/token`, {
    method: "POST",
    body: "grant_type=client_credentials",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  const jsonData = await handleResponse(response);
  return jsonData.access_token;
}

async function handleResponse(response: Response) {
  if (response.ok) {
    return response.json();
  }

  const errorText = await response.text();

  let errorData:
    | {
        name?: string;
        message?: string;
        debug_id?: string;
        details?: { issue?: string; description?: string }[];
      }
    | undefined;

  try {
    errorData = JSON.parse(errorText) as {
      name?: string;
      message?: string;
      debug_id?: string;
      details?: { issue?: string; description?: string }[];
    };
  } catch {
    throw new Error(errorText || "PayPal request failed");
  }

  const details = errorData.details
    ?.map((detail) => detail.description || detail.issue)
    .filter(Boolean)
    .join(" ");

  throw new Error(
    [
      errorData.message || errorData.name || "PayPal request failed",
      details,
      errorData.debug_id ? `Debug ID: ${errorData.debug_id}` : undefined,
    ]
      .filter(Boolean)
      .join(" "),
  );
}

export { generateAccessToken };
