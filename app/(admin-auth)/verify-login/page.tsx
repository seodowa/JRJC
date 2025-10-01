
'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

const VerifyLoginPage: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const [message, setMessage] = useState('Verifying your login...');

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setMessage('Invalid verification link.');
        return;
      }

      try {
        const response = await fetch('/api/auth/verify-login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        if (response.ok) {
          setMessage('Verification successful! Redirecting to dashboard...');
          setTimeout(() => {
            router.push('/adminSU/dashboard');
          }, 2000);
        } else {
          const data = await response.json();
          setMessage(data.error || 'Verification failed.');
        }
      } catch (error) {
        setMessage('An error occurred during verification.');
      }
    };

    void verifyToken();
  }, [token, router]);

  const handleRedirect = () => {
    router.push('/adminSU/dashboard');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold mb-4">Login Verification</h1>
        <p className="text-gray-600">{message}</p>
        {message.includes('successful') && (
          <button
            onClick={handleRedirect}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-200"
          >
            Go to Dashboard
          </button>
        )}
      </div>
    </div>
  );
};

export default VerifyLoginPage;
