// src/services/training/trainingService.js
import { wsService } from '../websocket';
import TrainingUtils from './trainingUtils';
import { SessionStatus } from './trainingTypes';

class TrainingService {
  constructor() {
    this.activeSessions = new Map();
    this.sessionHistory = new Map();
    this.listeners = new Map();
    
    // WebSocket Event Handler registrieren
    this.setupWebSocketHandlers();
  }

  /**
   * Initialisiert die WebSocket Event Handler
   */
  setupWebSocketHandlers() {
    wsService.on('trainingStarted', this.handleTrainingStarted.bind(this));
    wsService.on('trainingUpdate', this.handleTrainingUpdate.bind(this));
    wsService.on('trainingCompleted', this.handleTrainingCompleted.bind(this));
    wsService.on('trainingError', this.handleTrainingError.bind(this));
  }

  /**
   * Startet eine neue Trainingssession
   * @param {number} clientId - Die Client ID
   * @param {TrainingConfig} config - Die Trainingskonfiguration
   * @returns {Promise<void>}
   */
  async startTraining(clientId, config) {
    // Validiere Konfiguration
    const validation = TrainingUtils.validateTrainingConfig(config);
    if (!validation.isValid) {
      throw new Error(`Ungültige Trainingskonfiguration: ${validation.errors.join(', ')}`);
    }

    // Generiere Zielpattern
    const targets = TrainingUtils.generateTargetPattern(config);

    // Erstelle neue Session
    const session = {
      id: `${clientId}-${Date.now()}`,
      clientId,
      config,
      targets,
      startTime: Date.now(),
      status: SessionStatus.PENDING,
      stats: {
        hits: 0,
        misses: 0,
        accuracy: 0,
        avgReactionTime: 0,
        score: 0
      }
    };

    // Speichere Session
    this.activeSessions.set(clientId, session);

    // Sende Startbefehl an Client
    try {
      await wsService.send('startTraining', {
        clientId,
        config,
        targets,
        sessionId: session.id
      });
    } catch (error) {
      this.activeSessions.delete(clientId);
      throw new Error(`Fehler beim Starten des Trainings: ${error.message}`);
    }

    // Benachrichtige Listener
    this.notifyListeners('sessionStarted', session);
  }

  /**
   * Stoppt eine aktive Trainingssession
   * @param {number} clientId - Die Client ID
   * @returns {Promise<void>}
   */
  async stopTraining(clientId) {
    const session = this.activeSessions.get(clientId);
    if (!session) {
      throw new Error('Keine aktive Trainingssession gefunden');
    }

    try {
      await wsService.send('stopTraining', { clientId, sessionId: session.id });
      
      session.status = SessionStatus.COMPLETED;
      session.endTime = Date.now();
      
      // Aktualisiere Statistiken ein letztes Mal
      const finalStats = TrainingUtils.calculateTrainingStats(session);
      session.stats = finalStats;

      // Verschiebe Session in Historie
      this.sessionHistory.set(session.id, session);
      this.activeSessions.delete(clientId);

      // Benachrichtige Listener
      this.notifyListeners('sessionCompleted', session);
    } catch (error) {
      throw new Error(`Fehler beim Stoppen des Trainings: ${error.message}`);
    }
  }

  /**
   * Pausiert eine aktive Trainingssession
   * @param {number} clientId - Die Client ID
   * @returns {Promise<void>}
   */
  async pauseTraining(clientId) {
    const session = this.activeSessions.get(clientId);
    if (!session) {
      throw new Error('Keine aktive Trainingssession gefunden');
    }

    try {
      await wsService.send('pauseTraining', { clientId, sessionId: session.id });
      session.status = SessionStatus.PAUSED;
      this.notifyListeners('sessionPaused', session);
    } catch (error) {
      throw new Error(`Fehler beim Pausieren des Trainings: ${error.message}`);
    }
  }

  /**
   * Setzt eine pausierte Trainingssession fort
   * @param {number} clientId - Die Client ID
   * @returns {Promise<void>}
   */
  async resumeTraining(clientId) {
    const session = this.activeSessions.get(clientId);
    if (!session) {
      throw new Error('Keine aktive Trainingssession gefunden');
    }

    try {
      await wsService.send('resumeTraining', { clientId, sessionId: session.id });
      session.status = SessionStatus.RUNNING;
      this.notifyListeners('sessionResumed', session);
    } catch (error) {
      throw new Error(`Fehler beim Fortsetzen des Trainings: ${error.message}`);
    }
  }

  /**
   * Handler für Training Start Events
   * @param {Object} data - Event Daten
   */
  handleTrainingStarted(data) {
    const session = this.activeSessions.get(data.clientId);
    if (session) {
      session.status = SessionStatus.RUNNING;
      this.notifyListeners('sessionStarted', session);
    }
  }

/**
   * Handler für Training Update Events
   * @param {Object} data - Event Daten
   */
handleTrainingUpdate(data) {
    const { clientId, hits, misses, reactionTimes } = data;
    const session = this.activeSessions.get(clientId);
    
    if (session) {
      // Aktualisiere Session Statistiken
      session.stats = TrainingUtils.calculateTrainingStats({
        ...session,
        hits,
        misses,
        reactionTimes
      });

      // Benachrichtige Listener über Update
      this.notifyListeners('sessionUpdated', session);
    }
  }

