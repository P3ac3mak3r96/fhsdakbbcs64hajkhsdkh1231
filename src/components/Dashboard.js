// src/components/Dashboard.js
import React, { useState } from 'react';
import { Users, Activity, Settings } from 'lucide-react';
import ClientManagement from './clients/ClientManagement';
import TrainingConfig from './training/TrainingConfig';
import TrainingStatus from './training/TrainingStatus';
import SystemSettings from './settings/SystemSettings';

const TABS = [
  {
    id: 'clients',
    label: 'Clients',
    icon: Users,
    component: ClientManagement
  },
  {
    id: 'training',
    label: 'Training',
    icon: Activity,
    component: TrainingConfig
  },
  {
    id: 'settings',
    label: 'Einstellungen',
    icon: Settings,
    component: SystemSettings
  }
];

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('clients');

  const ActiveComponent = TABS.find(tab => tab.id === activeTab)?.component || ClientManagement;

  return (
    <div className="h-full">
      {/* Tab Navigation */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex -mb-px">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                group inline-flex items-center py-4 px-6 border-b-2 font-medium text-sm
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <tab.icon className={`
                mr-2 h-5 w-5
                ${activeTab === tab.id
                  ? 'text-blue-500'
                  : 'text-gray-400 group-hover:text-gray-500'
                }
              `} />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Active Component */}
      <div className="h-full">
        <ActiveComponent />
      </div>
    </div>
  );
};

export default Dashboard;