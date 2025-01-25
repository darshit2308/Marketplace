pragma circom 2.0.0;

include "./node_modules/circomlib/circuits/poseidon.circom";
include "./node_modules/circomlib/circuits/bitify.circom";
include "./node_modules/circomlib/circuits/comparators.circom";

template WhitelistVerification {
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

    // public
    signal input userAddress;
    signal input merkleRoot;
    signal input TREE_DEPTH;

    // private
    signal input path[TREE_DEPTH];
    signal input pathElements[TREE_DEPTH];

    signal output isIncluded;

    component hasher = Poseidon(1);
    hasher.inputs[0] <== userAddress;
    signal hashedLeaf <== hasher.out;

    signal calculatedRoot <== CalculateMerkleRoot(hashedLeaf, pathElements, path, TREE_DEPTH);
    component rootComparator = IsEqual();
    rootComparator.in[0] <== merkleRoot;
    rootComparator.in[1] <== calculatedRoot;

    isIncluded <== rootComparator.out;
}

component main {public [userAddress, merkleRoot]} = WhitelistVerification();
