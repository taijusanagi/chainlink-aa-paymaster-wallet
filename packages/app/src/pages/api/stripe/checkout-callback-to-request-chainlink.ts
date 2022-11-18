// https://github.com/dijonmusters/build-a-saas-with-next-js-supabase-and-stripe/blob/master/21-subscribe-to-stripe-webhooks-using-next-js-api-routes/pages/api/stripe-hooks.js

import { buffer } from "micro";
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

  const { STRIPE_SECRET_KEY, STRIPE_SIGNING_SECRET } = process.env;
  if (!STRIPE_SECRET_KEY) {
    return res.status(500).json({
      status: false,
      error: "Stripe secret key not set",
    });
  }

  if (!STRIPE_SIGNING_SECRET) {
    return res.status(500).json({
      status: false,
      error: "Signing secret not set",
    });
  }

  const stripe = new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: "2022-11-15",
  });
  const signature = req.headers["stripe-signature"];

  if (typeof signature !== "string") {
    return res.status(500).json({
      status: false,
      error: "Request signature is invalid",
    });
  }

  const signingSecret = STRIPE_SIGNING_SECRET;

  const reqBuffer = await buffer(req);
  let event;

  try {
    event = stripe.webhooks.constructEvent(reqBuffer, signature, signingSecret);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log(error);
    return res.status(400).send(`Webhook error: ${error.message}`);
  }

  console.log({ event });

  return res.status(200).json({ status: true, event });
};
export default handler;
