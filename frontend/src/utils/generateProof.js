import { groth16 } from "snarkjs";

export const generateProof = async (objectParams, wasmPath, zkeyPath) => {
  try {
    console.log("Generating proof with params: ", objectParams);
    const { proof, publicSignals } = await groth16.fullProve(
      objectParams,
      new Uint8Array(wasmPath),
      new Uint8Array(zkeyPath)
    );

    console.log("proof: ", proof);
    console.log("publicSignals: ", publicSignals);

    return { proof, publicSignals };
  } catch (error) {
    console.error("Error in generateProof:", error);
  }
};

export const generateProofWhitelist = async (
  userAddress,
  path,
  pathElements,
  root
) => {
  const zkeyPath = "/zk/whitelist_inclusion_0001.zkey";
  const wasmPath = "/zk/whitelist_inclusion.wasm";

  const wasmRes = await fetch(wasmPath);
  const wasmBuffer = await wasmRes.arrayBuffer();

  console.log(wasmBuffer);

  const zkeyRes = await fetch(zkeyPath);
  const zkeyBuffer = await zkeyRes.arrayBuffer();

  for (var i = pathElements.length; i < 32; i++) {
    pathElements.push("0x0");
  }

  for (var i = path.length; i < 32; i++) {
    path.push(0);
  }

  const params = {
    merkleRoot: "0x" + root,
    path: path,
    pathElements: pathElements,
    userAddress: userAddress,
  };

  return generateProof(params, wasmBuffer, zkeyBuffer);
};

export const generateProofContribution = async (
  userAddress,
  path,
  pathElements,
  root,
  contribution
) => {
  const zkeyPath = "zk/contribution_proof_0001.zkey";
  const wasmPath = "zk/contribution_proof.wasm";

  const wasmRes = await fetch(wasmPath);
  const wasmBuffer = await wasmRes.arrayBuffer();

  console.log(wasmBuffer);

  const zkeyRes = await fetch(zkeyPath);
  const zkeyBuffer = await zkeyRes.arrayBuffer();

  for (var i = pathElements.length; i < 32; i++) {
    pathElements.push("0x0");
  }

  for (var i = path.length; i < 32; i++) {
    path.push(0);
  }

  const params = {
    merkleRoot: "0x" + root,
    path: path,
    pathElements: pathElements,
    userAddress: userAddress,
    contribution: contribution,
  };

  return generateProof(params, wasmBuffer, zkeyBuffer);
};
