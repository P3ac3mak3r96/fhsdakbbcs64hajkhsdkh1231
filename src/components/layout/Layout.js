 // src/components/layout/Layout.js
import React, { useState } from 'react';
import { useAppState } from '../../context/AppContext';
import { 
  Menu, 
  X, 
  Settings, 
  Users, 
  Activity,
  Zap,
  Bell,
  Sun,
  Moon,
  Globe
} from 'lucide-react';

// Navigation Items Definition
const navigationItems = [
  {
    title: 'Clients',
    icon: Users,
    path: '/clients'
  },
  {
    title: 'Training',
    icon: Activity,
    path: '/training'
  },
  {
    title: 'LED Steuerung',
    icon: Zap,
    path: '/led-control'
  },
  {
    title: 'Einstellungen',
    icon: Settings,
    path: '/settings'
  }
];

const Layout = ({ children }) => {
  const { 
    connectionStatus, 
    settings,
    lastError 
  } = useAppState();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleNotifications = () => setNotificationsOpen(!notificationsOpen);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm fixed top-0 left-0 right-0 z-20">
        <div className="h-16 px-4 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Menu className="h-6 w-6 text-gray-500 dark:text-gray-400" />
            </button>
            <h1 className="ml-4 text-xl font-semibold text-gray-900 dark:text-white">
              LED Matrix Control
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => {/* TODO: Implement theme toggle */}}
            >
              {settings.theme === 'dark' ? (
                <Sun className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              ) : (
                <Moon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              )}
            </button>

            {/* Language Selector */}
            <div className="relative">
              <button
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
              >
                <Globe className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {settings.language.toUpperCase()}
                </span>
              </button>
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={toggleNotifications}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Bell className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                {lastError && (
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 transform translate-x-1 -translate-y-1" />
                )}
              </button>

              {/* Notifications Dropdown */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1">
                  {lastError ? (
                    <div className="px-4 py-3">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <X className="h-5 w-5 text-red-500" />
                        </div>
                        <div className="ml-3 w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            Fehler
                          </p>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {lastError}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      Keine neuen Benachrichtigungen
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Connection Status */}
            <div className="flex items-center">
              <div className={`
                h-2 w-2 rounded-full mr-2
                ${connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}
              `} />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {connectionStatus === 'connected' ? 'Verbunden' : 'Getrennt'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 transform transition-transform duration-200 ease-in-out z-30
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Menü
          </h2>
          <button
            onClick={toggleSidebar}
            className="md:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="px-4 py-4">
          <ul className="space-y-2">
            {navigationItems.map(item => (
              <li key={item.path}>
                <a
                  href={item.path}
                  className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  <span>{item.title}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className={`
        pt-16 transition-all duration-200 ease-in-out
        ${sidebarOpen ? 'md:ml-64' : ''}
      `}>
        <div className="container mx-auto px-4 py-6">
          {children}
        </div>
      </main>

      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
};

export default Layout;