  /**
   * Handler für Training Completion Events
   * @param {Object} data - Event Daten
   */
  handleTrainingCompleted(data) {
    const { clientId, stats } = data;
    const session = this.activeSessions.get(clientId);

    if (session) {
      session.status = SessionStatus.COMPLETED;
      session.endTime = Date.now();
      session.stats = stats;

      // Generiere Zusammenfassung
      session.summary = TrainingUtils.generateSessionSummary(session);

      // Verschiebe Session in Historie
      this.sessionHistory.set(session.id, session);
      this.activeSessions.delete(clientId);

      // Benachrichtige Listener
      this.notifyListeners('sessionCompleted', session);
    }
  }

  /**
   * Handler für Training Error Events
   * @param {Object} data - Event Daten
   */
  handleTrainingError(data) {
    const { clientId, error } = data;
    const session = this.activeSessions.get(clientId);

    if (session) {
      session.status = SessionStatus.ABORTED;
      session.error = error;

      // Verschiebe Session in Historie
      this.sessionHistory.set(session.id, session);
      this.activeSessions.delete(clientId);

      // Benachrichtige Listener
      this.notifyListeners('sessionError', { session, error });
    }
  }

  /**
   * Registriert einen Event Listener
   * @param {string} event - Event Name
   * @param {Function} callback - Callback Funktion
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
  }

  /**
   * Entfernt einen Event Listener
   * @param {string} event - Event Name
   * @param {Function} callback - Callback Funktion
   */
  off(event, callback) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  /**
   * Benachrichtigt alle Listener eines Events
   * @param {string} event - Event Name
   * @param {*} data - Event Daten
   */
  notifyListeners(event, data) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in training event listener (${event}):`, error);
        }
      });
    }
  }

  /**
   * Holt die aktive Session eines Clients
   * @param {number} clientId - Die Client ID
   * @returns {TrainingSession|null} Die aktive Session oder null
   */
  getActiveSession(clientId) {
    return this.activeSessions.get(clientId) || null;
  }

  /**
   * Holt alle aktiven Sessions
   * @returns {Array<TrainingSession>} Array von aktiven Sessions
   */
  getAllActiveSessions() {
    return Array.from(this.activeSessions.values());
  }

  /**
   * Holt die Trainingshistorie eines Clients
   * @param {number} clientId - Die Client ID
   * @returns {Array<TrainingSession>} Array von vergangenen Sessions
   */
  getClientHistory(clientId) {
    return Array.from(this.sessionHistory.values())
      .filter(session => session.clientId === clientId)
      .sort((a, b) => b.startTime - a.startTime);
  }

  /**
   * Berechnet Trainingsstatistiken für einen Client
   * @param {number} clientId - Die Client ID
   * @returns {Object} Aggregierte Statistiken
   */
  getClientStats(clientId) {
    const history = this.getClientHistory(clientId);
    
    if (history.length === 0) {
      return null;
    }

    return {
      totalSessions: history.length,
      totalTime: history.reduce((sum, session) => 
        sum + (session.endTime - session.startTime), 0),
      averageAccuracy: history.reduce((sum, session) => 
        sum + session.stats.accuracy, 0) / history.length,
      averageReactionTime: history.reduce((sum, session) => 
        sum + session.stats.avgReactionTime, 0) / history.length,
      totalHits: history.reduce((sum, session) => 
        sum + session.stats.hits, 0),
      totalMisses: history.reduce((sum, session) => 
        sum + session.stats.misses, 0),
      bestScore: Math.max(...history.map(session => session.stats.score)),
      progressOverTime: this.calculateProgressOverTime(history)
    };
  }

  /**
   * Berechnet den Fortschritt über Zeit
   * @param {Array<TrainingSession>} sessions - Array von Sessions
   * @returns {Object} Fortschrittsmetriken
   */
  calculateProgressOverTime(sessions) {
    if (sessions.length < 2) return null;

    // Teile Sessions in Quartile
    const quarterSize = Math.floor(sessions.length / 4);
    const firstQuarter = sessions.slice(0, quarterSize);
    const lastQuarter = sessions.slice(-quarterSize);

    // Berechne Verbesserung in verschiedenen Metriken
    const accuracyImprovement = (
      average(lastQuarter.map(s => s.stats.accuracy)) -
      average(firstQuarter.map(s => s.stats.accuracy))
    );

    const speedImprovement = (
      average(firstQuarter.map(s => s.stats.avgReactionTime)) -
      average(lastQuarter.map(s => s.stats.avgReactionTime))
    );

    const scoreImprovement = (
      average(lastQuarter.map(s => s.stats.score)) -
      average(firstQuarter.map(s => s.stats.score))
    );

    return {
      accuracyImprovement,
      speedImprovement,
      scoreImprovement,
      trend: {
        improving: accuracyImprovement > 0 && speedImprovement > 0,
        plateaued: Math.abs(accuracyImprovement) < 1 && Math.abs(speedImprovement) < 10,
        declining: accuracyImprovement < 0 || speedImprovement < 0
      }
    };
  }

  /**
   * Empfiehlt die nächste Trainingskonfiguration
   * @param {number} clientId - Die Client ID
   * @returns {TrainingConfig} Die empfohlene Konfiguration
   */
  recommendNextTraining(clientId) {
    const history = this.getClientHistory(clientId);
    return TrainingUtils.calculateProgression(history);
  }
}

// Hilfsfunktion für Durchschnittsberechnung
function average(values) {
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

// Exportiere Singleton-Instanz
export const trainingService = new TrainingService();
