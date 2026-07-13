// 010 - contants
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "EStore";
export const APP_DESCRIPTION =
  process.env.NEXT_PUBLIC_APP_DESCRIPTION ||
  "A modern ecommerce store built with Next.js";
export const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";
export const LATEST_PRODUCTS_LIMIT =
  Number(process.env.LATEST_PRODUCTS_LIMIT) || 4;

export const CART_COOKIE = "sessionCartId";
export const CART_MAX_AGE = 60 * 60 * 24 * 30;
export const TAX_RATE = 0.15;
export const SHIPPING_PRICE = 10;
export const FREE_SHIPPING_MIN_PRICE = 60;

export const signInDefaultValue = {
  email: "",
  password: "",
};

export const signUpDefaultValue = {
  name: "",
  email: "",
  password: "",
  confirmpassword: "",
};

export const shippingAddressDefaultValues = {
  fullName: "",
  streetAddress: "",
  city: "",
  postalCode: "",
  country: "",
};

export const PAYMENT_METHODS = process.env.PAYMENT_METHODS
  ? process.env.PAYMENT_METHODS.split(", ")
  : ["PayPal", "Stripe", "CashOnDelivery"];
export const DEFAULT_PAYMENT_METHOD =
  process.env.DEFAULT_PAYMENT_METHOD || "PayPal";

// 087 - get my orders action
export const PAGE_SIZE = Number(process.env.PAGE_SIZE) || 12;
