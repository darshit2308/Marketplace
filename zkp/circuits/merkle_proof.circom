pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/poseidon.circom";
include "../node_modules/circomlib/circuits/bitify.circom";
include "../node_modules/circomlib/circuits/comparators.circom";

template MerkleProof(MAX_DEPTH) {
    signal input leaf;
    signal input path[MAX_DEPTH];
    signal input depth;

    signal output root;
    signal currentHash <== leaf;
        
    for (var i = 0; i < MAX_DEPTH; i++) {
        component levelHash = Poseidon(2);

        levelHash.inputs[0] <== currentHash;
        levelHash.inputs[1] <== path[i];

        currentHash <== ((i < depth) * levelHash.out) + ((i >= depth) * currentHash);
    }

    root <== currentHash;
}
