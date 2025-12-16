"use client";

import { useState } from 'react';
import { useWalkInBooking } from "@/app/(admin)/context/WalkInBookingContext";
import AsyncButton from "@/components/AsyncButton";

interface PersonalInformationFormProps {
  onNext: () => void;
}

const PersonalInformationForm = ({ onNext }: PersonalInformationFormProps) => {
  const { personalInfo, setPersonalInfo, validIdPath, setValidIdPath } = useWalkInBooking();
  const [isUploadingId, setIsUploadingId] = useState(false);
  const [idUploadError, setIdUploadError] = useState<string | null>(null);

  const handleIdUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        setIdUploadError("Only image files are allowed.");
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        setIdUploadError("File size exceeds 5MB limit.");
        return;
    }

    setIsUploadingId(true);
    setIdUploadError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', 'secure_id');

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload ID");
      }

      setValidIdPath(data.path);
    } catch (error) {
      console.error("ID Upload Error:", error);
      setIdUploadError(error instanceof Error ? error.message : "Upload failed");
      e.target.value = '';
    } finally {
      setIsUploadingId(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "mobileNumber") {
      const numbersOnly = value.replace(/\D/g, "");
      setPersonalInfo((prev) => ({ ...prev, [name]: numbersOnly }));
    } else {
      setPersonalInfo((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Logic to trigger browser validation before moving to Next step
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validIdPath) {
        setIdUploadError("Please upload a valid government ID.");
        return;
    }

    const form = e.currentTarget;
    
    // Check if the HTML5 constraints (required, pattern) are met
    if (form.checkValidity() === false) {
      form.reportValidity(); // Shows the browser's native error bubble
      return; 
    }
    
    onNext();
  };

  return (
    <div className="bg-white p-8 rounded-4xl shadow-md">
      <h2 className="text-xl font-bold mb-6">Personal Information</h2>
      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
              First Name: <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="firstName"
              id="firstName"
              required // REQUIRED
              value={personalInfo.firstName}
              onChange={handleInputChange}
              className="mt-1 p-2 block w-full border-1 border-gray-300 rounded-lg shadow-sm sm:text-sm"
              placeholder="Enter your first name"
            />
          </div>
          <div className="md:col-span-1">
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
              Last Name: <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="lastName"
              id="lastName"
              required // REQUIRED
              value={personalInfo.lastName}
              onChange={handleInputChange}
              className="mt-1 p-2 block w-full border-1 border-gray-300 rounded-lg shadow-sm sm:text-sm"
              placeholder="Enter your last name"
            />
          </div>
          <div className="md:col-span-1">
            <label htmlFor="suffix" className="block text-sm font-medium text-gray-700">
              Suffix:
            </label>
            <input
              type="text"
              name="suffix"
              id="suffix"
              value={personalInfo.suffix}
              onChange={handleInputChange}
              className="mt-1 p-2 block w-20 border-1 border-gray-300 rounded-lg shadow-sm sm:text-sm"
              placeholder="(e.g., Jr.)"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address: {/* Removed * (Optional) */}
            </label>
            <input
              type="email"
              name="email"
              id="email"
              // Optional but validated if entered
              pattern="^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$"
              title="Please enter a valid email address (e.g., user@domain.com)"
              value={personalInfo.email}
              onChange={handleInputChange}
              className="mt-1 p-2 block w-full border-1 border-gray-300 rounded-lg shadow-sm sm:text-sm"
              placeholder="Enter your email address"
            />
          </div>
          <div>
            <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700">
              Mobile Number: <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="mobileNumber"
              id="mobileNumber"
              required // REQUIRED
              value={personalInfo.mobileNumber}
              onChange={handleInputChange}
              className="mt-1 p-2 block w-full border-1 border-gray-300 rounded-lg shadow-sm sm:text-sm"
              placeholder="Enter your mobile number"
            />
          </div>
        </div>
        
      {/* Valid Government ID Upload */}
      <div className="pt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Valid Government ID (Image): <span className="text-red-500">*</span>
        </label>
        
        <div className={`relative flex items-center w-full border rounded-lg overflow-hidden transition-all duration-200 ${idUploadError ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent'}`}>
            <label 
                htmlFor="admin-id-upload" 
                className="cursor-pointer bg-gray-100 text-gray-700 px-4 py-3 text-base border-r border-gray-300 hover:bg-gray-200 transition-colors whitespace-nowrap"
            >
                Browse
            </label>
            <div className="flex-1 px-4 py-3 text-gray-500 truncate bg-white">
                {isUploadingId ? (
                    <span className="text-blue-500">Uploading...</span>
                ) : validIdPath ? (
                    <span className="text-green-600 font-medium">ID uploaded successfully</span>
                ) : (
                    "No file chosen"
                )}
            </div>
            <input 
                id="admin-id-upload"
                type="file" 
                accept="image/*" 
                onChange={handleIdUpload}
                className="hidden"
            />
        </div>
        {idUploadError && <p className="text-xs text-red-500 mt-1">{idUploadError}</p>}
      </div>

        <div className="flex justify-end mt-6">
          <AsyncButton
            type="submit" // Trigger form submit to run validation
            className="bg-[#A1E3F9] hover:bg-blue-400 shadow-sm text-white font-bold py-2 px-4 rounded-lg"
          >
            Next
          </AsyncButton>
        </div>
      </form>
    </div>
  );
};

export default PersonalInformationForm;