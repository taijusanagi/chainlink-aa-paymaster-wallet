import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

// this is to check the subscription status
// this end point is called by Chainlink
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  console.log("This is called by the chainlink to fulfill the request");

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

  const { paymentId } = req.query;
  console.log("paymentId", paymentId);

  // This is just the debug
  // this should be removed for prod
  if (!paymentId || typeof paymentId !== "string") {
    return res.status(500).json({
      status: false,
      error: "Stripe secret key not set",
    });
  }

  // this is debug for test chainlink integration effectively
  if (paymentId.indexOf("debug-mode-only-for-admin-account-") >= 0) {
    // this is my test account
    return res.status(200).json({ status: true, account: "0x29893eEFF38C5D5A1B2F693e2d918e618CCFfdD8", env: "debug" });
  }

  const { customer: customerId } = await stripe.paymentIntents.retrieve(paymentId);

  console.log("customerId", customerId);

  if (typeof customerId !== "string") {
    return res.status(500).json({
      status: false,
      error: "Customer is not found for the payment id",
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const customer: any = await stripe.customers.retrieve(customerId);
  if (!customer.metadata || !customer.metadata.walletAddress) {
    return res.status(500).json({
      status: false,
      error: "Customer does not have wallet address",
    });
  }

  console.log("userWallet", customer.metadata.walletAddress);
  console.log("userWallet has 7USD deposit in the paymaster contract now");

  return res.status(200).json({ status: true, account: customer.metadata.walletAddress, env: "test" });
};
export default handler;
