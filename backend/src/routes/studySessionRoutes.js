const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  createStudySession,
  getStudySessions,
  deleteStudySession,
  getStudyReport,
} = require('../controllers/studySessionController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Configure Multer for proof image uploads
const uploadDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const upload = multer({ storage });

router.use(protect);

router
  .route('/')
  .post(upload.single('proofImage'), createStudySession)
  .get(getStudySessions);
router.route('/:id').delete(deleteStudySession);
router.route('/report/download').get(getStudyReport);

module.exports = router;

