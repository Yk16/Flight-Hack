import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Ensure uploads directory exists
const UPLOADS_DIR = path.join(process.cwd(), 'uploads', 'houses');
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
    filename: (_req, file, cb) => {
        const timestamp = Date.now();
        const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
        cb(null, `${timestamp}_${safeName}`);
    },
});

const upload = multer({ storage });

// POST /api/v1/uploads - accepts one or more files under `files` field
router.post('/', upload.array('files', 10), (req, res) => {
    const files = (req.files || []) as Express.Multer.File[];
    const host = req.get('host');
    const protocol = req.protocol;

    const urls = files.map((f) => `${protocol}://${host}/uploads/houses/${encodeURIComponent(path.basename(f.path))}`);

    return res.json({ success: true, files: urls });
});

export const uploadsRoutes = router;
