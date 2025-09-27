'use client';

import { Toaster as SonnerToaster } from 'sonner';

export default function Toaster() {
  // Render Sonner's Toaster configured for the admin UI
  return (
    <SonnerToaster
      position="top-right"
      richColors
      closeButton
      expand={false}
      toastOptions={{
        duration: 3500,
      }}
    />
  );
}
