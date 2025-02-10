import { readFileSync } from "fs";
import { zkVerifySession, Library, CurveType } from "zkverifyjs";
import dotenv from "dotenv";

dotenv.config();

const run = async () => {
  try {
    console.log("reading files...");
    const vkWhitelist = JSON.parse(
      readFileSync(
        "../zkp/circuits/setup/whitelist_verification_key.json",
        "utf-8"
      )
    );
    const vkContribution = JSON.parse(
      readFileSync(
        "../zkp/circuits/setup/contribution_verification_key.json",
        "utf-8"
      )
    );

    console.log(vkWhitelist);

    console.log("starting zkv session...");
    const session = await zkVerifySession
      .start()
      .Custom(process.env.ZKV_RPC_URL)
      .withAccount(process.env.ZKV_SEED_PHRASE!);

    console.log("session started, sending transactions");
    const { transactionResult: whitelistTransactionResult } = await session
      .registerVerificationKey()
      .groth16(Library.snarkjs, CurveType.bn128)
      .execute(vkWhitelist);
    const { statementHash: whitelistVKHash } = await whitelistTransactionResult;

    const { transactionResult: contributionTransactionResult } = await session
      .registerVerificationKey()
      .groth16(Library.snarkjs, CurveType.bn128)
      .execute(vkContribution);
    const { statementHash: contributionVKHash } =
      await contributionTransactionResult;

    console.log("Whitelist verification key hash:", whitelistVKHash);
    console.log("Contribution verification key hash:", contributionVKHash);
  } catch (err) {
    console.log("error:", err);
  }
};

run()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
