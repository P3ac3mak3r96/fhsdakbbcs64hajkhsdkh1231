 
// src/context/AppContext.js
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { wsService } from '../services/websocket';

// Initial State
const initialState = {
  clients: new Map(),
  selectedClients: new Set(),
  connectionStatus: 'disconnected',
  lastError: null,
  loading: true,
  filter: 'all',
  view: 'grid',
  search: '',
  settings: {
    theme: 'light',
    language: 'de',
    notifications: true
  }
};

// Action Types
export const ActionTypes = {
  SET_CLIENTS: 'SET_CLIENTS',
  UPDATE_CLIENT: 'UPDATE_CLIENT',
  REMOVE_CLIENT: 'REMOVE_CLIENT',
  SELECT_CLIENT: 'SELECT_CLIENT',
  DESELECT_CLIENT: 'DESELECT_CLIENT',
  SELECT_ALL: 'SELECT_ALL',
  DESELECT_ALL: 'DESELECT_ALL',
  SET_CONNECTION_STATUS: 'SET_CONNECTION_STATUS',
  SET_ERROR: 'SET_ERROR',
  SET_LOADING: 'SET_LOADING',
  SET_FILTER: 'SET_FILTER',
  SET_VIEW: 'SET_VIEW',
  SET_SEARCH: 'SET_SEARCH',
  UPDATE_SETTINGS: 'UPDATE_SETTINGS'
};

// Reducer
function appReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_CLIENTS:
      return {
        ...state,
        clients: new Map(action.payload.map(client => [client.id, client]))
      };

    case ActionTypes.UPDATE_CLIENT:
      const updatedClients = new Map(state.clients);
      updatedClients.set(action.payload.id, {
        ...updatedClients.get(action.payload.id),
        ...action.payload
      });
      return {
        ...state,
        clients: updatedClients
      };

    case ActionTypes.REMOVE_CLIENT:
      const newClients = new Map(state.clients);
      newClients.delete(action.payload);
      const newSelected = new Set(state.selectedClients);
      newSelected.delete(action.payload);
      return {
        ...state,
        clients: newClients,
        selectedClients: newSelected
      };

    case ActionTypes.SELECT_CLIENT:
      return {
        ...state,
        selectedClients: new Set([...state.selectedClients, action.payload])
      };

    case ActionTypes.DESELECT_CLIENT:
      const selectedWithoutOne = new Set(state.selectedClients);
      selectedWithoutOne.delete(action.payload);
      return {
        ...state,
        selectedClients: selectedWithoutOne
      };

    case ActionTypes.SELECT_ALL:
      return {
        ...state,
        selectedClients: new Set(state.clients.keys())
      };

    case ActionTypes.DESELECT_ALL:
      return {
        ...state,
        selectedClients: new Set()
      };

    case ActionTypes.SET_CONNECTION_STATUS:
      return {
        ...state,
        connectionStatus: action.payload,
        lastError: action.payload === 'connected' ? null : state.lastError
      };

    case ActionTypes.SET_ERROR:
      return {
        ...state,
        lastError: action.payload
      };

    case ActionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };

    case ActionTypes.SET_FILTER:
      return {
        ...state,
        filter: action.payload
      };

    case ActionTypes.SET_VIEW:
      return {
        ...state,
        view: action.payload
      };

    case ActionTypes.SET_SEARCH:
      return {
        ...state,
        search: action.payload
      };

    case ActionTypes.UPDATE_SETTINGS:
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload
        }
      };

    default:
      return state;
  }
}

// Context
const AppContext = createContext(null);
const AppDispatchContext = createContext(null);

// Provider Component
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    // WebSocket Event Handler Setup
    wsService.on('connection', (status) => {
      dispatch({ 
        type: ActionTypes.SET_CONNECTION_STATUS, 
        payload: status.status 
      });
      
      if (status.status === 'connected') {
        wsService.requestClientList();
      }
    });

    wsService.on('clientList', (data) => {
      dispatch({ type: ActionTypes.SET_CLIENTS, payload: data.clients });
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    });

    wsService.on('clientUpdate', (data) => {
      dispatch({ type: ActionTypes.UPDATE_CLIENT, payload: data.client });
    });

    wsService.on('clientRemoved', (data) => {
      dispatch({ type: ActionTypes.REMOVE_CLIENT, payload: data.clientId });
    });

    wsService.on('error', (error) => {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
    });

    // Connect WebSocket
    wsService.connect();

    // Cleanup
    return () => {
      wsService.disconnect();
    };
  }, []);

  // Filtered Clients berechnen
  const getFilteredClients = () => {
    let filtered = Array.from(state.clients.values());
    
    // Filter anwenden
    switch (state.filter) {
      case 'active':
        filtered = filtered.filter(client => client.status === 'active');
        break;
      case 'inactive':
        filtered = filtered.filter(client => client.status === 'inactive');
        break;
      case 'training':
        filtered = filtered.filter(client => client.training?.active);
        break;
    }

    // Suche anwenden
    if (state.search) {
      const searchLower = state.search.toLowerCase();
      filtered = filtered.filter(client => 
        client.name.toLowerCase().includes(searchLower) ||
        client.ip.includes(searchLower)
      );
    }

    return filtered;
  };

  const contextValue = {
    ...state,
    filteredClients: getFilteredClients(),
    dispatch,
    wsService
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

// Custom Hooks
export function useAppState() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppProvider');
  }
  return context;
}

// Action Creators
export const Actions = {
  selectClient: (clientId) => ({
    type: ActionTypes.SELECT_CLIENT,
    payload: clientId
  }),

  deselectClient: (clientId) => ({
    type: ActionTypes.DESELECT_CLIENT,
    payload: clientId
  }),

  selectAll: () => ({
    type: ActionTypes.SELECT_ALL
  }),

  deselectAll: () => ({
    type: ActionTypes.DESELECT_ALL
  }),

  setFilter: (filter) => ({
    type: ActionTypes.SET_FILTER,
    payload: filter
  }),

  setView: (view) => ({
    type: ActionTypes.SET_VIEW,
    payload: view
  }),

  setSearch: (search) => ({
    type: ActionTypes.SET_SEARCH,
    payload: search
  }),

  updateSettings: (settings) => ({
    type: ActionTypes.UPDATE_SETTINGS,
    payload: settings
  }),

  setError: (error) => ({
    type: ActionTypes.SET_ERROR,
    payload: error
  })
};