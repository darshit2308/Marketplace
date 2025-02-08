pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/poseidon.circom";
include "../node_modules/circomlib/circuits/bitify.circom";
include "../node_modules/circomlib/circuits/comparators.circom";
include "./merkle_proof.circom";

template ContributionProof(MAX_DEPTH) {
    // public
    signal input merkleRoot;
    signal input TREE_DEPTH;

    // private 
    signal input userAddress;
    signal input contribution;
    signal input path[MAX_DEPTH];
    
    component hasher = Poseidon(2);
    hasher.inputs[0] <== userAddress;
    hasher.inputs[1] <== contribution;
    signal hashedLeaf <== hasher.out;

    signal output hasContributed;
    component merkleProof = MerkleProof(MAX_DEPTH);

    merkleProof.leaf <== hashedLeaf;
    merkleProof.depth <== TREE_DEPTH;
    merkleProof.path <== path;
    signal calculatedRoot <== merkleProof.root;

    component comparator = IsEqual();
    comparator.in[0] <== merkleRoot;
    comparator.in[1] <== calculatedRoot;

    hasContributed <== comparator.out;
}

component main {public [merkleRoot, TREE_DEPTH]} = ContributionProof(32);
