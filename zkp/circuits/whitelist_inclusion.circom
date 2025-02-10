pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/poseidon.circom";
include "../node_modules/circomlib/circuits/bitify.circom";
include "../node_modules/circomlib/circuits/comparators.circom";
include "./merkle_proof.circom";

template WhitelistVerification(MAX_DEPTH) {
    // public
    signal input merkleRoot;

    // private
    signal input path[MAX_DEPTH];
    signal input pathElements[MAX_DEPTH];
    signal input userAddress;

    signal output isIncluded;

    component hasher = Poseidon(1);
    hasher.inputs[0] <== userAddress;
    signal hashedLeaf <== hasher.out;

    component merkleProof = VerifyMerklePath(MAX_DEPTH);
    merkleProof.leaf <== hashedLeaf;
    merkleProof.pathElements <== pathElements;
    merkleProof.pathIndices <== path;
    signal calculatedRoot <== merkleProof.root;

    component rootComparator = IsEqual();
    rootComparator.in[0] <== merkleRoot;
    rootComparator.in[1] <== calculatedRoot;

    isIncluded <== rootComparator.out;
}

component main {public [merkleRoot]} = WhitelistVerification(32);
