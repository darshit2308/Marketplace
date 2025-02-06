// This file contains the function to call either of the two methods:
// 1. contribute: Used to add contributions from the whitelisted user to the contract
// 2. claim: Used to claim the tokens from the contract
// The function calls the method zkVerifyAndCallMethod, which will first verify the zk proof on zkVerify,
// and then call the respective method on the contract if the proof is valid.

import zkVerifyAndCallMethod from "./zkverify";
import axios from "axios";
import { generateProofWhitelist } from "./generateProof";
import { getProof, getRoot } from "./merkleTree";
import buildPoseidonOpt from "circomlibjs";
import dotenv from "dotenv";

dotenv.config();

interface IAxiosResponse {
  leaves: string[];
}

const callMethod = async (
  amount: number,
  userAddress: string,
  symbol: string,
  method: string
) => {
  const contractAddr = "";
  const contractABI = [""];

  const secret = process.env.SECRET!;
  const poseidon = await buildPoseidonOpt.buildPoseidonOpt();
  const userHash = poseidon([userAddress]);
  const secretHash = poseidon([secret]);
  const commitment = poseidon.F.toString(poseidon([userHash, secretHash]));

  const url = "";
  const data = (await axios.get(url)) as IAxiosResponse;
  const leaves = data.leaves;

  const merkeleproof = getProof(leaves, commitment);
  const merkleRoot = getRoot(leaves);

  const { proof, publicSignals } = await generateProofWhitelist(
    commitment,
    merkeleproof,
    merkleRoot
  );
  zkVerifyAndCallMethod(
    proof,
    publicSignals,
    commitment,
    amount,
    method,
    contractAddr,
    contractABI
  );
};

export default callMethod;
