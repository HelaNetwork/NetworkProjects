import { Firestore } from '@google-cloud/firestore';
import path from 'path';

let db: Firestore;

export function getFirestore(): Firestore {
  if (!db) {
    const config: any = {
      projectId: process.env.GCP_PROJECT_ID,
    };
    
    // Explicitly mutate the environment variable to an absolute path.
    // The google-auth-library internally reads process.env.GOOGLE_APPLICATION_CREDENTIALS
    // regardless of config.keyFilename, and crashes if it's a relative path on Windows.
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS && !path.isAbsolute(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
      const absPath = path.resolve(process.cwd(), process.env.GOOGLE_APPLICATION_CREDENTIALS.replace(/['"]/g, ''));
      process.env.GOOGLE_APPLICATION_CREDENTIALS = absPath;
      config.keyFilename = absPath;
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      config.keyFilename = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    }

    db = new Firestore(config);
  }
  return db;
}
