import { ZkVerifyEvents, zkVerifySession } from "zkverifyjs";
import { Groth16Proof, PublicSignals } from "snarkjs";
import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

const zkVerifyAndCallMethod = async (
  proof: Groth16Proof,
  publicSignals: PublicSignals,
  commitment: string,
  amount: number,
  method: string,
  contractAddr: string,
  contractABI: string[]
) => {
  const {
    ZKV_RPC_URL,
    ZKV_SEED_PHRASE,
    ETH_RPC_URL,
    ETH_SECRET_KEY,
    ETH_ZKVERIFY_CONTRACT_ADDRESS,
  } = process.env;

  const vk = "";
  const session = await zkVerifySession
    .start()
    .Custom(ZKV_RPC_URL)
    .withAccount(ZKV_SEED_PHRASE!);
  const { events, transactionResult } = await session
    .verify()
    .groth16()
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

  let attestationId: any, leafDigest;
  try {
    ({ attestationId, leafDigest } = await transactionResult);
    console.log(`Attestation published on zkVerify`);
    console.log(`\tattestationId: ${attestationId}`);
    console.log(`\tleafDigest: ${leafDigest}`);
  } catch (error) {
    console.error("Transaction failed:", error);
  }

  let merkleProof: any, numberOfLeaves: any, leafIndex: any;
  try {
    const proofDetails = await session.poe(attestationId!, leafDigest!);
    ({ proof: merkleProof, numberOfLeaves, leafIndex } = proofDetails);
    console.log(`Merkle proof details`);
    console.log(`\tmerkleProof: ${merkleProof}`);
    console.log(`\tnumberOfLeaves: ${numberOfLeaves}`);
    console.log(`\tleafIndex: ${leafIndex}`);
  } catch (error) {
    console.error("RPC failed:", error);
  }

  const zkvABI = [
    "event AttestationPosted(uint256 indexed attestationId, bytes32 indexed root)",
  ];

  const provider = new ethers.JsonRpcProvider(ETH_RPC_URL, undefined, {
    polling: true,
  });
  const wallet = new ethers.Wallet(ETH_SECRET_KEY!, provider);

  const zkvContract = new ethers.Contract(
    ETH_ZKVERIFY_CONTRACT_ADDRESS!,
    zkvABI,
    provider
  );
  const appContract = new ethers.Contract(contractAddr, contractABI, wallet);

  const filterAttestationsById = zkvContract.filters.AttestationPosted(
    attestationId,
    null
  );

  if (method == "cliam") {
    zkvContract.once(filterAttestationsById, async (_id, _root) => {
      const txResponse = await appContract.claim(
        commitment,
        amount,
        attestationId,
        merkleProof,
        numberOfLeaves,
        leafIndex
      );
      const { hash } = await txResponse;
      console.log(`Tx sent to EVM, tx-hash ${hash}`);
    });

    const filterAppEventsByCaller = appContract.filters.Claimed(
      commitment,
      amount
    );
    appContract.once(filterAppEventsByCaller, async () => {
      console.log(
        `${amount} token(s) have been cliamed by user with commitment ${commitment}`
      );
    });
  }

  if (method == "comtribute") {
    zkvContract.once(filterAttestationsById, async (_id, _root) => {
      const txResponse = await appContract.contribute(
        commitment,
        amount,
        attestationId,
        merkleProof,
        numberOfLeaves,
        leafIndex
      );
      const { hash } = await txResponse;
      console.log(`Tx sent to EVM, tx-hash ${hash}`);
    });

    const filterAppEventsByCaller = appContract.filters.Contributed(
      commitment,
      amount
    );
    appContract.once(filterAppEventsByCaller, async () => {
      console.log(
        `Whitelist inclusion has been proved and contribution of amount ${amount} has been made`
      );
    });
  }
};

export default zkVerifyAndCallMethod;
