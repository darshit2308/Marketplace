import MerkleTree from "merkletreejs";
import { buildPoseidon } from "circomlibjs";

const poseidon = await buildPoseidon();

export const getRoot = (leaves) => {
  const tree = new MerkleTree(leaves, poseidon, {
    sortPairs: true,
  });
  const root = tree.getRoot().toString("hex");

  return root;
};

export const getProof = (leaves, leaf) => {
  const tree = new MerkleTree(leaves, poseidon, {
    sortPairs: true,
  });

  const proof = tree.getProof(leaf);
  const binaryProof = proof.map((el) => (el.position == "right" ? 0 : 1));
  const hexProof = tree.getHexProof(leaf);

  return { binaryProof, hexProof };
};
