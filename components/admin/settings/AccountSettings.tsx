'use client';

import React, { useState, useRef, useEffect, useContext } from 'react';
import { Pencil } from 'lucide-react';
import { UserContext } from '@/app/(admin)/context/UserContext';
import { toast } from '@/components/toast/use-toast';
import { updateAccountService } from '@/app/(admin)/services/updateAccountService';
import { convertImageToWebP } from '@/utils/imageUtils';

export default function AccountSettings() {
  const user = useContext(UserContext);
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
  });

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // Track selected file
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        username: user.username || '',
        email: user.email || '', 
      }));
      // Initialize profile image from user data
      if (user.profileImage) {
        setProfileImage(user.profileImage);
      }
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          variant: 'destructive',
          title: 'File too large',
          description: 'Please select an image under 10MB.',
        });
        return;
      }
      
      setSelectedFile(file); // Store file for upload on submit

      // Show preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.username) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "User session not found.",
        });
        return;
    }

    setIsLoading(true);

    try {
      let finalImageUrl = user.profileImage; // Default to existing image

      // 1. Upload new image if selected
      if (selectedFile) {
        // Convert to WebP
        const fileToUpload = await convertImageToWebP(selectedFile);

        const formDataUpload = new FormData();
        formDataUpload.append('file', fileToUpload);
        formDataUpload.append('category', 'profile');

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formDataUpload,
        });

        if (!uploadRes.ok) {
           const err = await uploadRes.json();
           throw new Error(err.error || 'Failed to upload image');
        }

        const { publicUrl } = await uploadRes.json();
        finalImageUrl = publicUrl;
      }

      // 2. Update Account
      const result = await updateAccountService(user.username, {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        image: finalImageUrl
      });

      if (result.success) {
        toast({
            title: "Profile Updated",
            description: "Your account settings have been saved successfully.",
        });
        
        // Reload to refresh session and UI
        window.location.reload(); 
      } else {
        throw new Error(result.message);
      }

    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to update profile.";
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: msg,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-white rounded-3xl p-8 shadow-sm">
      <h2 className="text-xl font-bold text-gray-900 mb-8">Account</h2>

      <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-12">
        {/* Form Fields Column */}
        <div className="flex-1 space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Username: <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="Enter username"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Password: <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="Enter new password (leave empty to keep current)"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Email: <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="Enter email address"
              required
            />
          </div>
        </div>

        {/* Profile Picture Column */}
        <div className="flex flex-col items-center lg:items-start space-y-4">
          <span className="text-sm font-medium text-gray-700 self-center lg:self-start">
            Profile Picture:
          </span>
          
          <div 
            onClick={handleImageClick}
            className="relative group cursor-pointer w-48 h-48 rounded-full bg-gray-200 overflow-hidden border-4 border-white shadow-sm hover:opacity-90 transition-opacity"
          >
            {profileImage ? (
              <img 
                src={profileImage} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gray-300 text-white">
                <Pencil size={48} strokeWidth={2.5} />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all" />
              </div>
            )}
            
            <input 
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png, image/jpeg"
              className="hidden"
            />
          </div>
          
          <p className="text-xs text-gray-400 text-center w-48">
            Supports only JPEG or PNG under 10MB
          </p>
        </div>
      </form>

      {/* Update Button Section */}
      <div className="mt-12 flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="px-8 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-colors shadow-sm disabled:opacity-50"
        >
          {isLoading ? 'Updating...' : 'Update'}
        </button>
      </div>
    </div>
  );
}