"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import { CMSContent } from '@/types/cms';

interface CMSContextType {
  cmsContent: Record<string, Record<string, CMSContent>>;
  getText: (section: string, key: string, defaultValue?: string) => string;
  getImage: (section: string, key: string, defaultValue?: string) => string;
  getNumber: (section: string, key: string, defaultValue?: number) => number;
}

const CMSContext = createContext<CMSContextType | undefined>(undefined);

export const useCMS = () => {
  const context = useContext(CMSContext);
  if (!context) {
    throw new Error('useCMS must be used within a CMSProvider');
  }
  return context;
};

interface CMSProviderProps {
  children: ReactNode;
  initialContent: CMSContent[];
}

export const CMSProvider: React.FC<CMSProviderProps> = ({ children, initialContent }) => {
  // Transform array to nested map: section -> key -> item
  const cmsMap = React.useMemo(() => {
    return initialContent.reduce((acc, item) => {
      if (!acc[item.section]) {
        acc[item.section] = {};
      }
      acc[item.section][item.key] = item;
      return acc;
    }, {} as Record<string, Record<string, CMSContent>>);
  }, [initialContent]);

  const getText = (section: string, key: string, defaultValue: string = ''): string => {
    return cmsMap[section]?.[key]?.value || defaultValue;
  };

  const getImage = (section: string, key: string, defaultValue: string = ''): string => {
    return cmsMap[section]?.[key]?.image_url || defaultValue;
  };
  
  const getNumber = (section: string, key: string, defaultValue: number = 0): number => {
      const val = cmsMap[section]?.[key]?.value;
      return val ? parseFloat(val) : defaultValue;
  }

  return (
    <CMSContext.Provider value={{ cmsContent: cmsMap, getText, getImage, getNumber }}>
      {children}
    </CMSContext.Provider>
  );
};
