"use client";

import React, { useState } from 'react';
import { useWallet } from '@/components/modules/auth/hooks/wallet.hook';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  User,
  Key,
  LogOut,
  CreditCard,
  Search,
  Menu,
  X
} from 'lucide-react';

interface SidebarProps {
  activeSection: 'dashboard' | 'profile' | 'api-key' | 'credentials' | 'my-credentials' | 'search-credential';
  onSectionChange: (section: 'dashboard' | 'profile' | 'api-key' | 'credentials' | 'my-credentials' | 'search-credential') => void;
  children?: React.ReactNode;
}

export function Sidebar({ activeSection, onSectionChange, children }: SidebarProps) {
  const { handleDisconnect } = useWallet();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    {
      id: 'dashboard' as const,
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Overview & Stats'
    },
    {
      id: 'profile' as const,
      label: 'Profile',
      icon: User,
      description: 'Wallet Information'
    },
    {
      id: 'api-key' as const,
      label: 'API Key',
      icon: Key,
      description: 'Generate & Manage'
    },
    {
      id: 'credentials' as const,
      label: 'Create Credential',
      icon: CreditCard,
      description: 'Create & Issue'
    },
    {
      id: 'my-credentials' as const,
      label: 'My Credentials',
      icon: CreditCard,
      description: 'View & Manage'
    },
    {
      id: 'search-credential' as const,
      label: 'Search Credential',
      icon: Search,
      description: 'Search by Hash'
    }
  ];

  return (
    <div className="flex w-full min-h-screen bg-transparent">
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-80 transform transition-transform duration-300 ease-in-out lg:transform-none ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} bg-black/40 backdrop-blur-xl border-r border-white/20 shadow-2xl`}>
        {/* Header */}
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 flex items-center justify-center">
                <img src="/logo.png" alt="ACTA Logo" className="w-10 h-10" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">ACTA</h1>
                <p className="text-sm text-muted-foreground">dApp Dashboard</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;

              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      onSectionChange(item.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-foreground border border-blue-500/30 shadow-lg'
                        : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs opacity-70">{item.description}</p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/20">
          <Button
            variant="ghost"
            onClick={handleDisconnect}
            className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 rounded-2xl"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Disconnect Wallet
          </Button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
        {/* Mobile header */}
        <header className="flex h-16 items-center gap-2 px-4 lg:hidden border-b border-white/20">
          <button
            onClick={() => setIsOpen(true)}
            className="p-2 bg-black/40 backdrop-blur-xl border border-white/20 text-foreground hover:bg-black/60 shadow-2xl rounded-2xl"
          >
            <Menu className="w-5 h-5" />
          </button>
        </header>

        {/* Main content area */}
        <main className="flex-1 p-6 lg:p-8 bg-transparent">
          {children}
        </main>
      </div>
    </div>
  );
}