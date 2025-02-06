pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/poseidon.circom";
include "../node_modules/circomlib/circuits/bitify.circom";
include "../node_modules/circomlib/circuits/comparators.circom";

template MerkleProof() {
    signal input leaf;
    signal input depth;
    signal input path[depth];

    signal output root;
    signal currentHash <== leaf;
        
    for (var i = 0; i < depth; i++) {
        component levelHash = Poseidon(2);

        levelHash.inputs[0] <== currentHash;
        levelHash.inputs[1] <== path[i];

        currentHash <== levelHash.out;
    }

    root <== currentHash;
}
