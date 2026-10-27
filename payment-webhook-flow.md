# Crypto webhook flow (implement before live payments)

1. Create a pending order server-side using a product ID from the database.
2. Create the invoice with the processor, passing your internal order UUID as merchant order ID.
3. Store the processor's payment/invoice ID and return the hosted invoice URL.
4. On webhook:
   - read the raw request body exactly as required by the provider
   - validate the provider signature using the secret and official current docs
   - reject invalid signatures
   - deduplicate provider event/payment IDs using `payment_events`
   - fetch/verify payment status with the provider API if required
   - verify order ID, expected amount, currency, and final/confirmed status
   - only then transition order to `payment_confirmed`
5. Provision proxy package from the reseller API using the order UUID as customer reference.
6. Save credentials securely, then mark order `fulfilled`.
7. If provisioning fails after payment, retry safely or flag for admin intervention/refund.
8. Never provision from a browser redirect or a user-supplied "paid" flag.

Do not copy example signature logic from random blogs. Use the payment processor's current official documentation for the exact signature algorithm and headers.
