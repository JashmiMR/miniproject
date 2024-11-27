app.post('/submit', (req, res) => {
  const { applicant_name, age, gender, income_details, family_details, supporting_documents, generatedOTP } = req.body;

  // Check if OTP is correct (assuming you are storing it in session or doing some validation here)
  if (generatedOTP !== correctOTP) {
      return res.status(400).json({ message: 'Invalid OTP!' });
  }

  // Process and save the form data to the database (or do whatever you need to do with the data)
  const newCertificate = new IncomeCertificate({
      applicant_name,
      age,
      gender,
      income_details,
      family_details,
      supporting_documents
  });

  newCertificate.save()
      .then(() => {
          res.json({ message: 'Income certificate data submitted successfully!' });
      })
      .catch((err) => {
          console.error('Error saving data:', err);
          res.status(500).json({ message: 'Error saving the income certificate data.' });
      });
});
