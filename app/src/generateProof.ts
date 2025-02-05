import groth16, { CircuitSignals } from "snarkjs";

export const generateProof = async (objectParams: Object) => {
  const wasmPath = "";
  const zkeyPath = "";

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
  const merkeleproofBigint = merkeleproof.map((el) => BigInt(el));
  const params = {
    merkleRoot: BigInt(root),
    TREE_DEPTH: BigInt(merkeleproof.length),
    path: merkeleproofBigint,
    commitment: BigInt(commitment),
  };

  return generateProof(params);
};

export const generateProofContribution = async (
  commitment: string,
  merkeleproof: string[],
  root: string,
  contribution: number
) => {
  const merkeleproofBigint = merkeleproof.map((el) => BigInt(el));
  const params = {
    merkleRoot: BigInt(root),
    TREE_DEPTH: BigInt(merkeleproof.length),
    path: merkeleproofBigint,
    commitment: BigInt(commitment),
    contribution: BigInt(contribution),
  };

  return generateProof(params);
};
