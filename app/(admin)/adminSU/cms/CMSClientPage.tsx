"use client";

import React, { useEffect, useState } from 'react';
import { fetchCMSContentClient } from '@/lib/supabase/queries/cms-client';
import { CMSContent } from '@/types/cms';
import { updateCMSContent } from '@/app/(admin)/services/cmsService';
import AsyncButton from '@/components/AsyncButton';
import { toast } from 'react-hot-toast'; // Assuming you have react-hot-toast setup
import { PhotoIcon } from '@heroicons/react/24/solid' // Assuming you have heroicons setup

import { convertImageToWebP } from '@/utils/imageUtils';

// Helper component for content sections
interface ContentSectionProps {
  title: string;
  sectionKey: string;
  contentMap: Record<string, CMSContent>;
  onUpdate: (payload: { section: string; key: string; value?: string | null; image_url?: string | null }) => Promise<void>;
  fields: {
    key: string;
    label: string;
    type: 'text' | 'textarea' | 'number' | 'image_url';
    placeholder?: string;
  }[];
}

const ContentSection: React.FC<ContentSectionProps> = ({ title, sectionKey, contentMap, onUpdate, fields }) => {
  const [formData, setFormData] = useState<Record<string, string | number | null>>({});
  const [loading, setLoading] = useState(false);
  const [uploadingState, setUploadingState] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const initialData: Record<string, string | number | null> = {};
    fields.forEach(field => {
      const item = contentMap[field.key];
      if (item) {
        if (field.type === 'image_url') {
          initialData[field.key] = item.image_url;
        } else if (field.type === 'number') {
          initialData[field.key] = item.value ? parseFloat(item.value) : null;
        }
        else {
          initialData[field.key] = item.value;
        }
      } else {
        initialData[field.key] = ''; // Default empty
      }
    });
    setFormData(initialData);
  }, [contentMap, fields]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? null : parseFloat(value)) : value
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldKey: string) => {
    const originalFile = e.target.files?.[0];
    if (!originalFile) return;

    setUploadingState(prev => ({ ...prev, [fieldKey]: true }));
    
    // Capture old URL for deletion
    const oldUrl = formData[fieldKey]?.toString();

    try {
      // Convert to WebP
      const file = await convertImageToWebP(originalFile);

      const uploadData = new FormData();
      uploadData.append('file', file);
      uploadData.append('category', 'misc'); // CMS images go to misc for now

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Upload failed');
      }

      const data = await res.json();
      setFormData(prev => ({
        ...prev,
        [fieldKey]: data.publicUrl
      }));

      // Delete old image if it exists and upload was successful
      if (oldUrl && oldUrl.includes('/images/')) {
        try {
            await fetch('/api/upload', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: oldUrl })
            });
            // We don't block on this or show success toast for cleanup, just log it
            console.log('Old image deleted:', oldUrl);
        } catch (delErr) {
            console.error('Failed to delete old image:', delErr);
        }
      }

      toast.success('Image converted to WebP and uploaded successfully!');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setUploadingState(prev => ({ ...prev, [fieldKey]: false }));
      // Reset file input
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      for (const field of fields) {
        const payload: { section: string; key: string; value?: string | null; image_url?: string | null } = {
          section: sectionKey,
          key: field.key
        };
        if (field.type === 'image_url') {
          payload.image_url = formData[field.key]?.toString() || null;
          payload.value = null;
        } else {
          payload.value = formData[field.key]?.toString() || null;
          payload.image_url = null;
        }
        await onUpdate(payload);
      }
      toast.success(`${title} section updated successfully!`);
    } catch (error: any) {
      toast.error(`Error updating ${title} section: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id={sectionKey} className="bg-white p-6 rounded-lg shadow mb-6 border border-gray-100">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">{title}</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {fields.map(field => (
          <div key={field.key}>
            <label htmlFor={`${sectionKey}-${field.key}`} className="block text-sm font-medium text-gray-700 mb-2">
              {field.label}
            </label>
            
            {field.type === 'textarea' ? (
              <textarea
                id={`${sectionKey}-${field.key}`}
                name={field.key}
                value={formData[field.key]?.toString() || ''}
                onChange={handleChange}
                rows={5}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 text-sm"
                placeholder={field.placeholder}
              ></textarea>
            ) : field.type === 'image_url' ? (
              <div className="flex flex-col space-y-3">
                {formData[field.key] ? (
                  <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                    <img 
                      src={formData[field.key]?.toString()} 
                      alt="Preview" 
                      className="w-full h-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, [field.key]: '' }))}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow hover:bg-red-600 transition-colors"
                      title="Remove Image"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="w-full h-32 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex flex-col justify-center items-center text-gray-500">
                    <PhotoIcon className="h-8 w-8 mb-1 text-gray-400" />
                    <span className="text-sm">No image selected</span>
                  </div>
                )}
                
                <div className="flex items-center">
                  <input
                    type="file"
                    id={`${sectionKey}-${field.key}-upload`}
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, field.key)}
                    className="hidden"
                    disabled={uploadingState[field.key]}
                  />
                  <label
                    htmlFor={`${sectionKey}-${field.key}-upload`}
                    className={`cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${uploadingState[field.key] ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    {uploadingState[field.key] ? (
                      <>
                        <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-t-2 border-b-2 border-gray-700 rounded-full"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <PhotoIcon className="-ml-1 mr-2 h-5 w-5 text-gray-500" aria-hidden="true" />
                        {formData[field.key] ? 'Change Image' : 'Upload Image'}
                      </>
                    )}
                  </label>
                </div>
              </div>
            ) : (
              <input
                type={field.type === 'number' ? 'number' : 'text'}
                id={`${sectionKey}-${field.key}`}
                name={field.key}
                value={formData[field.key]?.toString() || ''}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 text-sm"
                placeholder={field.placeholder}
              />
            )}
          </div>
        ))}
        <AsyncButton
          type="submit"
          isLoading={loading}
          loadingText="Saving..."
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-md transition-colors shadow-sm"
        >
          Save {title}
        </AsyncButton>
      </form>
    </div>
  );
};

