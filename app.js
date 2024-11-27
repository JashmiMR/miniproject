const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// MongoDB Connection for General Users
mongoose.connect('mongodb://localhost:27017/Database', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const db = mongoose.connection;

db.on('error', () => console.log("Error in connecting to the database"));
db.once('open', () => console.log("Connected to the Database for general users"));

// MongoDB Connection for Death Certificate Data
const deathCertificateDB = mongoose.createConnection('mongodb://localhost:27017/death_certificateDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

deathCertificateDB.on('error', (err) => console.log("Error in connecting to the death certificate database", err));
deathCertificateDB.once('open', () => console.log("Connected to the Database for death certificates"));

// Death Certificate Schema
const deathCertificateSchema = new mongoose.Schema({
  date_of_death: Date,
  gender: String,
  deceased_name: String,
  care_of: String,
  father_husband_name: String,
  deceased_age_years: Number,
  deceased_age_months: Number,
  deceased_age_days: Number,
  deceased_age_hours: Number,
  permanent_address: {
    address_line: String,
    country: String,
    state: String,
    district: String,
    pin: String,
    mobile_no: String,
    email: String,
  },
  place_of_death: {
    place: String,
    address_line: String,
    country: String,
    state: String,
    district: String,
    pin: String,
  },
  files: {
    aadhaar_card: String,
    birth_certificate: String,
    medical_certificate: String,
  },
  informant: {
    name: String,
    sex: String,
    same_as_permanent_address: Boolean,
    relation_with_deceased: String,
    identity_proof: String,
  },
});
const DeathCertificate = deathCertificateDB.model("DeathCertificate", deathCertificateSchema);


// MongoDB Connection for Income Certificate Data
const incomeCertificateDB = mongoose.createConnection('mongodb://localhost:27017/income_certificateDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

incomeCertificateDB.on('error', (err) => console.log("Error in connecting to the income certificate database", err));
incomeCertificateDB.once('open', () => console.log("Connected to the Database for income certificates"));



const incomeCertificateSchema = new mongoose.Schema({
  applicant_name: String,
  age: Number,
  gender: String,
  address: {
    line1: String,
    line2: String,
    city: String,
    state: String,
    pin_code: String,
    country: String,
    mobile: String,
    email: String
  },
  income_details: {
    total_income: Number,
    income_source: String,
    occupation: String,
    monthly_income: Number,
    annual_income: Number,
  },
  family_details: [{
    name: String,
    relation: String,
    age: Number,
    occupation: String,
    income: Number
  }],
  supporting_documents: {
    aadhaar_card: String,  // URL/Path to uploaded Aadhaar card file
    salary_slip: String,   // URL/Path to uploaded salary slip
    bank_statement: String, // URL/Path to bank statement
  },
  generated_otp: Number,  // OTP for verification
  is_verified: Boolean,  // To verify if the certificate is validated
});

const IncomeCertificate = mongoose.model("IncomeCertificate", incomeCertificateSchema);



// Serve the income certificate page
app.get('/income-certificate', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'income-certificate.html'));
});


