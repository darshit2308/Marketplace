import { buildPoseidon, buildPoseidonOpt } from "circomlibjs";
import { ethers } from "ethers";
import axios from "axios";

const register = async (symbol) => {
  try {
    const whitelistUrl = `http://localhost:8000/api/details?symbol=${symbol}`;
    const whitelistResp = await axios.get(whitelistUrl);
    const whitelistAddr = whitelistResp.data.tokenDetails.whitelistAddr;
    const whitelistAbi = [
      "function register(uint256 _nullifier)",
      "event Registered(uint256 indexed nullifier)",
      "error Deadline_Reached()",
      "error Supporter_Limit_Reached()",
      "error Already_Registered()",
    ];

    if (!window.ethereum) alert("Please install metamask or a similar wallet");

    const provider = new ethers.BrowserProvider(window.ethereum);
    provider.send("eth_requestAccounts", []);
    const addresses = await provider.listAccounts();
    console.log(addresses);
    const address = addresses[0].address;
    console.log("Connected account:", address);
    const signer = await provider.getSigner();
    console.log(signer);

    const whitelist = new ethers.Contract(whitelistAddr, whitelistAbi, signer);
    console.log("Whitelist contract initialized successfully");

    const secret = process.env.REACT_APP_SECRET;
    const poseidon = await buildPoseidon();
    console.log("Poseidon hash function initialized successfully");
    const userHash = poseidon([address]);
    console.log(`User hash: ${userHash}`);
    const secretHash = poseidon([secret]);
    console.log(`Secret hash: ${secretHash}`);
    const nullifier = poseidon.F.toString(poseidon([userHash, secretHash]));
    console.log(`nullifier: ${nullifier}`);

    const tx = await whitelist.register(nullifier);
    const { hash } = await tx;
    console.log(`Transaction hash: ${hash}`);

    const url = "http://localhost:8000/api/whitelist";
    const body = {
      symbol: symbol,
      hash: poseidon.F.toString(userHash),
    };
    await axios.post(url, body);

    const filterAppEventsByCaller = whitelist.filters.Registered(nullifier);
    whitelist.once(filterAppEventsByCaller, async () => {
      console.log(`Registration successful for nullifier ${nullifier}`);
    });
  } catch (error) {
    console.error("Error:", error);
  }
};

export default register;
