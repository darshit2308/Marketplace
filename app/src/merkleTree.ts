import MerkleTree from "merkletreejs";
import buildPoseidonOpt from "circomlibjs";

export const getRoot = (leaves: string[]): string => {
  const tree = new MerkleTree(leaves, buildPoseidonOpt, {
    sortPairs: true,
  });
  const root = tree.getRoot().toString("hex");

  return root;
};

export const getProof = (leaves: string[], leaf: string): string[] => {
  const tree = new MerkleTree(leaves, buildPoseidonOpt, {
    sortPairs: true,
  });
  const proof = tree.getProof(leaf).map((el) => el.data.toString("hex"));

  return proof;
};