// Handle the form submission for income certificate
app.post('/submit-income-certificate', (req, res) => {
  const { 
    applicant_name, 
    age, 
    gender, 
    income_details, 
    family_details, 
    supporting_documents, 
    generatedOTP 
  } = req.body;

  console.log("Form Data:", req.body);  // Log the incoming request data

  // Ensure all required fields are present
  if (!applicant_name || !age || !gender || !income_details || !family_details || !supporting_documents) {
    return res.status(400).send("All required fields must be filled.");
  }

  // Create a new income certificate document
  const newIncomeCertificate = new IncomeCertificate({
    applicant_name: applicant_name,
    age: age,
    gender: gender,
    address: {
      line1: req.body.line1,
      line2: req.body.line2,
      city: req.body.city,
      state: req.body.state,
      pin_code: req.body.pin_code,
      country: req.body.country,
      mobile: req.body.mobile,
      email: req.body.email
    },
    income_details: {
      total_income: income_details.total_income,
      income_source: income_details.income_source,
      occupation: income_details.occupation,
      monthly_income: income_details.monthly_income,
      annual_income: income_details.annual_income,
    },
    family_details: family_details.map(familyMember => ({
      name: familyMember.name,
      relation: familyMember.relation,
      age: familyMember.age,
      occupation: familyMember.occupation,
      income: familyMember.income,
    })),
    supporting_documents: {
      aadhaar_card: supporting_documents.aadhaar_card,
      salary_slip: supporting_documents.salary_slip,
      bank_statement: supporting_documents.bank_statement,
    },
    generated_otp: generatedOTP,  // Attach the generated OTP for verification
    is_verified: false,  // Set verification to false initially
  });

  // Save the document to the database
  newIncomeCertificate.save()
    .then(() => {
      res.json({
        message: 'Income certificate data submitted and saved successfully!',
      });
    })
    .catch((err) => {
      console.error('Error saving income certificate:', err);  // Log the error
      res.status(500).send(`Error saving income certificate data: ${err.message}`);
    });
});




// MongoDB Connection
const casteCertificateDB = mongoose.createConnection('mongodb://localhost:27017/caste_certificateDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

casteCertificateDB.on('error', (err) => console.log("Error in connecting to the caste certificate database", err));
casteCertificateDB.once('open', () => console.log("Connected to the Database for caste certificates"));
// Mongoose Schema
const applicationSchema = new mongoose.Schema({
  name: String,
  gender: String,
  dob: Date,
  occupation: String,
  residence: String,
  permanent: String,
  phone: String,
  email: String,
  casteDetails: {
    fatherName: String,
    fatherOccupation: String,
    motherName: String,
    motherOccupation: String,
    caste: String,
    subCaste: String,
    religion: String,
    nationality: String,
  },
  documents: {
    rationCard: String,
    aadharApplicant: String,
    aadharParents: String,
    voterPan: String,
    incomeCert: String,
  },
  otp: Number,
});

const Application = mongoose.model("Application", applicationSchema);

// File Upload Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// Routes
app.get("/caste-certificate", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "caste-certificate.html")); // Serve the form
});

// OTP Generation Helper Function
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
}

// Submit Form
app.post(
  "/submit-caste-certificate",
  upload.fields([
    { name: "rationCard" },
    { name: "aadharApplicant" },
    { name: "aadharParents" },
    { name: "voterPan" },
    { name: "incomeCert" },
  ]),
  async (req, res) => {
    try {
      // Extract form data
      const {
        name,
        gender,
        dob,
        occupation,
        residence,
        permanent,
        phone,
        email,
        fatherName,
        fatherOccupation,
        motherName,
        motherOccupation,
        caste,
        subCaste,
        religion,
        nationality,
      } = req.body;

      const otp = generateOTP(); // Generate an OTP

      // Document file paths
      const documents = {
        rationCard: req.files["rationCard"]?.[0]?.path,
        aadharApplicant: req.files["aadharApplicant"]?.[0]?.path,
        aadharParents: req.files["aadharParents"]?.[0]?.path,
        voterPan: req.files["voterPan"]?.[0]?.path,
        incomeCert: req.files["incomeCert"]?.[0]?.path,
      };

      // Save to MongoDB
      const newApplication = new Application({
        name,
        gender,
        dob,
        occupation,
        residence,
        permanent,
        phone,
        email,
        casteDetails: {
          fatherName,
          fatherOccupation,
          motherName,
          motherOccupation,
          caste,
          subCaste,
          religion,
          nationality,
        },
        documents,
        otp,
      });

      await newApplication.save();

      res.status(200).json({ message: "Application submitted successfully!", otp });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error processing the application." });
    }
  }
);






