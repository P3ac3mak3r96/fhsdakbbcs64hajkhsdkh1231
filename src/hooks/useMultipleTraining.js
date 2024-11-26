// src/hooks/useMultipleTraining.js
import { useState, useCallback, useEffect } from 'react';
import { trainingService } from '../services/training/trainingService';

export const useMultipleTraining = (clientIds) => {
  const [sessions, setSessions] = useState(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Effekt zum Verfolgen der aktiven Trainingssessions
  useEffect(() => {
    const handleSessionUpdate = (session) => {
      setSessions(prev => new Map(prev).set(session.clientId, session));
    };

    const handleSessionComplete = (session) => {
      setSessions(prev => {
        const newSessions = new Map(prev);
        newSessions.delete(session.clientId);
        return newSessions;
      });
    };

    const handleError = ({ session, error }) => {
      setError(error);
      if (session) {
        setSessions(prev => {
          const newSessions = new Map(prev);
          newSessions.delete(session.clientId);
          return newSessions;
        });
      }
    };

    // Event Listener registrieren
    trainingService.on('sessionUpdated', handleSessionUpdate);
    trainingService.on('sessionCompleted', handleSessionComplete);
    trainingService.on('sessionError', handleError);

    // Cleanup
    return () => {
      trainingService.off('sessionUpdated', handleSessionUpdate);
      trainingService.off('sessionCompleted', handleSessionComplete);
      trainingService.off('sessionError', handleError);
    };
  }, []);

  // Callback zum Starten des Trainings für alle Clients
  const startTrainingForAll = useCallback(async (config) => {
    if (!clientIds || clientIds.size === 0) {
      throw new Error('Keine Clients ausgewählt');
    }

    setLoading(true);
    setError(null);

    try {
      const results = await Promise.all(
        Array.from(clientIds).map(clientId =>
          trainingService.startTraining(clientId, config)
        )
      );

      // Überprüfen ob alle Trainings erfolgreich gestartet wurden
      const failedStarts = results.filter(result => !result.success);
      if (failedStarts.length > 0) {
        throw new Error(`${failedStarts.length} Training(s) konnten nicht gestartet werden`);
      }

      return results;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [clientIds]);

  // Callback zum Stoppen aller aktiven Trainings
  const stopTrainingForAll = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const activeClientIds = Array.from(sessions.keys());
      const results = await Promise.all(
        activeClientIds.map(clientId =>
          trainingService.stopTraining(clientId)
        )
      );

      // Überprüfen ob alle Trainings erfolgreich gestoppt wurden
      const failedStops = results.filter(result => !result.success);
      if (failedStops.length > 0) {
        throw new Error(`${failedStops.length} Training(s) konnten nicht gestoppt werden`);
      }

      return results;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [sessions]);

  // Callback zum Pausieren aller aktiven Trainings
  const pauseTrainingForAll = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const activeClientIds = Array.from(sessions.keys());
      const results = await Promise.all(
        activeClientIds.map(clientId =>
          trainingService.pauseTraining(clientId)
        )
      );

      // Überprüfen ob alle Trainings erfolgreich pausiert wurden
      const failedPauses = results.filter(result => !result.success);
      if (failedPauses.length > 0) {
        throw new Error(`${failedPauses.length} Training(s) konnten nicht pausiert werden`);
      }

      return results;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [sessions]);

  // Callback zum Fortsetzen aller pausierten Trainings
  const resumeTrainingForAll = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const activeClientIds = Array.from(sessions.keys());
      const results = await Promise.all(
        activeClientIds.map(clientId =>
          trainingService.resumeTraining(clientId)
        )
      );

      // Überprüfen ob alle Trainings erfolgreich fortgesetzt wurden
      const failedResumes = results.filter(result => !result.success);
      if (failedResumes.length > 0) {
        throw new Error(`${failedResumes.length} Training(s) konnten nicht fortgesetzt werden`);
      }

      return results;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [sessions]);

  // Hilfsfunktionen für Statistiken
  const getActiveTrainings = useCallback(() => {
    return Array.from(sessions.values());
  }, [sessions]);

  const getTrainingStats = useCallback(() => {
    const activeTrainings = getActiveTrainings();
    if (activeTrainings.length === 0) return null;

    return {
      totalSessions: activeTrainings.length,
      averageAccuracy: activeTrainings.reduce((sum, session) => 
        sum + session.stats.accuracy, 0) / activeTrainings.length,
      totalHits: activeTrainings.reduce((sum, session) => 
        sum + session.stats.hits, 0),
      totalMisses: activeTrainings.reduce((sum, session) => 
        sum + session.stats.misses, 0),
      averageReactionTime: activeTrainings.reduce((sum, session) => 
        sum + session.stats.avgReactionTime, 0) / activeTrainings.length
    };
  }, [getActiveTrainings]);

  return {
    sessions,
    loading,
    error,
    startTrainingForAll,
    stopTrainingForAll,
    pauseTrainingForAll,
    resumeTrainingForAll,
    getActiveTrainings,
    getTrainingStats
  };
};