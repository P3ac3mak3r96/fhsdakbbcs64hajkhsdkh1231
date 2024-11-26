 // src/services/training/trainingUtils.js
import {
    DefaultConfigs,
    DifficultyModifiers,
    TrainingModes,
    Difficulties,
    SessionStatus
  } from './trainingTypes';
  
  /**
   * Generiert eine Trainingskonfiguration basierend auf Modus und Schwierigkeit
   * @param {string} mode - Der Trainingsmodus
   * @param {string} difficulty - Der Schwierigkeitsgrad
   * @param {Object} customConfig - Optionale benutzerdefinierte Konfiguration
   * @returns {TrainingConfig} Die generierte Trainingskonfiguration
   */
  export const generateTrainingConfig = (mode, difficulty, customConfig = {}) => {
    const baseConfig = DefaultConfigs[mode] || DefaultConfigs[TrainingModes.BASIC];
    const modifier = DifficultyModifiers[difficulty] || DifficultyModifiers[Difficulties.MEDIUM];
  
    // Wende Schwierigkeitsmodifikatoren an
    const modifiedConfig = {
      ...baseConfig,
      reactTime: Math.round(baseConfig.reactTime * modifier.reactTime),
      targetSize: Math.round(baseConfig.targetSize * modifier.targetSize),
      stressIntensity: baseConfig.stressors ? modifier.stressIntensity : 0
    };
  
    // Überschreibe mit benutzerdefinierten Einstellungen
    return {
      ...modifiedConfig,
      ...customConfig,
      mode,
      difficulty
    };
  };
  
  /**
   * Berechnet die Statistiken für eine Trainingseinheit
   * @param {TrainingSession} session - Die Trainingssession
   * @returns {TrainingStats} Die berechneten Statistiken
   */
  export const calculateTrainingStats = (session) => {
    const { hits, misses, reactionTimes } = session;
    const totalShots = hits + misses;
    
    // Berechne Basisstatistiken
    const stats = {
      hits,
      misses,
      accuracy: totalShots > 0 ? (hits / totalShots) * 100 : 0,
      avgReactionTime: reactionTimes.length > 0 
        ? reactionTimes.reduce((a, b) => a + b) / reactionTimes.length 
        : 0
    };
  
    // Berechne Punktzahl basierend auf Modus und Schwierigkeit
    stats.score = calculateScore(stats, session.config);
  
    return stats;
  };
  
  /**
   * Berechnet die Punktzahl basierend auf verschiedenen Faktoren
   * @param {TrainingStats} stats - Die Trainingsstatistiken
   * @param {TrainingConfig} config - Die Trainingskonfiguration
   * @returns {number} Die berechnete Punktzahl
   */
  export const calculateScore = (stats, config) => {
    let score = 0;
    const difficultyMultiplier = {
      [Difficulties.EASY]: 1.0,
      [Difficulties.MEDIUM]: 1.5,
      [Difficulties.HARD]: 2.0
    }[config.difficulty];
  
    // Basispunkte für Treffer
    score += stats.hits * 100;
  
    // Genauigkeitsbonus
    const accuracyBonus = stats.accuracy * 5;
    score += accuracyBonus;
  
    // Reaktionszeitbonus
    const reactionBonus = Math.max(0, (2000 - stats.avgReactionTime) / 10);
    score += reactionBonus;
  
    // Stressorfaktor
    if (config.stressors) {
      score *= 1.2;
    }
  
    // Schwierigkeitsmodifikator
    score *= difficultyMultiplier;
  
    return Math.round(score);
  };
  
  /**
   * Generiert ein Trainingsmuster basierend auf der Konfiguration
   * @param {TrainingConfig} config - Die Trainingskonfiguration
   * @returns {Array} Array von Zielpositionen
   */
  export const generateTargetPattern = (config) => {
    const targets = [];
    const matrixSize = 8; // 8x8 LED Matrix
  
    for (let i = 0; i < config.targetCount; i++) {
      let target = {
        id: i,
        x: 0,
        y: 0,
        duration: config.reactTime,
        size: Math.max(1, Math.round(2 * DifficultyModifiers[config.difficulty].targetSize))
      };
  
      switch (config.targetPattern) {
        case 'sequence':
          target.x = (i % matrixSize);
          target.y = Math.floor(i / matrixSize) % matrixSize;
          break;
  
        case 'wave':
          target.x = i % matrixSize;
          target.y = Math.floor(Math.sin((i / matrixSize) * Math.PI) * (matrixSize / 2) + (matrixSize / 2));
          break;
  
        case 'spiral':
          const angle = (i / config.targetCount) * 2 * Math.PI;
          const radius = ((i / config.targetCount) * matrixSize / 2);
          target.x = Math.floor(Math.cos(angle) * radius + matrixSize / 2);
          target.y = Math.floor(Math.sin(angle) * radius + matrixSize / 2);
          break;
  
        case 'random':
        default:
          target.x = Math.floor(Math.random() * matrixSize);
          target.y = Math.floor(Math.random() * matrixSize);
          break;
      }
  
      // Bewegungsmuster hinzufügen
      if (config.movementPattern !== 'static') {
        target.movement = {
          pattern: config.movementPattern,
          speed: 1 + (config.difficulty === 'hard' ? 1 : 0),
          range: Math.floor(matrixSize / 4)
        };
      }
  
      targets.push(target);
    }
  
    return targets;
  };
  
  /**
   * Analysiert eine Trainingssession und gibt Verbesserungsvorschläge
   * @param {TrainingSession} session - Die zu analysierende Session
   * @returns {Array} Array von Verbesserungsvorschlägen
   */
  export const analyzeTrainingSession = (session) => {
    const suggestions = [];
    const { stats, config } = session;
  
    // Genauigkeitsanalyse
    if (stats.accuracy < 70) {
      suggestions.push({
        aspect: 'Genauigkeit',
        message: 'Fokussieren Sie sich mehr auf präzises Zielen als auf Geschwindigkeit',
        recommendedMode: TrainingModes.PRECISION
      });
    }
  
    // Geschwindigkeitsanalyse
    if (stats.avgReactionTime > 1000) {
      suggestions.push({
        aspect: 'Reaktionszeit',
        message: 'Üben Sie schnellere Reaktionen mit dem Reaktionstraining',
        recommendedMode: TrainingModes.REACTION
      });
    }
  
    // Stressresistenz
    if (config.stressors && stats.accuracy < 60) {
      suggestions.push({
        aspect: 'Stressresistenz',
        message: 'Verbessern Sie Ihre Leistung unter Stress',
        recommendedMode: TrainingModes.STRESS
      });
    }
  
    // Ermüdungsanalyse
    const performanceDropoff = analyzePerformanceDropoff(session);
    if (performanceDropoff > 20) {
      suggestions.push({
        aspect: 'Ausdauer',
        message: 'Ihre Leistung lässt über die Zeit nach. Fokussieren Sie sich auf Konsistenz',
        recommendedMode: TrainingModes.BASIC
      });
    }
  
    return suggestions;
  };
  
  /**
   * Analysiert den Leistungsabfall/**
 * Analysiert den Leistungsabfall während einer Trainingseinheit
 * @param {TrainingSession} session - Die zu analysierende Session
 * @returns {number} Prozentualer Leistungsabfall
 */
