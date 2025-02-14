// This file contains the function to call either of the two methods:
// 1. contribute: Used to add contributions from the whitelisted user to the contract
// 2. claim: Used to claim the tokens from the contract
// The function calls the method zkVerifyAndCallMethod, which will first verify the zk proof on zkVerify,
// and then call the respective method on the contract if the proof is valid.

import zkVerifyAndCallMethod from "./zkVerify";
import axios from "axios";
import {
  generateProofWhitelist,
  generateProofContribution,
} from "./generateProof";
import { getRoot, getProof } from "./merkleTree";
import { buildPoseidon } from "circomlibjs";
import "snarkjs";
import { ethers } from "ethers";

const callMethod = async (amountContribution, userAddress, symbol, method) => {
  const amount = ethers.parseEther(amountContribution);
  const instanceUrl = `http://localhost:8000/api/details?symbol=${symbol}`;
  const instanceResp = await axios.get(instanceUrl);
  const contractAddr = instanceResp.data.tokenDetails.instanceAddr;
  const contractABI = [
    {
      inputs: [
        { internalType: "uint256", name: "nullifier", type: "uint256" },
        { internalType: "uint256", name: "attestationId", type: "uint256" },
        { internalType: "bytes32[]", name: "merklePath", type: "bytes32[]" },
        { internalType: "uint256", name: "leafCount", type: "uint256" },
        { internalType: "uint256", name: "index", type: "uint256" },
        { internalType: "uint256", name: "merkleRoot", type: "uint256" },
      ],
      name: "conribute",
      outputs: [],
      stateMutability: "payable",
      type: "function",
    },
    {
      inputs: [
        { internalType: "uint256", name: "nullifier", type: "uint256" },
        { internalType: "uint256", name: "claimCommitment", type: "uint256" },
        { internalType: "uint256", name: "attestationId", type: "uint256" },
        { internalType: "bytes32[]", name: "merklePath", type: "bytes32[]" },
        { internalType: "uint256", name: "leafCount", type: "uint256" },
        { internalType: "uint256", name: "index", type: "uint256" },
        { internalType: "uint256", name: "merkleRoot", type: "uint256" },
      ],
      name: "claim",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "nullififer",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
      ],
      name: "Contributed",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "nullififer",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "uint256",
          name: "claimCmmitment",
          type: "uint256",
        },
      ],
      name: "Claimed",
      type: "event",
    },
    {
      inputs: [],
      name: "getTotalContrib",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "getTotalSupply",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
  ];

  const poseidon = await buildPoseidon();
  const userHash = poseidon([userAddress]);
  console.log("user hash: ", userHash);
  const contributionCommitment = poseidon.F.toString(
    poseidon([userAddress, amount])
  );
  console.log("contributionCommitment: ", contributionCommitment);
  let proof, publicSignals, merkleRoot;

  if (method == "contribute") {
    const url = `http://localhost:8000/api/details?symbol=${symbol}`;

    const resp = await axios.get(url);
    const leaves = resp.data.tokenDetails.whitelist;
    console.log("whitelist: ", leaves);

    const { hexProof: pathElements, binaryProof: path } = getProof(
      leaves,
      poseidon.F.toString(userHash)
    );
    merkleRoot = getRoot(leaves);

    console.log("path: ", path);
    console.log("pathElements: ", pathElements);
    console.log("root: ", merkleRoot);

    const res = await generateProofWhitelist(
      userAddress,
      path,
      pathElements,
      merkleRoot
    );
    proof = res.proof;
    publicSignals = res.publicSignals;
  } else {
    const url = `http://localhost:8000/api/details?symbol=${symbol}`;
    const body = { symbol: symbol };
    const resp = await axios.get(url, body);
    const leaves = resp.data.tokenDetails.contributors;
    console.log("leaves: ", leaves);

    const { hexProof: pathElements, binaryProof: path } = getProof(
      leaves,
      contributionCommitment
    );
    merkleRoot = getRoot(leaves);

    const res = await generateProofContribution(
      userAddress,
      path,
      pathElements,
      merkleRoot,
      amount
    );
    proof = res.proof;
    publicSignals = res.publicSignals;
  }

  zkVerifyAndCallMethod(
    proof,
    publicSignals,
    poseidon.F.toString(userHash),
    amount,
    method,
    contractAddr,
    contractABI,
    merkleRoot,
    contributionCommitment,
    symbol
  );
};

export default callMethod;
