import { validateInput } from "./utils/validator";
import { buildArchitectureGraph } from "./graph/graphBuilder";
import { buildViews } from "./views/viewBuilder";
import { tokenize } from "./utils/tokenizer";
import { deepFreeze } from "./utils/deepFreeze";
import { handleQuery } from "./ai/queryHandler";

const runTest = (name: string, input: any) => {
  console.log(`\n--- TEST: ${name} ---`);
  try {
    const { files, dependencies } = validateInput(input.files || [], input.dependencies || []);
    const { graph, nodeMap, searchIndex } = buildArchitectureGraph({ files, dependencies });
    const { nodes, edges } = graph;
    const { views, queryContext } = buildViews(nodes, nodeMap);

    // Hardening checks
    console.log("Nodes Count:", nodes.length);
    console.log("Edges Count:", edges.length);
    console.log("Is Large Graph Flag:", nodes.length > 200);

    // 1. Position finite check
    const invalidPos = nodes.find((n: any) => !Number.isFinite(n.position.x) || !Number.isFinite(n.position.y));
    if (invalidPos) console.error("❌ Position Failure for node:", invalidPos.id);
    else console.log("✅ All positions are finite");

    // 2. Search Index Consistency
    if (searchIndex["auth"]) {
        console.log("Search for 'auth':", searchIndex["auth"]);
    }

    // 3. Immutability check
    try {
        deepFreeze(nodeMap);
        (nodeMap as any).test = "should fail";
        console.error("❌ Immutability Failure: Object not frozen");
    } catch (e) {
        console.log("✅ Immutability Success: Object is frozen");
    }

    // 4. Parity check
    if (Object.keys(nodeMap).length === nodes.length) {
        console.log("✅ NodeMap Parity Success");
    } else {
        console.error("❌ NodeMap Parity Failure");
    }

    console.log("✅ TEST PASSED");
  } catch (err) {
    console.error("❌ TEST FAILED:", err);
  }
};

// Test Tokenizer
console.log("\n--- Tokenizer Check ---");
const tokens = tokenize("src/services/Auth_Service-v2.ts");
console.log("Tokens for 'src/services/Auth_Service-v2.ts':", tokens);
if (tokens.includes("auth") && tokens.includes("service") && tokens.includes("v2")) {
    console.log("✅ Tokenizer Success");
} else {
    console.error("❌ Tokenizer Failure");
}

// 1. Normal Input
runTest("Normal Input", {
  files: [
    { id: "src/index.ts", content: "", extension: ".ts" },
    { id: "src/controllers/userController.ts", content: "", extension: ".ts" },
    { id: "src/services/userService.ts", content: "", extension: ".ts" },
    { id: "src/utils/helper.ts", content: "", extension: ".ts" },
  ],
  dependencies: [
    { from: "src/index.ts", to: "src/controllers/userController.ts" },
    { from: "src/controllers/userController.ts", to: "src/services/userService.ts" },
  ]
});

// 2. Empty Input
runTest("Empty Input", { files: [], dependencies: [] });

// 3. Large Dataset
const largeFiles = Array.from({ length: 201 }, (_, i) => ({
  id: `src/file_${i}.ts`,
  content: "",
  extension: ".ts"
}));
runTest("Large Dataset Check", { files: largeFiles, dependencies: [] });

// AI Query Pipeline Tests
const runQueryTest = (name: string, query: string, context: any) => {
    console.log(`\n--- QUERY TEST: ${name} [Query: "${query}"] ---`);
    const response = handleQuery({ query, context });
    console.log("Answer:", response.answer);
    console.log("Highlights:", response.highlightNodes);
    console.log("Focus Node:", response.focusNode);
    if (response.highlightNodes.length > 0 && response.focusNode) {
        console.log("✅ Query Success");
    } else {
        console.error("❌ Query Failure");
    }
};

// Mock Analysis Result for Queries
const mockContext = buildArchitectureGraph({
    files: [
        { id: "src/auth/authService.ts", content: "", extension: ".ts" },
        { id: "src/auth/loginController.ts", content: "", extension: ".ts" },
        { id: "src/db/connection.ts", content: "", extension: ".ts" },
        { id: "src/index.ts", content: "", extension: ".ts" }
    ],
    dependencies: [
        { from: "src/index.ts", to: "src/auth/loginController.ts" }
    ]
});

runQueryTest("Direct Token Match", "authentication", mockContext);
runQueryTest("Multi Token Match", "auth service", mockContext);
runQueryTest("Random Irrelevant Query", "xyzabc", mockContext);
runQueryTest("Empty Query", "", mockContext);
