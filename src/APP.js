// src/App.js
import React from 'react';
import { AppProvider } from './context/AppContext';
import { NotificationProvider } from './context/NotificationContext';
import Layout from './components/layout/Layout';
import Dashboard from './components/Dashboard';

const App = () => {
  return (
    <AppProvider>
      <NotificationProvider>
        <Layout>
          <Dashboard />
        </Layout>
      </NotificationProvider>
    </AppProvider>
  );
};

export default App;