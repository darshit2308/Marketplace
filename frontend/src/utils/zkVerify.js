import { ethers } from "ethers";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const zkVerifyAndCallMethod = async (
  proof,
  publicSignals,
  commitment,
  amount,
  method,
  contractAddr,
  contractABI,
  root,
  contributionCommitment,
  symbol
) => {
  const ZKV_RPC_URL = process.env.REACT_APP_ZKV_RPC_URL;
  const ETH_RPC_URL = process.env.REACT_APP_ETH_RPC_URL;
  const ZKVERIFY_CONTRACT_ADDRESS =
    process.env.REACT_APP_ZKVERIFY_CONTRACT_ADDRESS;
  const ETH_SECRET_KEY = process.env.REACT_APP_ETH_SECRET_KEY;
  console.log("sending zkvSession request");

  let vk;
  if (method == "contribute") {
    const res = await fetch("/zk/whitelist_verification_key.json");
    vk = await res.json();
  } else {
    const res = await fetch("/zk/contribution_verification_key.json");
    vk = await res.json();
  }

  const zkvSessionUrl = "http://localhost:8000/api/zkvSession";
  const body = {
    vk,
    proof,
    publicSignals,
  };

  const res = await axios.post(zkvSessionUrl, body);
  const { attestationId, leafDigest, leafIndex, merkleProof, numberOfLeaves } =
    res.data;
  console.log("attestationId: ", attestationId);

  const zkvABI = [
    "event AttestationPosted(uint256 indexed _attestationId, bytes32 indexed _proofsAttestation)",
  ];

  const provider = new ethers.JsonRpcProvider(ETH_RPC_URL, undefined, {
    polling: true,
  });
  const metamaskProvider = new ethers.BrowserProvider(window.ethereum);
  metamaskProvider.send("eth_requestAccounts", []);
  const addresses = await metamaskProvider.listAccounts();
  const address = addresses[0].address;
  const signer = await metamaskProvider.getSigner();
  console.log(signer);

  const zkvContract = new ethers.Contract(
    ZKVERIFY_CONTRACT_ADDRESS,
    zkvABI,
    provider
  );
  const appContract = new ethers.Contract(contractAddr, contractABI, signer);

  const filterAttestationsById = zkvContract.filters.AttestationPosted(
    attestationId,
    null
  );
  console.log(filterAttestationsById);

  if (method == "claim") {
    zkvContract.once(filterAttestationsById, async () => {
      await appContract.claim(
        commitment,
        contributionCommitment,
        attestationId,
        merkleProof,
        numberOfLeaves,
        leafIndex,
        commitment
      );
      console.log("claim method called");
    });

    const filterAppEventsByCaller = appContract.filters.Claimed(
      commitment,
      contributionCommitment
    );
    //appContract.once(filterAppEventsByCaller, async () => {
    console.log(
      `${amount} token(s) have been cliamed by user with commitment ${commitment}`
    );

    // get the token address, create token contract and transfer amount tokens to the user's address
    const url = `http://localhost:8000/api/details?symbol=${symbol}`;
    const resp = await axios.get(url);
    const tokenAddress = resp.data.tokenDetails.address;
    const tokenABI = [
      "function transferTokens(address recipient, uint256 amount)",
    ];
    const wallet = new ethers.Wallet(ETH_SECRET_KEY, provider);
    const tokenContract = new ethers.Contract(tokenAddress, tokenABI, wallet);

    // calculate the amount of tokens to be transferred
    const totalContrib = await appContract.getTotalContrib();
    const totalSupply = await appContract.getTotalSupply();
    const amountTokens = (amount * totalSupply) / totalContrib;
    await tokenContract.transferTokens(address, amountTokens);

    console.log(`Tokens have been transferred to user's address`);
    //});
  }

  if (method == "contribute") {
    console.log("inside contribute");
    zkvContract.once(filterAttestationsById, async (_id, _root) => {
      console.log("sending transaction");
      await appContract.conribute(
        commitment,
        attestationId,
        merkleProof,
        numberOfLeaves,
        leafIndex,
        commitment,
        { value: amount, gasLimit: 500000 }
      );

      console.log("Contribution method called");
    });

    const filterAppEventsByCaller = appContract.filters.Contributed(
      commitment,
      null
    );
    const url = "http://localhost:8000/api/contributor";
    const body = { contributor: contributionCommitment, symbol: symbol };

    await axios.post(url, body);
    setTimeout(async () => {
      console.log(
        `Whitelist inclusion has been proved and contribution of amount ${amount} has been made`
      );
    }, 40000);
  }
};

export default zkVerifyAndCallMethod;
