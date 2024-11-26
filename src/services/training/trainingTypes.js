// src/services/training/trainingTypes.js

/**
 * @typedef {Object} TrainingConfig
 * @property {string} mode - Der Trainingsmodus
 * @property {string} difficulty - Der Schwierigkeitsgrad
 * @property {number} duration - Die Dauer in Sekunden
 * @property {number} targetCount - Die Anzahl der Ziele
 * @property {number} reactTime - Die Reaktionszeit in Millisekunden
 * @property {boolean} sound - Sound aktiviert/deaktiviert
 * @property {boolean} stressors - Stressfaktoren aktiviert/deaktiviert
 * @property {number} brightness - LED Helligkeit (0-100)
 * @property {string} targetPattern - Das Zielmuster
 * @property {string} movementPattern - Das Bewegungsmuster
 * @property {string} feedbackMode - Der Feedback-Modus
 * @property {string} scoringSystem - Das Punktesystem
 */

/**
 * @typedef {Object} TrainingStats
 * @property {number} hits - Anzahl der Treffer
 * @property {number} misses - Anzahl der Fehler
 * @property {number} accuracy - Genauigkeit in Prozent
 * @property {number} avgReactionTime - Durchschnittliche Reaktionszeit
 * @property {number} score - Gesamtpunktzahl
 */

/**
 * @typedef {Object} TrainingSession
 * @property {string} id - Die Session-ID
 * @property {number} clientId - Die Client-ID
 * @property {TrainingConfig} config - Die Trainingskonfiguration
 * @property {TrainingStats} stats - Die Trainingsstatistiken
 * @property {number} startTime - Der Startzeitpunkt
 * @property {number} endTime - Der Endzeitpunkt
 * @property {string} status - Der Status der Session
 */

// Training Modi
export const TrainingModes = {
    BASIC: 'basic',
    REACTION: 'reaction',
    PRECISION: 'precision',
    STRESS: 'stress',
    MULTI: 'multi'
  };
  
  // Schwierigkeitsgrade
  export const Difficulties = {
    EASY: 'easy',
    MEDIUM: 'medium',
    HARD: 'hard'
  };
  
  // Zielmuster
  export const TargetPatterns = {
    RANDOM: 'random',
    SEQUENCE: 'sequence',
    WAVE: 'wave',
    SPIRAL: 'spiral'
  };
  
  // Bewegungsmuster
  export const MovementPatterns = {
    STATIC: 'static',
    LINEAR: 'linear',
    CIRCULAR: 'circular',
    RANDOM: 'random'
  };
  
  // Feedback-Modi
  export const FeedbackModes = {
    IMMEDIATE: 'immediate',
    DELAYED: 'delayed',
    BATCH: 'batch',
    NONE: 'none'
  };
  
  // Punktesysteme
  export const ScoringSystems = {
    STANDARD: 'standard',
    TIME: 'time',
    COMBO: 'combo',
    PRECISION: 'precision'
  };
  
  // Session Status
  export const SessionStatus = {
    PENDING: 'pending',
    RUNNING: 'running',
    PAUSED: 'paused',
    COMPLETED: 'completed',
    ABORTED: 'aborted'
  };
  
  // Standard Konfigurationen für verschiedene Modi
  export const DefaultConfigs = {
    [TrainingModes.BASIC]: {
      duration: 300,
      targetCount: 10,
      reactTime: 1000,
      sound: true,
      stressors: false,
      brightness: 75,
      targetPattern: TargetPatterns.RANDOM,
      movementPattern: MovementPatterns.STATIC,
      feedbackMode: FeedbackModes.IMMEDIATE,
      scoringSystem: ScoringSystems.STANDARD
    },
    [TrainingModes.REACTION]: {
      duration: 180,
      targetCount: 20,
      reactTime: 500,
      sound: true,
      stressors: false,
      brightness: 100,
      targetPattern: TargetPatterns.RANDOM,
      movementPattern: MovementPatterns.STATIC,
      feedbackMode: FeedbackModes.IMMEDIATE,
      scoringSystem: ScoringSystems.TIME
    },
    [TrainingModes.PRECISION]: {
      duration: 420,
      targetCount: 15,
      reactTime: 2000,
      sound: true,
      stressors: false,
      brightness: 50,
      targetPattern: TargetPatterns.SEQUENCE,
      movementPattern: MovementPatterns.STATIC,
      feedbackMode: FeedbackModes.IMMEDIATE,
      scoringSystem: ScoringSystems.PRECISION
    },
    [TrainingModes.STRESS]: {
      duration: 240,
      targetCount: 30,
      reactTime: 750,
      sound: true,
      stressors: true,
      brightness: 100,
      targetPattern: TargetPatterns.RANDOM,
      movementPattern: MovementPatterns.RANDOM,
      feedbackMode: FeedbackModes.DELAYED,
      scoringSystem: ScoringSystems.COMBO
    },
    [TrainingModes.MULTI]: {
      duration: 360,
      targetCount: 40,
      reactTime: 1500,
      sound: true,
      stressors: false,
      brightness: 85,
      targetPattern: TargetPatterns.WAVE,
      movementPattern: MovementPatterns.CIRCULAR,
      feedbackMode: FeedbackModes.BATCH,
      scoringSystem: ScoringSystems.STANDARD
    }
  };
  
  // Schwierigkeitsgrad-Modifikatoren
  export const DifficultyModifiers = {
    [Difficulties.EASY]: {
      reactTime: 1.5,
      targetSize: 1.5,
      stressIntensity: 0.5
    },
    [Difficulties.MEDIUM]: {
      reactTime: 1.0,
      targetSize: 1.0,
      stressIntensity: 1.0
    },
    [Difficulties.HARD]: {
      reactTime: 0.7,
      targetSize: 0.7,
      stressIntensity: 1.5
    }
  };
  
  export default {
    TrainingModes,
    Difficulties,
    TargetPatterns,
    MovementPatterns,
    FeedbackModes,
    ScoringSystems,
    SessionStatus,
    DefaultConfigs,
    DifficultyModifiers
  }; 
