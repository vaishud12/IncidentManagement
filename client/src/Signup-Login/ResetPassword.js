import React, { useRef, useState } from 'react';
import axios from 'axios';
import logo from "./logo.jpeg"
import bg from "./bg.jpeg"
import { useParams, useNavigate } from 'react-router-dom';
import * as API from "../Endpoint/Endpoint";
const ResetPassword = () => {
  const [alertMessage, setAlertMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const passwordRef = useRef();
  const confirmPasswordRef = useRef();
  const { token } = useParams();
  const navigate = useNavigate();

  const handleResetPassword = async (e) => {
    e.preventDefault();
    const password = passwordRef.current.value;
    const confirmPassword = confirmPasswordRef.current.value;

    if (!password || !confirmPassword) {
      setAlertMessage("Please fill all fields");
    } else if (password !== confirmPassword) {
      setAlertMessage("Passwords do not match");
    } else {
      try {
        await axios.post(API.GET_RESET_PASSWORD, { password, token });
        setSuccessMessage("Password has been reset successfully");
        setTimeout(() => navigate('/'), 3000); // Redirect after 3 seconds
      } catch (error) {
        console.error('Error resetting password:', error); // Log the error for debugging
        setSuccessMessage(null); // Clear any previous success messages
        setAlertMessage("Something went wrong, please try again");
      }
    }
  };

  return (
    <div className="flex flex-col justify-center min-h-screen py-12 sm:px-6 lg:px-8">
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

<div className="relative z-10 mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div className="flex justify-center mb-4">
        <img src={logo} alt="Logo" className="h-12" />
      </div>
        <div className="px-4 py-8 bg-white shadow sm:rounded-lg sm:px-10">
          <h2 className="mb-6 text-3xl font-extrabold text-center text-gray-900">Reset Password</h2>
          {alertMessage && (
            <div className="mb-4 text-red-500">{alertMessage}</div>
          )}
          {successMessage && (
            <div className="mb-4 text-green-500">{successMessage}</div>
          )}
          <form onSubmit={handleResetPassword}>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  ref={passwordRef}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
            <div className="mt-4">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  ref={confirmPasswordRef}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
            <div className="mt-6">
              <button
                type="submit"
                className="w-full px-4 py-2 font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Reset Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
