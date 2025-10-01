
import React from 'react';

const CheckEmailPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Check your email</h1>
        <p className="text-gray-600">We've sent a verification link to your email address. Please check your inbox and click the link to complete the login process.</p>
      </div>
    </div>
  );
};

export default CheckEmailPage;
