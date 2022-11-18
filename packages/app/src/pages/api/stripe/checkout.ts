import { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import Stripe from "stripe";

const checkout = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(400).json({
      error: "Invalid method. Only POST supported.",
    });
  }

  const { STRIPE_SECRET_KEY, STRIPE_PRICE_ID, NEXT_PUBLIC_AUTH_DOMAIN: domain } = process.env;

  if (!STRIPE_SECRET_KEY) {
    return res.status(500).json({
      error: "Stripe secret key not set",
    });
  }

  if (!STRIPE_PRICE_ID) {
    return res.status(500).json({
      error: "Stripe price id not set",
    });
  }

  if (!domain) {
    return res.status(500).send("Missing NEXT_PUBLIC_AUTH_DOMAIN environment variable");
  }

  const token = await getToken({ req });
  const walletAddress = token?.sub;

  if (!walletAddress) {
    return res.status(401).json({
      error: "Must be logged in to create a checkout session",
    });
  }

  const stripe = new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: "2022-11-15",
  });

  // Check for stripe customers already associated with authenticated wallet address
  const customers = await stripe.customers.search({
    query: `metadata["walletAddress"]:"${walletAddress}"`,
  });

  let customer;
  if (customers.data.length > 0) {
    // If there is already a customer for this wallet, use it
    customer = customers.data[0];
  } else {
    // Otherwise create a new customer associated with this wallet
    customer = await stripe.customers.create({
      metadata: {
        walletAddress,
      },
    });
  }

  // Finally, create a new checkout session for the customer to send to the client-side
  const session = await stripe.checkout.sessions.create({
    customer: customer.id,
    success_url: domain,
    line_items: [{ price: STRIPE_PRICE_ID, quantity: 1 }],
    cancel_url: domain,
    mode: "subscription",
  });

  return res.status(200).json(session);
};

export default checkout;
