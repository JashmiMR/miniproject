const express = require('express');
const path = require('path');
const multer = require('multer');
const router = express.Router();

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({ storage });

// GET route to serve the HTML form
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../views', 'caste-certificate.html'));
});

// POST route to handle form submission
router.post('/', upload.fields([
  { name: 'rationCard' },
  { name: 'aadharApplicant' },
  { name: 'aadharParents' },
  { name: 'incomeCert' },
]), (req, res) => {
  const { phone, otp } = req.body;

  // OTP validation logic
  if (otp !== '123456') {
    return res.status(400).json({ message: 'Invalid OTP!' });
  }

  console.log('Form Data:', req.body);
  console.log('Uploaded Files:', req.files);

  // Save data to the database (example placeholder)
  res.json({ message: 'Application Submitted Successfully!' });
});

module.exports = router;
