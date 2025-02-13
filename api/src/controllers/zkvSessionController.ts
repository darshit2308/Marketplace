import {
  zkVerifySession,
  ZkVerifyEvents,
  Library,
  CurveType,
} from "zkverifyjs";
import { Request, Response } from "express";
import { config } from "dotenv";

config();

const startSession = async (req: Request, res: Response) => {
  console.log("starting session");
  const seedPhrase = process.env.SEED_PHRASE!;
  const { vk, proof, publicSignals } = req.body;
  const session = await zkVerifySession
    .start()
    .Testnet()
    .withAccount(seedPhrase);

  console.log("session started");
  const { events, transactionResult } = await session
    .verify()
    .groth16(Library.snarkjs, CurveType.bn128)
    .waitForPublishedAttestation()
    .execute({ proofData: { vk, proof, publicSignals } });

  events.on(ZkVerifyEvents.IncludedInBlock, ({ txHash }) => {
    console.log(`Transaction accepted in zkVerify, tx-hash: ${txHash}`);
  });

  events.on(ZkVerifyEvents.Finalized, ({ blockHash }) => {
    console.log(`Transaction finalized in zkVerify, block-hash: ${blockHash}`);
  });

  events.on("error", (error) => {
    console.error("An error occurred during the transaction:", error);
  });

  let attestationId, leafDigest;
  try {
    ({ attestationId, leafDigest } = await transactionResult);
    console.log(`Attestation published on zkVerify`);
    console.log(`\tattestationId: ${attestationId}`);
    console.log(`\tleafDigest: ${leafDigest}`);
  } catch (error) {
    console.error("Transaction failed:", error);
  }

  let merkleProof, numberOfLeaves, leafIndex, root;
  try {
    const proofDetails = await session.poe(attestationId!, leafDigest!);
    ({ proof: merkleProof, numberOfLeaves, leafIndex, root } = proofDetails);
    console.log(`Merkle proof details`);
    console.log(`\tmerkleProof: ${merkleProof}`);
    console.log(`\tnumberOfLeaves: ${numberOfLeaves}`);
    console.log(`\tleafIndex: ${leafIndex}`);
    console.log(`\troot: ${root}`);
  } catch (error) {
    console.error("RPC failed:", error);
  }

  res.json({
    attestationId,
    leafDigest,
    leafIndex,
    merkleProof,
    numberOfLeaves,
    root,
  });
};

export default startSession;
