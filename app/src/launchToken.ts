// import Web3, { Transaction } from "web3";
// import dotenv from "dotenv";

// dotenv.config();

// interface IParams {
//   name: string;
//   symbol: string;
//   tokenAddr: string;
//   totalSupply: number;
//   supportPeriod: number;
//   minSupportContrib: number;
//   maxSupportContrib: number;
//   minContrib: number;
//   maxContrib: number;
//   salePeriod: number;
//   maxSupporters: number;
// }

// export const launchNewToken = async (params: IParams) => {
//   try {
//     const {
//       name,
//       symbol,
//       tokenAddr,
//       totalSupply,
//       supportPeriod,
//       minSupportContrib,
//       maxSupportContrib,
//       minContrib,
//       maxContrib,
//       salePeriod,
//       maxSupporters,
//     } = params;
//     if (!window.ethereum) alert("Please install metamask");

//     const web3 = new Web3(window.ethereum);
//     const accounts = await web3.eth.getAccounts();
//     const userAddress = accounts[0];

//     const factoryAddr = process.env.FACTORY_ADDRESS;
//     const factoryAbi = [
//       {
//         inputs: [
//           { internalType: "string", name: "name", type: "string" },
//           { internalType: "string", name: "symbol", type: "string" },
//           { internalType: "address", name: "tokenAddr", type: "address" },
//           { internalType: "uint256", name: "totalSupply", type: "uint256" },
//           { internalType: "uint256", name: "supportPeriod", type: "uint256" },
//           {
//             internalType: "uint256",
//             name: "minSupportContrib",
//             type: "uint256",
//           },
//           {
//             internalType: "uint256",
//             name: "maxSupportContrib",
//             type: "uint256",
//           },
//           { internalType: "uint256", name: "minContrib", type: "uint256" },
//           { internalType: "uint256", name: "maxContrib", type: "uint256" },
//           { internalType: "uint256", name: "salePeriod", type: "uint256" },
//           { internalType: "uint256", name: "maxSupporters", type: "uint256" },
//         ],
//         name: "newInstance",
//         outputs: [
//           { internalType: "address", name: "", type: "address" },
//           { internalType: "address", name: "", type: "address" },
//         ],
//         stateMutability: "nonpayable",
//         type: "function",
//       },
//     ];

//     const contract = new web3.eth.Contract(factoryAbi, factoryAddr);
//     const tx = contract.methods.newInstance(
//       name,
//       symbol,
//       tokenAddr,
//       totalSupply,
//       supportPeriod,
//       minSupportContrib,
//       maxSupportContrib,
//       minContrib,
//       maxContrib,
//       salePeriod,
//       maxSupporters
//     );
//     const txData = tx.encodeABI();
//     const txGas = await tx.estimateGas({ from: userAddress });

//     const transaction = {
//       from: userAddress,
//       to: factoryAddr,
//       data: txData,
//       gas: txGas,
//     };

//     web3.eth
//       .sendTransaction(transaction)
//       .on("transactionHash", (hash: string) => {
//         console.log("Transaction sent. Hash:", hash);
//       })
//       .on("confirmation", (receipt: any) => {
//         console.log("Transaction confirmed. Receipt:", receipt);
//       })
//       .on("error", (error: Error) => {
//         console.error("Transaction failed:", error);
//       });
//   } catch (err) {
//     console.log(err);
//   }
// };
