import { ImageKit } from '@imagekit/nodejs'
import multer from 'multer'
import 'dotenv/config'

const imagekit = new ImageKit({
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY ?? ''
})

const storage = multer.memoryStorage()

export const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Only image files are allowed'))
        }
        cb(null, true)
    },
})

export async function uploadFile(buffer: Buffer, fileName?: string) {
    const result = await imagekit.files.upload({
        file: buffer.toString('base64'),
        fileName: fileName ?? `image_${Date.now()}.jpg`,
    })

    return {
        url: result.url,
        fileId: result.fileId,
    }
}