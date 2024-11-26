// src/hooks/useTraining.js
import { useState, useEffect } from 'react';
import { trainingService } from '../services/training/trainingService';

export const useTraining = (clientId) => {
  const [activeSession, setActiveSession] = useState(null);
  const [sessionHistory, setSessionHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleSessionUpdate = (session) => {
      if (session.clientId === clientId) {
        setActiveSession(session);
      }
    };

    const handleSessionComplete = (session) => {
      if (session.clientId === clientId) {
        setActiveSession(null);
        setSessionHistory(prev => [session, ...prev]);
      }
    };

    const handleError = ({ session, error }) => {
      if (session.clientId === clientId) {
        setError(error);
        setActiveSession(null);
      }
    };

    // Event Listener registrieren
    trainingService.on('sessionUpdated', handleSessionUpdate);
    trainingService.on('sessionCompleted', handleSessionComplete);
    trainingService.on('sessionError', handleError);

    // Initial State laden
    setActiveSession(trainingService.getActiveSession(clientId));
    setSessionHistory(trainingService.getClientHistory(clientId));
    setLoading(false);

    // Cleanup
    return () => {
      trainingService.off('sessionUpdated', handleSessionUpdate);
      trainingService.off('sessionCompleted', handleSessionComplete);
      trainingService.off('sessionError', handleError);
    };
  }, [clientId]);

  const startTraining = async (config) => {
    try {
      setError(null);
      await trainingService.startTraining(clientId, config);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const stopTraining = async () => {
    try {
      setError(null);
      await trainingService.stopTraining(clientId);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const pauseTraining = async () => {
    try {
      setError(null);
      await trainingService.pauseTraining(clientId);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const resumeTraining = async () => {
    try {
      setError(null);
      await trainingService.resumeTraining(clientId);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const getRecommendation = () => {
    return trainingService.recommendNextTraining(clientId);
  };

  const getStats = () => {
    return trainingService.getClientStats(clientId);
  };

  return {
    activeSession,
    sessionHistory,
    loading,
    error,
    startTraining,
    stopTraining,
    pauseTraining,
    resumeTraining,
    getRecommendation,
    getStats
  };
};