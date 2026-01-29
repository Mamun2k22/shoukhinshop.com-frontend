import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 

const Otp = () => {
  const [otp, setOtp] = useState(['', '', '', '']);
  const inputRefs = useRef([]);
  const navigate = useNavigate();

  // Handle each digit change
  const handleChange = (value, index) => {
    if (/^\d$/.test(value) || value === '') {
      setOtp((prevOtp) => {
        const newOtp = [...prevOtp];
        newOtp[index] = value;

        // Automatically move to the next input if the current one is filled
        if (value && index < otp.length - 1) {
          inputRefs.current[index + 1].focus();
        }

        return newOtp;
      });
    }
  };

  // Handle backspace navigation
  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  // Old Handle OTP form submission
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const enteredOtp = otp.join('');

    if (enteredOtp.length !== 4) {
      toast.error('Please enter the complete OTP.');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_APP_SERVER_URL}api/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: localStorage.getItem('email'), // Get email stored during signup
          otp: enteredOtp,
        }),
      });

      if (response.ok) {
        toast.success('Email verified successfully');
        localStorage.removeItem('email'); // Clear stored email after verification
        navigate('/login');
      } else {
        const error = await response.json();
        toast.error(`Invalid OTP: ${error.message}`);
      }
    } catch (error) {
      toast.error('Network error during OTP verification. Please try again.');
    }
  };
  

  return (
    <div className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-gray-50 py-12">
      <div className="relative bg-white px-6 pt-10 pb-9 shadow-2xl mx-auto w-full max-w-lg rounded-2xl">
        <div className="mx-auto flex w-full max-w-md flex-col space-y-16">
          <div className="flex flex-col items-center justify-center text-center space-y-2">
            <div className="font-semibold text-3xl">
              <p>Email Verification</p>
            </div>
            <div className="flex flex-row text-sm font-medium text-gray-400">
              <p>We have sent a code to your email</p>
            </div>
          </div>

          <div>
            <form onSubmit={handleOtpSubmit}>
              <div className="flex flex-col space-y-16">
                <div className="flex flex-row items-center justify-between mx-auto w-full max-w-xs">
                  {otp.map((digit, index) => (
                    <div key={index} className="w-16 h-16">
                      <input
                        type="text"
                        className="w-full h-full flex flex-col items-center justify-center text-center px-5 outline-none rounded-xl border border-gray-300 text-lg bg-white focus:bg-gray-50 focus:ring-1 ring-blue-700"
                        maxLength="1"
                        value={digit}
                        onChange={(e) => handleChange(e.target.value, index)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        ref={(el) => (inputRefs.current[index] = el)}
                      />
                    </div>
                  ))}
                </div>

                <div className="flex flex-col space-y-5">
                  <div>
                    <button
                      type="submit"
                      className="flex flex-row items-center justify-center text-center w-full border rounded-xl outline-none py-5 bg-blue-700 border-none text-white text-sm shadow-sm"
                    >
                      Verify Account
                    </button>
                  </div>

                  {/* <div className="flex flex-row items-center justify-center text-center text-sm font-medium space-x-1 text-gray-500">
                    <p>Didn't receive the code?</p>
                    <a
                      className="flex flex-row items-center text-blue-600"
                      href="#"
                      onClick={() => toast.info('Resending OTP...')}
                    >
                      Resend
                    </a>
                  </div> */}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Otp;
