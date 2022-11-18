/* eslint-disable camelcase */
// https://github.com/dijonmusters/build-a-saas-with-next-js-supabase-and-stripe/blob/master/21-subscribe-to-stripe-webhooks-using-next-js-api-routes/pages/api/stripe-hooks.js

import { ethers } from "ethers";
import { NextApiRequest, NextApiResponse } from "next";

import deploymentsJsonFile from "../../../../../contracts/deployments.json";
import networkJsonFile from "../../../../../contracts/network.json";
import { ChainlinkStripePaymaster__factory } from "../../../../../contracts/typechain-types";

// this is to send chainlink request tx
// this is called when user create or renew the offchain gas payment subscription
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(400).json({
      status: false,
      error: "Invalid method. Only POST supported.",
    });
  }

  const paymentId = req.body.data.object.id;

  const { RELAYER_PRIVATE_KEY } = process.env;
  if (!RELAYER_PRIVATE_KEY) {
    return res.status(400).json({
      status: false,
      error: "Private key not set",
    });
  }

  const provider = new ethers.providers.JsonRpcProvider(networkJsonFile["80001"].rpc);
  const signer = new ethers.Wallet(RELAYER_PRIVATE_KEY, provider);
  const paymaster = ChainlinkStripePaymaster__factory.connect(deploymentsJsonFile.paymaster, signer);

  console.log("request", paymentId);
  const tx = await paymaster.request(paymentId);
  console.log("sent", tx.hash);

  console.log("this tx calls ChainlinkStripePaymaster", deploymentsJsonFile.paymaster);
  console.log(
    "ChainlinkStripePaymaster is going to request chainlink to fetch the stripe payment status by the payment ID"
  );
  console.log("After subscription info is fulfilled in paymaster, paymaster will pay the gas fee for the user");
  return res.status(200).json({ hash: tx.hash });
};
export default handler;

// signature verification is implemented but it is bit slow and it is not core value of this app, so comment-outed
// const { STRIPE_SECRET_KEY, STRIPE_SIGNING_SECRET } = process.env;
// if (!STRIPE_SECRET_KEY) {
//   return res.status(500).json({
//     status: false,
//     error: "Stripe secret key not set",
//   });
// }
// if (!STRIPE_SIGNING_SECRET) {
//   return res.status(500).json({
//     status: false,
//     error: "Signing secret not set",
//   });
// }
// const stripe = new Stripe(STRIPE_SECRET_KEY, {
//   apiVersion: "2022-11-15",
// });
// const signature = req.headers["stripe-signature"];
// if (typeof signature !== "string") {
//   return res.status(500).json({
//     status: false,
//     error: "Request signature is invalid",
//   });
// }

// const signingSecret = STRIPE_SIGNING_SECRET;
// const reqBuffer = await buffer(req);
// let event;
// try {
//   console.log("check");
//   event = stripe.webhooks.constructEvent(reqBuffer, signature, signingSecret);
//   console.log("ok");
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
// } catch (error: any) {
//   return res.status(400).send(`Webhook error: ${error.message}`);
// }
