// src/components/clients/ClientToolbar.js
import React from 'react';
import { useAppState, Actions } from '../../context/AppContext';
import { 
  Search, 
  Grid, 
  List, 
  Filter,
  RefreshCw,
  Users,
  Play,
  Settings
} from 'lucide-react';
import Button from '../ui/Button';

const ClientToolbar = () => {
  const { 
    filteredClients, 
    selectedClients, 
    filter,
    view,
    search,
    dispatch,
    wsService
  } = useAppState();

  const handleRefresh = () => {
    wsService.requestClientList();
  };

  const handleStartTraining = () => {
    // TODO: Implement training start
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center md:justify-between">
        {/* Left Side */}
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 md:w-64">
            <input
              type="text"
              placeholder="Clients suchen..."
              className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={search}
              onChange={(e) => dispatch(Actions.setSearch(e.target.value))}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>

          <div className="flex items-center space-x-2">
            <button
              className={`p-2 rounded-md ${view === 'grid' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
              onClick={() => dispatch(Actions.setView('grid'))}
            >
              <Grid className="h-5 w-5" />
            </button>
            <button
              className={`p-2 rounded-md ${view === 'list' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
              onClick={() => dispatch(Actions.setView('list'))}
            >
              <List className="h-5 w-5" />
            </button>
          </div>

          <Button
            variant="ghost"
            icon={RefreshCw}
            onClick={handleRefresh}
          >
            Aktualisieren
          </Button>
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-4">
          <select
            className="py-2 pl-3 pr-10 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filter}
            onChange={(e) => dispatch(Actions.setFilter(e.target.value))}
          >
            <option value="all">Alle Clients</option>
            <option value="active">Aktive Clients</option>
            <option value="inactive">Inaktive Clients</option>
            <option value="training">In Training</option>
          </select>

          {selectedClients.size > 0 && (
            <>
              <Button
                variant="primary"
                icon={Play}
                onClick={handleStartTraining}
              >
                Training starten
              </Button>

              <Button
                variant="ghost"
                icon={Settings}
              >
                Einstellungen
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Selection Info */}
      {selectedClients.size > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="text-sm text-gray-600">
                {selectedClients.size} Client{selectedClients.size !== 1 && 's'} ausgewählt
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dispatch(Actions.selectAll())}
              >
                Alle auswählen
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dispatch(Actions.deselectAll())}
              >
                Auswahl aufheben
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientToolbar;