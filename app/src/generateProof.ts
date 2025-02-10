import groth16, { CircuitSignals } from "snarkjs";

export const generateProof = async (
  objectParams: Object,
  wasmPath: string,
  zkeyPath: string
) => {
  const groth16Prover = groth16.groth16;
  const { proof, publicSignals } = await groth16Prover.fullProve(
    objectParams as CircuitSignals,
    wasmPath,
    zkeyPath
  );

  return { proof, publicSignals };
};

export const generateProofWhitelist = async (
  commitment: string,
  merkeleproof: string[],
  root: string
) => {
  const zkeyPath = "../../zkp/setup/whitelist_inclusion_0001.zkey";
  const wasmPath = "../../zkp/setup/whitelist_inclusion.wasm";

  const merkeleproofBigint = merkeleproof.map((el) => BigInt(el));
  const params = {
    merkleRoot: BigInt(root),
    TREE_DEPTH: BigInt(merkeleproof.length),
    path: merkeleproofBigint,
    commitment: BigInt(commitment),
  };

  return generateProof(params, wasmPath, zkeyPath);
};

export const generateProofContribution = async (
  commitment: string,
  merkeleproof: string[],
  root: string,
  contribution: number
) => {
  const zkeyPath = "../../zkp/setup/contribution_proof_0001.zkey";
  const wasmPath = "../../zkp/setup/contribution_proof.wasm";
  const merkeleproofBigint = merkeleproof.map((el) => BigInt(el));
  const params = {
    merkleRoot: BigInt(root),
    TREE_DEPTH: BigInt(merkeleproof.length),
    path: merkeleproofBigint,
    commitment: BigInt(commitment),
    contribution: BigInt(contribution),
  };

  return generateProof(params, wasmPath, zkeyPath);
};
