/**
 * backend-stack.ts - LEGACY AWS CDK Configuration (DISABLED)
 *
 * This file previously contained AWS CDK stack definitions for Lambda + API Gateway.
 * CottonX has been refactored to use GCP Cloud Run instead.
 *
 * Current Deployment:
 * - Framework: Express.js + WebSocket
 * - Runtime: Node.js on GCP Cloud Run
 * - Database: Firestore (GCP)
 * - Entry Point: src/server.ts
 *
 * This file is kept as a stub for backward compatibility with cdk.json and bin/backend.ts
 */

import 'dotenv/config';

// /**
//  * Legacy Stack Definition - NOT USED IN CURRENT DEPLOYMENT
//  * Kept for reference only. Use GCP Cloud Run + Express.js instead.
//  */
// export class for AWS CDK Stack - Not used in GCP Cloud Run deployment{
//   constructor(scope: any, id: string, props?: any) {
//     console.log('⚠️  Legacy CDK Stack - Not used in GCP Cloud Run deployment');
//     console.log('✅ Using GCP Cloud Run + Express.js (src/server.ts)');
//     return;
//   }
// }
