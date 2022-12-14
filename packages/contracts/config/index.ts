import { ethers } from "ethers";

export const TIMEOUT = 600000; // 10m for no timeout
export const HARDHAT_CHAINID = 1337; // this is required to fix hardhat and metamask bug
// This job id is picked from
// https://docs.chain.link/any-api/get-request/examples/large-responses/
// spec
// https://docs.chain.link/chainlink-nodes/job-specs/direct-request-get-bytes/
// this is official job id
export const JOB_ID_STRING = "7da2702f37fd48e5b1b9a5715e3509b6";
// this is required to use it as an argument
export const JOB_ID = ethers.utils.hexlify(ethers.utils.toUtf8Bytes(JOB_ID_STRING));
// this is not official one
// https://github.com/Block-Farms/Chainlink-Public-Jobs/tree/master/Polygon-Mumbai/Get%20Bytes
// export const JOB_ID = "0x000000000000000000000000000000000175983bdaa946f2b59a6d0aaffbde91";

export const SUBSCRIPTION_FEE_IN_USD = 7; // this is fixed for this hackathon
export const BASE_URI = "https://link-wallet.vercel.app/api/stripe/status-for-chainlink?paymentId=";
