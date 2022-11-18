import { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import Stripe from "stripe";

// this is to check the current user subscription status
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(400).json({
      status: false,
      error: "Invalid method. Only POST supported.",
    });
  }

  const { STRIPE_SECRET_KEY } = process.env;
  if (!STRIPE_SECRET_KEY) {
    return res.status(500).json({
      status: false,
      error: "Stripe secret key not set",
    });
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

  // Find associated stripe customer with user wallet
  const customers = await stripe.customers.search({
    query: `metadata["walletAddress"]:"${walletAddress}"`,
  });

  if (customers.data.length === 0) {
    // If there is no customer, then we know there is no subscription
    return res.status(200).json({ status: false, message: `User ${walletAddress} has no subscription.` });
  }

  // If there is a customer, then we can check if they have a subscription
  const customer = customers.data[0];
  const subscriptions = await stripe.subscriptions.list({
    customer: customer.id,
  });

  if (subscriptions?.data.length === 0) {
    // If there is no subscription, return
    return res.status(200).json({ status: false, message: `User ${walletAddress} has no subscription.` });
  }

  // If there is a subscription, return the subscription ID
  return res
    .status(200)
    .json({ status: true, message: `User ${walletAddress} has subscription with ID ${subscriptions?.data[0].id}` });
};
export default handler;
