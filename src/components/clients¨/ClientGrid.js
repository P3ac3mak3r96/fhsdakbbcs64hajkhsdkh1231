// src/components/clients/ClientGrid.js
import React from 'react';
import { useAppState } from '../../context/AppContext';
import ClientCard from './ClientCard';
import ClientToolbar from './ClientToolbar';
import { AlertCircle } from 'lucide-react';

const ClientGrid = () => {
  const { 
    filteredClients, 
    loading, 
    lastError,
    view 
  } = useAppState();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (lastError) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <p className="text-red-500">{lastError}</p>
      </div>
    );
  }

  if (filteredClients.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="rounded-full bg-gray-100 p-3 mx-auto w-fit">
          <Users className="h-6 w-6 text-gray-400" />
        </div>
        <h3 className="mt-4 text-sm font-medium text-gray-900">Keine Clients gefunden</h3>
        <p className="mt-1 text-sm text-gray-500">
          Es wurden keine Clients gefunden, die den Filterkriterien entsprechen.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ClientToolbar />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredClients.map(client => (
          <ClientCard 
            key={client.id} 
            client={client} 
          />
        ))}
      </div>
    </div>
  );
};

export default ClientGrid;