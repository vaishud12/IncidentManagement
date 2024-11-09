import React, { useRef, useState } from 'react';
import axios from 'axios';
import logo from "./logo.jpeg";
import bg from "./bg.jpeg"
import * as API from "../Endpoint/Endpoint";

const ForgetPassword = () => {
  const [alertMessage, setAlertMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const emailRef = useRef();

  const handleForgetPassword = (e) => {
    e.preventDefault();
    const email = emailRef.current.value;

    if (!email) {
      setAlertMessage("Please enter your email");
    } else {
      axios.post(API.POST_FORGET_PASSWORD, { email })
        .then((res) => {
          setSuccessMessage("Password reset link has been sent to your email");
          setAlertMessage(null); // Clear any previous error messages
        })
        .catch((error) => {
          setSuccessMessage(null); // Clear any previous success messages
          setAlertMessage("Something went wrong, please try again");
        });
    }
  };

  return (
    <div className="relative flex flex-col justify-center min-h-screen py-12 sm:px-6 lg:px-8">
  {/* Dark overlay with increased opacity */}
  <div className="absolute inset-0 bg-black opacity-60 z-0"></div>
  
  {/* Background Image */}
  <div
    className="absolute inset-0 z-0"
    style={{
      backgroundImage: `url(${bg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      opacity:'0.4',
    }}
  ></div>

  {/* Content Container */}
  <div className="relative z-10 mt-8 sm:mx-auto sm:w-full sm:max-w-md">
    <div className="flex justify-center mb-4">
      <img src={logo} alt="Logo" className="h-12" />
    </div>
    <div className="px-4 py-8 bg-white shadow sm:rounded-lg sm:px-10">
      <h2 className="mb-6 text-3xl font-extrabold text-center text-gray-900">Forgot Password</h2>
      
      {/* Alert Messages */}
      {alertMessage && (
        <div className="mb-4 text-red-500">{alertMessage}</div>
      )}
      {successMessage && (
        <div className="mb-4 text-green-500">{successMessage}</div>
      )}
      
      {/* Form */}
      <form onSubmit={handleForgetPassword}>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email address
          </label>
          <div className="mt-1">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              ref={emailRef}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>
        <div className="mt-6">
          <button
            type="submit"
            className="flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Send Reset Link
          </button>
        </div>
      </form>
    </div>
  </div>
</div>

  );
};

export default ForgetPassword;
