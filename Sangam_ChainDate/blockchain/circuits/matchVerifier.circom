pragma circom 2.0.0;

/*
 * matchVerifier.circom
 * ---------------------
 * Proves that a user:
 *   1. Is at least 18 years old (age >= 18) — private input
 *   2. Shares at least 1 interest with a target — private inputs
 *
 * Public outputs:
 *   - ageValid:        1 if age >= 18, 0 otherwise
 *   - interestOverlap: count of shared interests (≥1 means match-eligible)
 *
 * NOTE: This is a documentation stub for HackJKLU v5.0 demo.
 *       Compile with: circom matchVerifier.circom --r1cs --wasm --sym
 *       Then generate proving key with snarkjs.
 */

template AgeCheck() {
    signal input age;         // private: user's actual age
    signal output ageValid;   // public:  1 = 18+, 0 = underage

    // Constraint: ageValid = (age >= 18) ? 1 : 0
    // Simplified with a comparison gate
    signal diff;
    diff <== age - 18;
    // In real Circom use a LessThan/GreaterEqThan component from circomlib
    // For stub: ageValid = 1 when diff >= 0
    ageValid <== 1 - (diff < 0 ? 1 : 0); // pseudocode — replace with IsNegative()
}

template InterestOverlap(N) {
    signal input userInterests[N];    // private: user interest IDs
    signal input targetInterests[N];  // private: target interest IDs
    signal output interestOverlap;    // public:  count of shared IDs

    // Count matching interest pairs (stub; use EqualityCheck components in production)
    var count = 0;
    for (var i = 0; i < N; i++) {
        for (var j = 0; j < N; j++) {
            if (userInterests[i] == targetInterests[j]) {
                count++;
            }
        }
    }
    interestOverlap <== count;
}

template MatchVerifier(N) {
    // Private inputs
    signal input age;
    signal input userInterests[N];
    signal input targetInterests[N];

    // Public outputs
    signal output ageValid;
    signal output interestOverlap;

    component ageCheck = AgeCheck();
    ageCheck.age <== age;
    ageValid <== ageCheck.ageValid;

    component overlap = InterestOverlap(N);
    for (var i = 0; i < N; i++) {
        overlap.userInterests[i] <== userInterests[i];
        overlap.targetInterests[i] <== targetInterests[i];
    }
    interestOverlap <== overlap.interestOverlap;
}

// Instantiate with max 10 interests per user
component main {public []} = MatchVerifier(10);
