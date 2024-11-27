const express = require('express');
const path = require('path');
const multer = require('multer');
const CasteCertificate = require('./models/CasteCertificate'); // Import your MongoDB model

const router = express.Router();

// File Upload Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'), // Ensure "uploads/" folder exists
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// OTP Mock Storage (In-memory for simplicity)
const otpStore = {};

// GET Route to Serve the Form
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../views', 'caste-certificate.html'));
});

// POST Route to Send OTP
router.post('/send-otp', (req, res) => {
  const { phone } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000); // Generate random 6-digit OTP
  otpStore[phone] = otp; // Store OTP temporarily
  console.log(`OTP for ${phone}: ${otp}`); // For development only
  res.json({ message: 'OTP sent successfully!', otp }); // Send OTP for development (mock)
});

// POST Route to Handle Form Submission
router.post(
  '/submit-caste-certificate',
  upload.fields([
    { name: 'rationCard' },
    { name: 'aadharApplicant' },
    { name: 'aadharParents' },
    { name: 'incomeCert' },
  ]),
  async (req, res) => {
    const { phone, otp, name, gender, dob, occupation, residence, permanent, fatherName, fatherOccupation, motherName, motherOccupation, caste, subCaste, religion, nationality } = req.body;

    // Validate OTP
    if (otpStore[phone] !== parseInt(otp)) {
      return res.status(400).json({ message: 'Invalid OTP!' });
    }

    try {
      // Create a new entry in MongoDB
      const newCertificate = new CasteCertificate({
        personal_details: {
          name,
          gender,
          date_of_birth: new Date(dob),
          occupation,
          residence_address: residence,
          permanent_address: permanent,
          phone_no: phone,
        },
        caste_details: {
          father_name: fatherName,
          father_occupation: fatherOccupation,
          mother_name: motherName,
          mother_occupation: motherOccupation,
          caste,
          sub_caste: subCaste,
          religion,
          nationality,
        },
        documents: {
          ration_card: req.files['rationCard'] ? req.files['rationCard'][0].path : '',
          aadhaar_applicant: req.files['aadharApplicant'] ? req.files['aadharApplicant'][0].path : '',
          aadhaar_parents: req.files['aadharParents'] ? req.files['aadharParents'][0].path : '',
          income_certificate: req.files['incomeCert'] ? req.files['incomeCert'][0].path : '',
        },
      });

      // Save the document to MongoDB
      await newCertificate.save();

      // Send Success Response
      res.json({ message: 'Application submitted successfully!', applicationId: newCertificate._id });
    } catch (error) {
      console.error('Error saving application:', error);
      res.status(500).json({ message: 'Error saving application!', error });
    }
  }
);

module.exports = router;