const CMSClientPage: React.FC = () => {
  const [cmsContent, setCmsContent] = useState<CMSContent[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);

  useEffect(() => {
    const loadCMSContent = async () => {
      try {
        const content = await fetchCMSContentClient();
        setCmsContent(content);
      } catch (error) {
        console.error("Failed to fetch CMS content:", error);
        toast.error("Failed to load CMS content.");
      } finally {
        setLoadingInitial(false);
      }
    };
    loadCMSContent();
  }, []);

  const contentMap = React.useMemo(() => {
    return cmsContent.reduce((acc, item) => {
      if (!acc[item.section]) {
        acc[item.section] = {};
      }
      acc[item.section][item.key] = item;
      return acc;
    }, {} as Record<string, Record<string, CMSContent>>);
  }, [cmsContent]);

  const handleUpdate = async (payload: { section: string; key: string; value?: string | null; image_url?: string | null }) => {
    try {
      await updateCMSContent(payload);
      // Refresh local state to reflect changes
      const updatedItemIndex = cmsContent.findIndex(
        item => item.section === payload.section && item.key === payload.key
      );
      if (updatedItemIndex > -1) {
        const newCmsContent = [...cmsContent];
        if (payload.image_url !== undefined) newCmsContent[updatedItemIndex].image_url = payload.image_url;
        if (payload.value !== undefined) newCmsContent[updatedItemIndex].value = payload.value;
        setCmsContent(newCmsContent);
      } else {
        // If it's a new item (shouldn't happen with upsert but good for robustness)
        setCmsContent(prev => [...prev, {
            section: payload.section,
            key: payload.key,
            value: payload.value ?? null,
            image_url: payload.image_url ?? null
        }]);
      }
      toast.success("Content updated successfully!");
    } catch (error: any) {
      toast.error(`Error updating content: ${error.message}`);
      throw error; // Re-throw to be caught by ContentSection's handler
    }
  };

  const scrollToSection = (key: string) => {
    const element = document.getElementById(key);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const sections = [
    { key: 'hero', label: 'Hero' },
    { key: 'about', label: 'About' },
    { key: 'footer', label: 'Footer' },
    { key: 'navigation', label: 'Navigation' },
    { key: 'metadata', label: 'Metadata' },
    { key: 'fees', label: 'Fees' },
    { key: 'sms', label: 'SMS' },
  ];

  if (loadingInitial) {
    return (
      <div className="p-8 text-center text-gray-500">Loading CMS content...</div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Fixed Header */}
      <div className="p-8 pb-4 flex-none bg-white border-b border-gray-200 z-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Content Management System</h1>
        
        {/* Section Navigation */}
        <div className="flex overflow-x-auto pb-2 -mx-1 hide-scrollbar">
          {sections.map((section) => (
            <button
              key={section.key}
              onClick={() => scrollToSection(section.key)}
              className="mx-1 px-4 py-2 bg-gray-100 hover:bg-blue-50 text-gray-700 hover:text-blue-600 rounded-full text-sm font-medium transition-colors whitespace-nowrap"
            >
              {section.label}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-8 pt-4">
        {loadingInitial ? (
          <div className="flex justify-center items-center h-64">
             <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <ContentSection
              title="Hero Section"
              sectionKey="hero"
              contentMap={contentMap.hero || {}}
              onUpdate={handleUpdate}
              fields={[
                { key: 'subtitle', label: 'Subtitle', type: 'text', placeholder: 'Car Rental Services' },
                { key: 'main_image', label: 'Main Background Image', type: 'image_url' },
                { key: 'text_image', label: 'Text/Logo Image', type: 'image_url' },
              ]}
            />

            {/* About Section */}
            <ContentSection
              title="About Section"
              sectionKey="about"
              contentMap={contentMap.about || {}}
              onUpdate={handleUpdate}
              fields={[
                { key: 'title', label: 'Title', type: 'text', placeholder: 'About Us' },
                { key: 'content', label: 'Content (HTML allowed)', type: 'textarea', placeholder: 'Enter about us content...' },
              ]}
            />

            {/* Footer Section */}
            <ContentSection
              title="Footer Section"
              sectionKey="footer"
              contentMap={contentMap.footer || {}}
              onUpdate={handleUpdate}
              fields={[
                { key: 'facebook_url', label: 'Facebook URL', type: 'text', placeholder: 'https://www.facebook.com/...' },
                { key: 'facebook_text', label: 'Facebook Display Text', type: 'text', placeholder: 'JRJC Car Rental' },
                { key: 'email', label: 'Email Address', type: 'text', placeholder: 'email@example.com' },
                { key: 'phone', label: 'Phone Number', type: 'text', placeholder: '+63 9XX XXX XXXX' },
              ]}
            />

            {/* Navigation Section */}
            <ContentSection
              title="Navigation Bar"
              sectionKey="navigation"
              contentMap={contentMap.navigation || {}}
              onUpdate={handleUpdate}
              fields={[
                { key: 'logo', label: 'Navigation Logo URL', type: 'image_url', placeholder: '/images/jrjc_logo.png' },
              ]}
            />

            {/* Metadata Section */}
            <ContentSection
              title="Website Metadata"
              sectionKey="metadata"
              contentMap={contentMap.metadata || {}}
              onUpdate={handleUpdate}
              fields={[
                { key: 'icon', label: 'Favicon URL', type: 'image_url', placeholder: '/images/jrjc_logo.png' },
              ]}
            />

            {/* Fees Section */}
            <ContentSection
              title="Booking Fees"
              sectionKey="fees"
              contentMap={contentMap.fees || {}}
              onUpdate={handleUpdate}
              fields={[
                { key: 'booking_fee', label: 'Booking Fee (PHP)', type: 'number', placeholder: '500' },
                { key: 'car_wash_fee', label: 'Car Wash Fee (PHP)', type: 'number', placeholder: '300' },
              ]}
            />

            {/* SMS Templates Section */}
            <ContentSection
              title="SMS Templates"
              sectionKey="sms"
              contentMap={contentMap.sms || {}}
              onUpdate={handleUpdate}
              fields={[
                { key: 'booking_approved', label: 'Booking Approved Message', type: 'textarea', placeholder: 'Hi {name}, Good news! Your booking (ID: {id}) has been APPROVED. See you soon!' },
                { key: 'booking_declined', label: 'Booking Declined Message', type: 'textarea', placeholder: 'Hi {name}, we regret to inform you that your booking (ID: {id}) has been DECLINED. Please contact us for details.' },
                { key: 'rental_started', label: 'Rental Started Message', type: 'textarea', placeholder: 'Hi {name}, your rental (ID: {id}) has officially STARTED. Drive safely!' },
                { key: 'booking_completed', label: 'Booking Completed Message', type: 'textarea', placeholder: 'Hi {name}, your booking (ID: {id}) has been COMPLETED. Thank you for choosing us!' },
                { key: 'booking_cancelled_by_admin', label: 'Booking Cancelled (Admin)', type: 'textarea', placeholder: 'Hi {name}, your booking (ID: {id}) has been CANCELLED by the admin. Please contact us if this is a mistake.' },
                { key: 'booking_cancelled_by_user', label: 'Booking Cancelled (User)', type: 'textarea', placeholder: 'Hi {name}, your booking (ID: {id}) has been successfully CANCELLED. We hope to see you again next time.' },
              ]}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CMSClientPage;