import Web3 from "web3";
import dotenv from "dotenv";
import axios from "axios";
import buildPoseidonOpt from "circomlibjs";

dotenv.config();

const register = async (userAddress: string, symbol: string) => {
  try {
    const whitelistAddr = process.env.WHITELIST_ADDRESS;
    const whitelistAbi = [
      {
        inputs: [
          { internalType: "bytes32", name: "_commitment", type: "bytes32" },
        ],
        name: "register",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        stateMutability: "nonpayable",
        type: "function",
      },
    ];

    const provider = new Web3.providers.HttpProvider(process.env.RPC_URL!);
    const web3 = new Web3(provider);
    const whitelist = new web3.eth.Contract(whitelistAbi, whitelistAddr);

    const secret = process.env.SECRET!;
    const poseidon = await buildPoseidonOpt.buildPoseidonOpt();
    const userHash = poseidon([userAddress]);
    const secretHash = poseidon([secret]);
    const commitment = poseidon.F.toString(poseidon([userHash, secretHash]));

    const tx = whitelist.methods.register(commitment);
    const txData = tx.encodeABI();
    const txGas = await tx.estimateGas({ from: userAddress });

    const senderAddress = process.env.SENDER_ADDRESS!;
    const senderPrivateKey = process.env.SENDER_PRIVATE_KEY!;

    const transaction = {
      from: senderAddress,
      to: whitelistAddr,
      data: txData,
      gas: txGas,
    };

    const signedTx = await web3.eth.accounts.signTransaction(
      transaction,
      senderPrivateKey
    );
    const receipt = await web3.eth.sendSignedTransaction(
      signedTx.rawTransaction!
    );

    console.log("Transaction receipt: ", receipt);
    if (receipt.events) {
      const event = receipt.events.Registered;
      if (event) {
        console.log("User registered:", event.returnValues);
        const apiUrl = "";
        const body = { commitment };
        await axios.post(apiUrl, body); // post method to add the user commitment to the merkle tree in the database
      }
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

export default register;
