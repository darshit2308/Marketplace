pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/poseidon.circom";
include "../node_modules/circomlib/circuits/bitify.circom";
include "../node_modules/circomlib/circuits/comparators.circom";
include "./merkle_proof.circom";

template TokenClaim() {
    // public
    signal input merkleRoot;
    signal input TREE_DEPTH;

    // private 
    signal input userAddress;
    signal input numTokens;
    signal input path[TREE_DEPTH];
    signal input pathElements[TREE_DEPTH];

    component hasher = Poseidon(2);
    hasher.inputs[0] <== userAddress;
    hasher.inputs[1] <== numTokens;
    signal hashedLeaf <== hasher.out;

    signal output canClaim;
    component merkleProof = MerkleProof();

    merkleProof.leaf <== hashedLeaf;
    merkleProof.pathElements <== pathElements;
    merkleProof.path <== path;
    merkleProof.depth <== TREE_DEPTH;
    signal calculatedRoot <== merkleProof.root;

    component comparator = IsEqual();
    comparator.in[0] <== merkleRoot;
    comparator.in[1] <== calculatedRoot;

    canClaim <== comparator.out;
}

component main {public [merkleRoot, TREE_DEPTH]} = TokenClaim();
