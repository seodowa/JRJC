'use client';

import React, { useState, useContext } from 'react';
import { UserContext } from '@/app/(admin)/context/UserContext';
import Link from 'next/link';
import AccountSettings from '@/components/admin/settings/AccountSettings';
import ManageEmployees from '@/components/admin/settings/ManageEmployees';

const tabClass = (active: boolean) =>
  `-mb-px border-b-2 pb-3 text-[15px] whitespace-nowrap transition-colors duration-150 ${
    active ? 'border-ink font-medium text-ink' : 'border-transparent text-ink-2 hover:text-ink'
  }`;

export default function SettingsPage() {
  const user = useContext(UserContext);
  const [activeTab, setActiveTab] = useState('account'); // 'account' or 'employees'

  return (
    <div className="flex h-full flex-col gap-7">
      <h1 className="text-4xl leading-none font-normal tracking-[-0.03em] md:text-5xl">Settings</h1>

      <nav className="w-full overflow-x-auto border-b border-line custom-scrollbar" role="tablist">
        <div className="flex min-w-max gap-7">
          <button role="tab" aria-selected={activeTab === 'account'} onClick={() => setActiveTab('account')} className={tabClass(activeTab === 'account')}>
            Account
          </button>
          {user?.account_type === 'owner' && (
            <>
              <button role="tab" aria-selected={activeTab === 'employees'} onClick={() => setActiveTab('employees')} className={tabClass(activeTab === 'employees')}>
                Manage employees
              </button>
              <Link href="/adminSU/cms" className={tabClass(false)}>
                Content management →
              </Link>
            </>
          )}
        </div>
      </nav>

      {activeTab === 'account' && <AccountSettings />}
      {activeTab === 'employees' && <ManageEmployees />}
    </div>
  );
}
