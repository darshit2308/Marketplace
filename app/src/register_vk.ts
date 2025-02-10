import { readFileSync } from "fs";
import { zkVerifySession } from "zkverifyjs";
import dotenv from "dotenv";

dotenv.config();

const run = async () => {
  const vkWhitelist = JSON.parse(
    readFileSync("../../zkp/setup/whitelist_verification_key.json", "utf-8")
  );
  const vkContribution = JSON.parse(
    readFileSync("../../zkp/setup/contribution_verification_key.json", "utf-8")
  );

  const session = await zkVerifySession
    .start()
    .Custom(process.env.ZKV_RPC_URL)
    .withAccount(process.env.ZKV_SEED_PHRASE!);
  const { transactionResult: whitelistTransactionResult } = await session
    .registerVerificationKey()
    .groth16()
    .execute(vkWhitelist);
  const { statementHash: whitelistVKHash } = await whitelistTransactionResult;

  const { transactionResult: contributionTransactionResult } = await session
    .registerVerificationKey()
    .groth16()
    .execute(vkContribution);
  const { statementHash: contributionVKHash } =
    await contributionTransactionResult;

  console.log("Whitelist verification key hash:", whitelistVKHash);
  console.log("Contribution verification key hash:", contributionVKHash);
};

run()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
