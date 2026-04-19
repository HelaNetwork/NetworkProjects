import multer from 'multer';
import 'dotenv/config';
export declare const upload: multer.Multer;
export declare function uploadFile(buffer: Buffer, fileName?: string): Promise<{
    url: string | undefined;
    fileId: string | undefined;
}>;
//# sourceMappingURL=imageKit.config.d.ts.map