import React, { useEffect, useState } from 'react';
import { CMSContent } from '@/types/cms';
import AsyncButton from '@/components/AsyncButton';
import { toast } from 'react-hot-toast'; 
import { PhotoIcon } from '@heroicons/react/24/solid';
import { convertImageToWebP } from '@/utils/imageUtils';

export interface ContentSectionProps {
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

export default ContentSection;
