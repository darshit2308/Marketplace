import Web3 from "web3";
import dotenv from "dotenv";
import axios from "axios";
import buildPoseidonOpt from "circomlibjs";
import { ethers } from "ethers";

dotenv.config();

const register = async (userAddress: string, symbol: string) => {
  try {
    const whitelistAddr = process.env.WHITELIST_ADDRESS!;
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

    const provider = new ethers.BrowserProvider(window.ethereum);
    //const provider = new ethers.JsonRpcApiProvider(process.env.RPC_URL!)
    const whitelist = new ethers.Contract(
      whitelistAddr,
      whitelistAbi,
      provider
    );

    const secret = process.env.SECRET!;
    const poseidon = await buildPoseidonOpt.buildPoseidonOpt();
    const userHash = poseidon([userAddress]);
    const secretHash = poseidon([secret]);
    const commitment = poseidon.F.toString(poseidon([userHash, secretHash]));

    const tx = await whitelist.register(commitment);
    const { hash } = await tx;
    const filterAppEventsByCaller = whitelist.filters.registered(commitment);
    whitelist.once(filterAppEventsByCaller, async () => {
      console.log(`Registration successful for commitment ${commitment}`);
    });
  } catch (error) {
    console.error("Error:", error);
  }
};

export default register;
