'use client';

import React, { useState, useContext } from 'react';
import { UserContext } from '@/app/(admin)/context/UserContext';
import Link from 'next/link';
import AccountSettings from '@/components/admin/settings/AccountSettings';
import ManageEmployees from '@/components/admin/settings/ManageEmployees';

export default function SettingsPage() {
  const user = useContext(UserContext);
  const [activeTab, setActiveTab] = useState('account'); // 'account' or 'employees'

  return (
    <div className="flex flex-col md:flex-row gap-6 h-full">
      {/* Left Settings Navigation Panel */}
      <div className="w-full md:w-64 bg-white rounded-3xl p-6 shadow-sm h-fit">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Settings</h2>
        
        <nav className="space-y-2">
          <button 
            onClick={() => setActiveTab('account')}
            className={`w-full text-left px-6 py-3 rounded-xl font-medium transition-colors ${
              activeTab === 'account' ? 'bg-sky-200 text-gray-800' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Account
          </button>
          
          {user?.account_type === 'owner' && (
            <>
              <Link 
                href="/adminSU/cms" 
                className="block w-full text-left px-6 py-3 rounded-xl text-gray-600 hover:bg-gray-100 font-medium transition-colors"
              >
                Content Management
              </Link>
              <button 
                onClick={() => setActiveTab('employees')}
                className={`w-full text-left px-6 py-3 rounded-xl font-medium transition-colors ${
                  activeTab === 'employees' ? 'bg-sky-200 text-gray-800' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Manage Employees
              </button>
            </>
          )}
        </nav>
      </div>

      {/* Right Content Panel */}
      {activeTab === 'account' && <AccountSettings />}
      {activeTab === 'employees' && <ManageEmployees />}
    </div>
  );
}