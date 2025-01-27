pragma circom 2.0.0;

nclude "./node_modules/circomlib/circuits/poseidon.circom";
include "./node_modules/circomlib/circuits/bitify.circom";
include "./node_modules/circomlib/circuits/comparators.circom";

template ContributionProof() {
    // public
    signal input merkleRoot;
    signal input TREE_DEPTH;

    // private 
    signal input userAddress;
    signal input contribution;
    signal input path[TREE_DEPTH];
    signal input pathElements[TREE_DEPTH];

    component hasher = Poseidon(2);
    hasher.inputs[0] <== userAddress;
    hasher.inputs[1] <== contribution;
    signal hashedLeaf <== hasher.out;

    signal output hasContributed;
    signal calculatedRoot <== CalculateMerkleRoot(hashedLeaf, pathElements, path, TREE_DEPTH);
    component comparator = IsEqual();

    comparator.in[0] <== merkleRoot;
    comparator.in[1] <== calculatedRoot;

    hasContributed <== comparator.out;

    function CalculateMerkleRoot(leaf, pathElements, path, depth) {
        signal currentHash <== leaf;
        
        for (var i = 0; i < depth; i++) {
            component levelHash = Poseidon(2);

            levelHash.inputs[0] <== path[i] ? pathElements[i] : currentHash;
            levelHash.inputs[1] <== path[i] ? currentHash : pathElements[i];

            currentHash <== levelHash.out;
        }

        return currentHash;
    }
}

component main {public [merkleRoot, TREE_DEPTH]} = ContributionProof();
