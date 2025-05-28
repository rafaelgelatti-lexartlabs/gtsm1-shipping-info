const router = require('express').Router();
const multer = require('multer');
const { bulk } = require('./controller');
const fs = require('fs');

tempStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/';

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage: tempStorage });

router.post('/', upload.single('file'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'File not found.' });
        }
        await bulk(req.file);

        return res.json({ message: 'Success' });
    } catch (error) {
        console.error(error);
        return next(error)
    }
});

module.exports = router;