import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

// this is to send chainlink request tx
// this is called when user create or renew the offchain gas payment subscription
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

  const stripe = new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: "2022-11-15",
  });
};
export default handler;
