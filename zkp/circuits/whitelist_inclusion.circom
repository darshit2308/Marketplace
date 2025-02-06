pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/poseidon.circom";
include "../node_modules/circomlib/circuits/bitify.circom";
include "../node_modules/circomlib/circuits/comparators.circom";
include "./merkle_proof.circom";

template WhitelistVerification() {
    // public
    signal input merkleRoot;
    signal input TREE_DEPTH;

    // private
    signal input path[TREE_DEPTH];
    signal input userAddress;

    signal output isIncluded;

    component hasher = Poseidon(1);
    hasher.inputs[0] <== userAddress;
    signal hashedLeaf <== hasher.out;

    component merkleProof = MerkleProof();
    merkleProof.leaf <== hashedLeaf;
    merkleProof.path <== path;
    merkleProof.depth <== TREE_DEPTH;
    signal calculatedRoot <== merkleProof.root;

    component rootComparator = IsEqual();
    rootComparator.in[0] <== merkleRoot;
    rootComparator.in[1] <== calculatedRoot;

    isIncluded <== rootComparator.out;
}

component main {public [merkleRoot, TREE_DEPTH]} = WhitelistVerification();
