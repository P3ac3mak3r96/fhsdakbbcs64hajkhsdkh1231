 // src/components/training/TrainingDashboard.js
import React, { useState } from 'react';
import { useAppState } from '../../context/AppContext';
import TrainingConfig from './TrainingConfig';
import TrainingStatus from './TrainingStatus';
import TrainingStats from './TrainingStats';
import { Users, Activity, Clock, Target } from 'lucide-react';

const TrainingDashboard = () => {
  const { filteredClients } = useAppState();
  const [selectedView, setSelectedView] = useState('overview');

  // Berechne Training-Statistiken
  const activeTrainings = filteredClients.filter(client => client.training?.active);
  const totalClients = filteredClients.length;
  const averageAccuracy = activeTrainings.reduce((acc, client) => 
    acc + (client.training?.stats?.accuracy || 0), 0) / (activeTrainings.length || 1);
  const totalHits = activeTrainings.reduce((acc, client) => 
    acc + (client.training?.stats?.hits || 0), 0);

  // Status Cards Daten
  const statusCards = [
    {
      title: 'Aktive Clients',
      value: totalClients,
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Laufende Trainings',
      value: activeTrainings.length,
      icon: Activity,
      color: 'green'
    },
    {
      title: 'Durchschnittliche Genauigkeit',
      value: `${averageAccuracy.toFixed(1)}%`,
      icon: Target,
      color: 'purple'
    },
    {
      title: 'Gesamte Treffer',
      value: totalHits,
      icon: Clock,
      color: 'orange'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statusCards.map((card, index) => (
          <div 
            key={index}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{card.title}</p>
                <p className="mt-1 text-3xl font-semibold">
                  {card.value}
                </p>
              </div>
              <div className={`
                rounded-lg p-3
                ${card.color === 'blue' ? 'bg-blue-100 text-blue-600' : ''}
                ${card.color === 'green' ? 'bg-green-100 text-green-600' : ''}
                ${card.color === 'purple' ? 'bg-purple-100 text-purple-600' : ''}
                ${card.color === 'orange' ? 'bg-orange-100 text-orange-600' : ''}
              `}>
                <card.icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View Selection */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              className={`
                px-6 py-3 border-b-2 text-sm font-medium
                ${selectedView === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
              onClick={() => setSelectedView('overview')}
            >
              Übersicht
            </button>
            <button
              className={`
                px-6 py-3 border-b-2 text-sm font-medium
                ${selectedView === 'config'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
              onClick={() => setSelectedView('config')}
            >
              Konfiguration
            </button>
            <button
              className={`
                px-6 py-3 border-b-2 text-sm font-medium
                ${selectedView === 'stats'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
              onClick={() => setSelectedView('stats')}
            >
              Statistiken
            </button>
          </nav>
        </div>

        <div className="p-6">
          {selectedView === 'overview' && (
            <div className="space-y-6">
              {/* Active Trainings */}
              {activeTrainings.length > 0 ? (
                activeTrainings.map(client => (
                  <TrainingStatus 
                    key={client.id}
                    client={client}
                  />
                ))
              ) : (
                <div className="text-center py-12">
                  <Activity className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    Keine aktiven Trainings
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Starten Sie ein neues Training für einen oder mehrere Clients.
                  </p>
                  <div className="mt-6">
                    <button
                      onClick={() => setSelectedView('config')}
                      className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Training konfigurieren
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {selectedView === 'config' && (
            <TrainingConfig />
          )}

          {selectedView === 'stats' && (
            <TrainingStats clients={filteredClients} />
          )}
        </div>
      </div>
    </div>
  );
};

export default TrainingDashboard;
