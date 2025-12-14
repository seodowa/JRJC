'use client';

import React, { useRef, useState, useEffect } from 'react';
import { ManageEmployee } from '@/types/manageEmployee';
import { AccountType } from '@/app/(admin)/services/manageEmployeeService';
import { Upload } from 'lucide-react';
import { toast } from '@/components/toast/use-toast';
import Modal from '@/components/Modal';

interface EmployeeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any, file: File | null) => Promise<void>;
  employee: ManageEmployee | null;
  accountTypes: AccountType[];
  isSubmitting: boolean;
}

export default function EmployeeFormModal({
  isOpen,
  onClose,
  onSubmit,
  employee,
  accountTypes,
  isSubmitting
}: EmployeeFormModalProps) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    account_type_id: '',
  });
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (employee) {
        setFormData({
          username: employee.Username,
          email: employee.Email,
          password: '',
          account_type_id: employee.account_type_id?.toString() || '',
        });
        setProfileImagePreview(employee.profile_image);
      } else {
        setFormData({ username: '', email: '', password: '', account_type_id: '' });
        setProfileImagePreview(null);
      }
      setSelectedFile(null);
    }
  }, [isOpen, employee]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({ variant: 'destructive', title: 'File too large', description: 'Limit is 10MB' });
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setProfileImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData, selectedFile);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full">
        <h3 className="text-lg font-bold mb-4">{employee ? 'Edit Employee' : 'Add Employee'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image Upload */}
          <div className="flex items-center gap-4">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer overflow-hidden border border-gray-300 hover:opacity-80 transition"
            >
              {profileImagePreview ? (
                <img src={profileImagePreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <Upload size={20} className="text-gray-400" />
              )}
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/png, image/jpeg" 
            />
            <span className="text-sm text-gray-500">Click to upload image (max 10MB)</span>
          </div>

          <input
            type="text"
            placeholder="Username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
          <select
            value={formData.account_type_id}
            onChange={(e) => setFormData({ ...formData, account_type_id: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            required
          >
            <option value="">Select Account Type</option>
            {accountTypes.map(type => (
              <option key={type.id} value={type.id}>{type.type}</option>
            ))}
          </select>
          <input
            type="password"
            placeholder={employee ? "New Password (leave blank to keep)" : "Password"}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            required={!employee}
          />

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