export const analyzePerformanceDropoff = (session) => {
    // Teile die Session in zwei Hälften
    const halfwayPoint = Math.floor(session.hits.length / 2);
    const firstHalf = session.hits.slice(0, halfwayPoint);
    const secondHalf = session.hits.slice(halfwayPoint);
  
    // Berechne Genauigkeit für beide Hälften
    const firstHalfAccuracy = calculateAccuracy(firstHalf);
    const secondHalfAccuracy = calculateAccuracy(secondHalf);
  
    // Berechne prozentualen Abfall
    return Math.max(0, firstHalfAccuracy - secondHalfAccuracy);
  };
  
  /**
   * Berechnet die Genauigkeit für eine Reihe von Schüssen
   * @param {Array} shots - Array von Treffern/Fehlern
   * @returns {number} Genauigkeit in Prozent
   */
  const calculateAccuracy = (shots) => {
    if (shots.length === 0) return 0;
    const hits = shots.filter(shot => shot).length;
    return (hits / shots.length) * 100;
  };
  
  /**
   * Generiert eine Zusammenfassung der Trainingssession
   * @param {TrainingSession} session - Die Trainingssession
   * @returns {Object} Zusammenfassung der Session
   */
  export const generateSessionSummary = (session) => {
    const { stats, config } = session;
    const duration = (session.endTime - session.startTime) / 1000; // in Sekunden
  
    return {
      duration,
      performance: {
        accuracy: stats.accuracy,
        averageReactionTime: stats.avgReactionTime,
        hitsPerMinute: (stats.hits / duration) * 60,
        score: stats.score
      },
      improvement: {
        accuracyChange: calculateImprovementRate(session, 'accuracy'),
        speedChange: calculateImprovementRate(session, 'speed')
      },
      recommendations: analyzeTrainingSession(session)
    };
  };
  
  /**
   * Berechnet die Verbesserungsrate für verschiedene Metriken
   * @param {TrainingSession} session - Die Trainingssession
   * @param {string} metric - Die zu analysierende Metrik
   * @returns {number} Prozentuale Verbesserung
   */
  const calculateImprovementRate = (session, metric) => {
    const dataPoints = metric === 'accuracy' ? session.hits : session.reactionTimes;
    const segmentSize = Math.floor(dataPoints.length / 3);
    
    if (segmentSize === 0) return 0;
  
    const firstSegment = dataPoints.slice(0, segmentSize);
    const lastSegment = dataPoints.slice(-segmentSize);
  
    let firstValue, lastValue;
  
    switch (metric) {
      case 'accuracy':
        firstValue = calculateAccuracy(firstSegment);
        lastValue = calculateAccuracy(lastSegment);
        break;
      case 'speed':
        firstValue = average(firstSegment);
        lastValue = average(lastSegment);
        // Bei Geschwindigkeit ist eine Reduzierung der Zeit eine Verbesserung
        return ((firstValue - lastValue) / firstValue) * 100;
      default:
        return 0;
    }
  
    return ((lastValue - firstValue) / firstValue) * 100;
  };
  
  /**
   * Berechnet Durchschnitt eines Arrays von Zahlen
   * @param {Array<number>} values - Array von Zahlen
   * @returns {number} Durchschnittswert
   */
  const average = (values) => {
    if (values.length === 0) return 0;
    return values.reduce((a, b) => a + b) / values.length;
  };
  
  /**
   * Validiert eine Trainingskonfiguration
   * @param {TrainingConfig} config - Die zu validierende Konfiguration
   * @returns {Object} Validierungsergebnis
   */
  export const validateTrainingConfig = (config) => {
    const errors = [];
  
    // Pflichtfelder prüfen
    if (!config.mode) {
      errors.push('Trainingsmodus muss ausgewählt werden');
    }
    if (!config.difficulty) {
      errors.push('Schwierigkeitsgrad muss ausgewählt werden');
    }
  
    // Wertebereiche prüfen
    if (config.duration < 60 || config.duration > 3600) {
      errors.push('Trainingsdauer muss zwischen 1 und 60 Minuten liegen');
    }
    if (config.targetCount < 1 || config.targetCount > 100) {
      errors.push('Anzahl der Ziele muss zwischen 1 und 100 liegen');
    }
    if (config.reactTime < 200 || config.reactTime > 5000) {
      errors.push('Reaktionszeit muss zwischen 200ms und 5000ms liegen');
    }
    if (config.brightness < 0 || config.brightness > 100) {
      errors.push('Helligkeit muss zwischen 0% und 100% liegen');
    }
  
    return {
      isValid: errors.length === 0,
      errors
    };
  };
  
  /**
   * Berechnet die optimale Progression für einen Benutzer
   * @param {Array<TrainingSession>} sessions - Vergangene Trainingssessions
   * @returns {Object} Empfohlene nächste Trainingskonfiguration
   */
  export const calculateProgression = (sessions) => {
    if (sessions.length === 0) {
      return DefaultConfigs[TrainingModes.BASIC];
    }
  
    const lastSession = sessions[sessions.length - 1];
    const averageAccuracy = average(sessions.map(s => s.stats.accuracy));
    const averageReactionTime = average(sessions.map(s => s.stats.avgReactionTime));
  
    // Progression basierend auf Leistung
    let nextConfig = { ...lastSession.config };
  
    if (averageAccuracy > 85 && averageReactionTime < 800) {
      // Benutzer ist bereit für höhere Schwierigkeit
      switch (nextConfig.difficulty) {
        case Difficulties.EASY:
          nextConfig.difficulty = Difficulties.MEDIUM;
          break;
        case Difficulties.MEDIUM:
          nextConfig.difficulty = Difficulties.HARD;
          break;
      }
    } else if (averageAccuracy < 60 || averageReactionTime > 1500) {
      // Benutzer sollte einfacher trainieren
      switch (nextConfig.difficulty) {
        case Difficulties.HARD:
          nextConfig.difficulty = Difficulties.MEDIUM;
          break;
        case Difficulties.MEDIUM:
          nextConfig.difficulty = Difficulties.EASY;
          break;
      }
    }
  
    // Passe Trainingsparameter an
    nextConfig = adjustTrainingParameters(nextConfig, averageAccuracy, averageReactionTime);
  
    return nextConfig;
  };
  
  /**
   * Passt Trainingsparameter basierend auf der Leistung an
   * @param {TrainingConfig} config - Aktuelle Konfiguration
   * @param {number} accuracy - Durchschnittliche Genauigkeit
   * @param {number} reactionTime - Durchschnittliche Reaktionszeit
   * @returns {TrainingConfig} Angepasste Konfiguration
   */
  const adjustTrainingParameters = (config, accuracy, reactionTime) => {
    const adjusted = { ...config };
  
    // Reaktionszeit anpassen
    if (accuracy > 80) {
      adjusted.reactTime = Math.max(200, config.reactTime * 0.9);
    } else if (accuracy < 60) {
      adjusted.reactTime = Math.min(5000, config.reactTime * 1.1);
    }
  
    // Zielanzahl anpassen
    if (accuracy > 85) {
      adjusted.targetCount = Math.min(100, Math.floor(config.targetCount * 1.2));
    } else if (accuracy < 50) {
      adjusted.targetCount = Math.max(5, Math.floor(config.targetCount * 0.8));
    }
  
    // Stressoren aktivieren wenn Leistung gut ist
    if (accuracy > 90 && reactionTime < 700 && !config.stressors) {
      adjusted.stressors = true;
    }
  
    return adjusted;
  };
  
  export default {
    generateTrainingConfig,
    calculateTrainingStats,
    calculateScore,
    generateTargetPattern,
    analyzeTrainingSession,
    generateSessionSummary,
    validateTrainingConfig,
    calculateProgression
  };
