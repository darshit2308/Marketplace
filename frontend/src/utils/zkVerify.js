import { ZkVerifyEvents, zkVerifySession } from "zkverifyjs";
import { ethers, isBytesLike } from "ethers";
import { buildPoseidon } from "circomlibjs";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const zkVerifyAndCallMethod = async (
  proof,
  publicSignals,
  commitment,
  amount,
  method,
  contractAddr,
  contractABI,
  root,
  contributionCommitment
) => {
  // const {
  //   ZKV_RPC_URL,
  //   ZKV_SEED_PHRASE,
  //   ETH_RPC_URL,
  //   ZKVERIFY_CONTRACT_ADDRESS,
  //   ETH_SECRET_KEY
  // } = process.env;
  // console.log(ZKV_RPC_URL)
  const ZKV_RPC_URL = "wss://testnet-rpc.zkverify.io";
  const ZKV_SEED_PHRASE = "choice more twelve cute mirror income smoke behind setup library access labor";
  const ETH_RPC_URL = "https://arb-sepolia.g.alchemy.com/v2/371S4SnZiwHOjqaLqDWNu1FfgVGpukW5";
  const ZKVERIFY_CONTRACT_ADDRESS = "0x82941a739E74eBFaC72D0d0f8E81B1Dac2f586D5"
  const ETH_SECRET_KEY = "00652facce59caf704c80274ccb53e9513711213d0551d710c74454056e7b699"
  console.log(String(ZKV_RPC_URL))

  let vk;
  if (method == "contribute") 
  {
    const res = await fetch("/zk/whitelist_verification_key.json");
    vk = await res.json();
  }
  else
  {
    const res = await fetch("/zk/contribution_verification_key.json");
    vk = await res.json();
  }

  const zkvSessionUrl = "http://localhost:8000/api/zkvSession";
  const body = {
    vk,
    proof,
    publicSignals
  }

  const res = await axios.post(zkvSessionUrl, body);
  const {attestationId, leafDigest, leafIndex, merkleProof, numberOfLeaves} = res.data;
  console.log("attestationId: ", attestationId)
  //const attestationId = 44307;

  const zkvABI = [
    "event AttestationPosted(uint256 indexed _attestationId, bytes32 indexed _proofsAttestation)",
  ];

  const provider = new ethers.JsonRpcProvider(ETH_RPC_URL, undefined, {
    polling: true,
  });
  const metamaskProvider = new ethers.BrowserProvider(window.ethereum);
  metamaskProvider.send("eth_requestAccounts", []);
  const addresses = await metamaskProvider.listAccounts();
    const address = addresses[0].address;
  const signer = await metamaskProvider.getSigner();
  console.log(signer)

  const zkvContract = new ethers.Contract(
    ZKVERIFY_CONTRACT_ADDRESS,
    zkvABI,
    provider
  );
  const appContract = new ethers.Contract(contractAddr, contractABI, signer);

  const filterAttestationsById = zkvContract.filters.AttestationPosted(
    attestationId,
    null
  );
  console.log(filterAttestationsById)

  if (method == "claim") {
    zkvContract.once(filterAttestationsById, async () => {
      await appContract.claim(
        commitment,
        contributionCommitment,
        attestationId,
        merkleProof,
        numberOfLeaves,
        leafIndex,
        5
      );
      console.log("claim method called")
    });

    const filterAppEventsByCaller = appContract.filters.Claimed(
      commitment,
      amount
    );
    appContract.once(filterAppEventsByCaller, async () => {
      console.log(
        `${amount} token(s) have been cliamed by user with commitment ${commitment}`
      );

      // get the token address, create token contract and transfer amount tokens to the user's address
      const url = "http://localhost:8000/api/details";
      const body = { symbol: symbol };
      const resp = await axios.get(url, body);
      const tokenAddress = resp.data.tokenDetails.address;
      const tokenABI = ["function transferTokens(address recipient, uint256 amount)"];
      const wallet = new ethers.Wallet(ETH_SECRET_KEY, provider);
      const tokenContract = new ethers.Contract(tokenAddress, tokenABI, wallet);

      // calculate the amount of tokens to be transferred 
      const totalContrib = await appContract.getTotalContrib();
      const totalSupply = await appContract.getTotalSupply();
      const amountTokens = (amount * totalSupply) / totalContrib;
      const txResponse = await tokenContract.transferTokens(address, amountTokens);
      const { hash } = await txResponse;
      console.log(`Tx sent to EVM, tx-hash ${hash}`);
      console.log(`Tokens have been transferred to user's address`);
    });
  }

  if (method == "contribute") {
    console.log("inside contribute")
    zkvContract.once(filterAttestationsById, async (_id, _root) => {
      // const merkleProof = ["0x2f925aed2090b47c5fa88c97d804b1505f56e31f19a4da4c29bed78a25e99927"]
      // const numberOfLeaves = 2;
      // const leafIndex = 0;
      // console.log("calling contribute")
      // console.log("commitment: ", commitment)
      // console.log("root: ", root)
      console.log(commitment)
      console.log(attestationId)
      console.log(merkleProof)
      console.log(numberOfLeaves)
      console.log(leafIndex)
      console.log(root)
      console.log("sending transaction")
      console.log(amount)
      await appContract.contribute(
        commitment,
        attestationId,
        merkleProof,
        numberOfLeaves,
        leafIndex,
        root,
        {value: amount, gasLimit: 3000000}
      );
      // const { hash } = await txResponse;
      // console.log(`Tx sent to EVM, tx-hash ${hash}`);
      console.log("method called")
    });

    const filterAppEventsByCaller = appContract.filters.Contributed(
      commitment,
      null
    );
    appContract.once(filterAppEventsByCaller, async () => {
      const url = "http://localhost:8000/api/contributor";
      const body = { contributor: contributionCommitment };

      await axios.post(url, body);
      console.log(
        `Whitelist inclusion has been proved and contribution of amount ${amount} has been made`
      );
    });
  }
};

export default zkVerifyAndCallMethod;
