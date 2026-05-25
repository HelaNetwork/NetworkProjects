# AI Agent Backend Service

A minimal backend service that runs an AI agent and writes the agent output into a single file.

## Install

1. Install dependencies:

```bash
npm install
```

## Run

```bash
npm start
```

Or for development with automatic restarts:

```bash
npm run dev
```

## API

POST `/agent/run`

Request body:

```json
{
  "input": "Hello AI"
}
```

Response contains the AI output and the path to `output/ai-output.txt`.

## Extension

- Replace `src/aiAgent.js` with your custom AI agent integration.
- Merge this service with another system by importing `src/routes/agentRoutes.js` or using the same `runAgent` service.
