import MerkleTree from "merkletreejs";
import buildPoseidonOpt from "circomlibjs";

export const getRoot = (leaves: string[]): string => {
  const tree = new MerkleTree(leaves, buildPoseidonOpt, {
    sortPairs: true,
  });
  const root = tree.getRoot().toString("hex");

  return root;
};

export const getHexProof = (leaves: string[], leaf: string): Object => {
  const tree = new MerkleTree(leaves, buildPoseidonOpt, {
    sortPairs: true,
  });

  const proof = tree.getProof(leaf);
  const binaryProof = proof.map((el) => (el.position == "right" ? 0 : 1));
  const hexProof = tree.getHexProof(leaf);

  return { binaryProof, hexProof };
};