// Routes for General Users (Home, Login, Register, Selection)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname,'views', 'home.html'));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, 'views','login.html'));
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  db.collection('users').findOne({ email, password }, (err, user) => {
    if (err) {
      return res.status(500).send("Internal server error");
    }
    if (!user) {
      return res.status(401).send("Invalid credentials");
    }
    res.redirect("/register");
  });
});

app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'register.html'));
});

app.post("/register", (req, res) => {
  const { name, age, email, phno, gender, password } = req.body;
  const data = { name, age, email, phno, gender, password };
  db.collection('users').insertOne(data, (err) => {
    if (err) {
      return res.status(500).send("Error in registering user");
    }
    res.redirect("/select");
  });
});

app.get("/select", (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'selection.html'));
});

// Routes for Death Certificate Form
app.get("/death-certificate", (req, res) => {
  res.sendFile(path.join(__dirname,'views', 'death-certificate.html'));  // Change to the appropriate form page for death certificate
});

app.post("/submit-death-certificate", (req, res) => {
  let body = "";
  const files = {};
  req.on("data", (chunk) => { body += chunk; });
  req.on("end", () => {
    const boundary = req.headers["content-type"].split("boundary=")[1];
    const parts = body.split(`--${boundary}`).filter(part => part.trim());
    
    parts.forEach((part) => {
      const [headers, content] = part.split("\r\n\r\n");
      if (headers && content) {
        if (headers.includes("filename=")) {
          const filenameMatch = headers.match(/filename="(.+?)"/);
          const filename = filenameMatch ? filenameMatch[1] : "unknown_file";
          files[filename] = content.trim();
        } else {
          const nameMatch = headers.match(/name="(.+?)"/);
          const fieldName = nameMatch ? nameMatch[1] : null;
          if (fieldName) req.body[fieldName] = content.trim();
        }
      }
    });

    const newCertificate = new DeathCertificate({
      date_of_death: req.body.date_of_death,
      gender: req.body.gender,
      deceased_name: req.body.deceased_name,
      care_of: req.body.care_of,
      father_husband_name: req.body.father_husband_name,
      deceased_age_years: req.body.deceased_age_years,
      deceased_age_months: req.body.deceased_age_months,
      deceased_age_days: req.body.deceased_age_days,
      deceased_age_hours: req.body.deceased_age_hours,
      permanent_address: {
        address_line: req.body.address_line,
        country: req.body.country,
        state: req.body.state,
        district: req.body.district,
        pin: req.body.pin,
        mobile_no: req.body.mobile_no,
        email: req.body.email,
      },
      place_of_death: {
        place: req.body.place_of_death,
        address_line: req.body.death_address_line,
        country: req.body.death_country,
        state: req.body.death_state,
        district: req.body.death_district,
        pin: req.body.death_pin,
      },
      files: {
        aadhaar_card: files["aadhaar_card"] || req.body.aadhaar_card,
        birth_certificate: files["birth_certificate"] || req.body.birth_certificate_proof,
        medical_certificate: files["medical_certificate"] || req.body.medicalcertificate_proof,
      },
      informant: {
        name: req.body.informant_name,
        sex: req.body.informant_sex,
        same_as_permanent_address: req.body.same_as_permanent_address === "true",
        relation_with_deceased: req.body.relation_with_deceased,
        identity_proof: req.body.identity_proof,
      },
    });

    newCertificate.save()
      .then(() => res.send("Death certificate data saved successfully!"))
      .catch((err) => res.status(500).send("Error saving the death certificate data."));
  });

  req.on("error", (err) => {
    console.error("Error reading request:", err);
    res.status(500).send("Error processing the form.");
  });
});

// Serve Static Files
app.get("/style.css", (req, res) => {
  res.sendFile(path.join(__dirname, 'style.css'));
});

app.get("/script.js", (req, res) => {
  res.sendFile(path.join(__dirname, 'script.js'));
});

// Start the server
app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
