"use client";

import React, { useEffect, useState } from 'react';
import { fetchCMSContentClient } from '@/lib/supabase/queries/cms-client';
import { CMSContent } from '@/types/cms';
import { updateCMSContent } from '@/app/(admin)/services/cmsService';
import { toast } from 'react-hot-toast'; 
import ContentSection from '@/components/admin/cms/ContentSection';

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
              title="Booking Fees & Payment"
              sectionKey="fees"
              contentMap={contentMap.fees || {}}
              onUpdate={handleUpdate}
              fields={[
                { key: 'booking_fee', label: 'Booking Fee (PHP)', type: 'number', placeholder: '500' },
                { key: 'car_wash_fee', label: 'Car Wash Fee (PHP)', type: 'number', placeholder: '300' },
                { key: 'payment_qr_code', label: 'Payment QR Code', type: 'image_url' },
              ]}
            />

            {/* SMS Templates Section */}
            <ContentSection
              title="SMS Templates"
              sectionKey="sms"
              contentMap={contentMap.sms || {}}
              onUpdate={handleUpdate}
              fields={[
                { key: 'booking_received', label: 'Booking Received Message', type: 'textarea', placeholder: 'Hi {name}, booking (ID: {id}) received. Status: {status}. Total: P{total}. Ref: {ref}. Reminders: Booking fee is non-refundable. Keep posted and we will notify you once confirmed.' },
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
