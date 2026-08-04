/*
 * EV Charge payment links used by the front-end demo.
 *
 * Keep this file free of passwords, private keys and API secrets.
 * Real PayPal and Apple Pay payments must be created and confirmed by the server.
 */
window.EV_PAYMENT_CONFIG = Object.freeze({
  mode: "demo",
  paypal: Object.freeze({
    officialUrl: "https://www.paypal.com/signin"
  }),
  applePay: Object.freeze({
    officialUrl: "https://www.apple.com/apple-pay/"
  })
});
