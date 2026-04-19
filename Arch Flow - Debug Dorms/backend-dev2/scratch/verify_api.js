const axios = require('axios');

async function test() {
  try {
    const res = await axios.post('http://localhost:3001/api/analyze', {
      files: [{ id: "index.js", content: "", extension: ".js" }],
      dependencies: []
    });
    
    console.log("Response Keys:", Object.keys(res.data));
    console.log("Graph Nodes Count:", res.data.graph.nodes.length);
    console.log("NodeMap Keys:", Object.keys(res.data.nodeMap));
    console.log("Default View:", res.data.views.default);
    console.log("First Node ID:", res.data.graph.nodes[0].id);
  } catch (err) {
    console.error(err.message);
  }
}

test();
