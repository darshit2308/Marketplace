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
import {buildPoseidon} from "circomlibjs";
import "snarkjs";
import { ethers } from "ethers";

const callMethod = async (
  amountContribution,
  userAddress,
  symbol,
  method
) => {
  const amount = ethers.parseEther((amountContribution));
  const contractAddr = "0x2e17F85Cf3D7E3F47C15fF7a192AEc4d7A5cBB9a";
  const contractABI = ["function contribute(uint256 nullifier, uint256 attestationId, bytes32[] calldata merklePath, uint256 leafCount, uint256 index, uint256 merkleRoot)",
    "function claim(uint256 nullifier, uint256 claimCommitment, uint256 attestationId, bytes32[] calldata merklePath, uint256 leafCount, uint256 index, uint256 merkleRoot)",
    "event Contributed(uint256 indexed nullififer, uint256 amount)", "event Claimed(uint256 indexed nullififer, uint256 indexed claimCmmitment)", "function getTotalContrib() returns (uint256)",
    "function getTotalSupply() external view returns (uint256)"];

  //const secret = [1, 2, 3];
  const poseidon = await buildPoseidon();
  const userHash = poseidon([userAddress]);
  console.log("user hash: ", userHash)
  //const secretHash = poseidon([secret]);
  const contributionCommitment = poseidon.F.toString(poseidon([userAddress, amount]));
  console.log("contributionCommitment: ", contributionCommitment)
  let proof, publicSignals, merkleRoot;

  if (method == "contribute") {
    const url = `http://localhost:8000/api/details?symbol=${symbol}`;

  const resp = await axios.get(url);
  const leaves = resp.data.tokenDetails.whitelist;
  console.log("whitelist: ", leaves)

  const {hexProof: pathElements, binaryProof: path} = getProof(leaves, poseidon.F.toString(userHash));
  merkleRoot = getRoot(leaves);

  console.log("path: ", path)
  console.log("pathElements: ", pathElements)
  console.log("root: ", merkleRoot)

    const res = await generateProofWhitelist(
      userAddress,
      path,
      pathElements,
      merkleRoot
    );
    proof = res.proof;
    publicSignals = res.publicSignals;
  } else {
    const url = "localhost:8000/api/details";
    const body = {symbol: symbol}
  const resp = await axios.get(url, body);
  const leaves = resp.data.tokenDetails.contributors;

  const {path, pathElements} = getProof(leaves, contributionCommitment);
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
    contributionCommitment
  );
};

export default callMethod;
