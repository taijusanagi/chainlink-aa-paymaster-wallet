import { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import Stripe from "stripe";

// this is to check the subscription status
// this end point is integrated with Chainlink
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    return res.status(400).json({
      status: false,
      error: "Invalid method. Only GET supported.",
    });
  }

  const { STRIPE_SECRET_KEY } = process.env;
  if (!STRIPE_SECRET_KEY) {
    return res.status(500).json({
      status: false,
      error: "Stripe secret key not set",
    });
  }

  const stripe = new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: "2022-11-15",
  });
};
export default handler;
