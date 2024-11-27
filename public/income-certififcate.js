let generatedOTP;

function sendOTP() {
    const phoneNumber = document.getElementById("contact").value;
    if (!phoneNumber) {
        alert("Please enter a phone number.");
        return;
    }

    generatedOTP = Math.floor(100000 + Math.random() * 900000);
    alert('OTP sent to ${phoneNumber}: ${generatedOTP}');

    document.getElementById("otpInput").disabled = false;
}




async function validateForm(event) {
  event.preventDefault();

  const formData = new FormData(document.getElementById('incomeForm'));
  formData.append('generatedOTP', generatedOTP); // Attach the generated OTP

  // Log the form data to ensure it's being sent properly
  for (let pair of formData.entries()) {
      console.log(pair[0]+ ': ' + pair[1]);
  }

  try {
      const response = await fetch('/submit-income-certificate', {
          method: 'POST',
          body: formData
      });

      const result = await response.json();

      if (response.ok) {
          alert(result.message);
      } else {
          alert(result.message);
      }
  } catch (error) {
      alert('An error occurred. Please try again later.');
      console.error(error);
  }
}

