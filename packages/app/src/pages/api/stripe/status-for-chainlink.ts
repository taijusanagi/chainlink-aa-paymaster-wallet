import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

// this is to check the subscription status
// this end point is called by Chainlink
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

  // const stripe = new Stripe(STRIPE_SECRET_KEY, {
  //   apiVersion: "2022-11-15",
  // });

  const { paymentId } = req.query;

  // This is just the debug
  // this should be removed for prod

  if (!paymentId) {
    return res.status(500).json({
      status: false,
      error: "Stripe secret key not set",
    });
  }

  console.log("paymentId:", paymentId);

  // this is debug for test chainlink integration effectively
  if (paymentId.indexOf("debug-mode-only-for-admin-account-") >= 0) {
    // this is my test account
    return res.status(200).json({ status: true, account: "0x29893eEFF38C5D5A1B2F693e2d918e618CCFfdD8" });
  }
  // for debug

  // implement
  // this is error
  return res.status(500).json({
    status: false,
    error: "Subscription id is invalid",
  });

  // hardcode for the testing
};
export default handler;
