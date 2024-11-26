// src/components/training/TrainingConfig.js
import React, { useState, useCallback, useMemo } from 'react';
import { useAppState } from '../../context/AppContext';
import { Play, AlertCircle, Settings, Users } from 'lucide-react';
import Button from '../ui/Button';
import { useMultipleTraining } from '../../hooks/useMultipleTraining';

const trainingModes = [
  {
    id: 'basic',
    name: 'Basis Training',
    description: 'Grundlegendes Zieltraining für Einsteiger',
    icon: '🎯'
  },
  {
    id: 'reaction',
    name: 'Reaktionstraining',
    description: 'Verbessert die Reaktionsgeschwindigkeit',
    icon: '⚡'
  },
  {
    id: 'precision',
    name: 'Präzisionstraining',
    description: 'Fokus auf Genauigkeit',
    icon: '🎯'
  },
  {
    id: 'stress',
    name: 'Stresstraining',
    description: 'Training unter Druck',
    icon: '💢'
  },
  {
    id: 'multi',
    name: 'Multi-Target',
    description: 'Mehrere Ziele gleichzeitig',
    icon: '🎯'
  }
];

const difficulties = [
  { id: 'easy', name: 'Einfach', color: 'bg-green-500' },
  { id: 'medium', name: 'Mittel', color: 'bg-yellow-500' },
  { id: 'hard', name: 'Schwer', color: 'bg-red-500' }
];

const DEFAULT_CONFIG = {
  mode: 'basic',
  difficulty: 'medium',
  duration: 300,
  targetCount: 10,
  reactTime: 1000,
  sound: true,
  stressors: false,
  brightness: 75,
  targetPattern: 'random',
  movementPattern: 'static',
  feedbackMode: 'immediate',
  scoringSystem: 'standard'
};

const FEEDBACK_MODES = [
  { value: 'immediate', label: 'Sofort' },
  { value: 'delayed', label: 'Verzögert' },
  { value: 'batch', label: 'Gesammelt' },
  { value: 'none', label: 'Deaktiviert' }
];

const SCORING_SYSTEMS = [
  { value: 'standard', label: 'Standard' },
  { value: 'time', label: 'Zeitbasiert' },
  { value: 'combo', label: 'Combo-System' },
  { value: 'precision', label: 'Präzisionsbasiert' }
];

const TARGET_PATTERNS = [
  { value: 'random', label: 'Zufällig' },
  { value: 'sequence', label: 'Sequenziell' },
  { value: 'wave', label: 'Wellenform' },
  { value: 'spiral', label: 'Spiralform' }
];

const MOVEMENT_PATTERNS = [
  { value: 'static', label: 'Statisch' },
  { value: 'linear', label: 'Linear' },
  { value: 'circular', label: 'Kreisförmig' },
  { value: 'random', label: 'Zufällig' }
];

const TrainingConfig = () => {
  const { selectedClients } = useAppState();
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [message, setMessage] = useState(null);
  const { startTrainingForAll, loading, error } = useMultipleTraining(selectedClients);

  // Optimierte Callback-Funktionen
  const showMessage = useCallback((text, type = 'info') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  }, []);

  const handleStartTraining = useCallback(async () => {
    if (selectedClients.size === 0) {
      showMessage('Bitte wählen Sie mindestens einen Client aus', 'error');
      return;
    }

    try {
      await startTrainingForAll(config);
      showMessage('Training erfolgreich gestartet', 'success');
    } catch (error) {
      showMessage(error.message, 'error');
    }
  }, [config, selectedClients, startTrainingForAll, showMessage]);

  const handleConfigChange = useCallback((key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  }, []);

  // Memoized Select-Komponente
  const SelectField = useMemo(() => ({ id, label, value, options, onChange }) => (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  ), []);

  return (
    <div className="space-y-6">
      {/* Message Display */}
      {message && (
        <div className={`
          p-4 rounded-md
          ${message.type === 'error' ? 'bg-red-50 text-red-800' : ''}
          ${message.type === 'success' ? 'bg-green-50 text-green-800' : ''}
          ${message.type === 'info' ? 'bg-blue-50 text-blue-800' : ''}
        `}>
          {message.text}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Fehler beim Training
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No Clients Warning */}
      {selectedClients.size === 0 && (
        <div className="bg-yellow-50 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Keine Clients ausgewählt
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Bitte wählen Sie mindestens einen Client aus, um das Training zu starten.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Selected Clients */}
      {selectedClients.size > 0 && (
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <Users className="h-5 w-5 text-gray-400 mr-2" />
            <span className="text-sm text-gray-600">
              {selectedClients.size} Client{selectedClients.size !== 1 && 's'} ausgewählt
            </span>
          </div>
        </div>
      )}

      {/* Training Mode Selection */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Trainingsmodus</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {trainingModes.map(mode => (
            <div
              key={mode.id}
              className={`
                p-4 rounded-lg border-2 cursor-pointer transition-all
                ${config.mode === mode.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-200'}
              `}
              onClick={() => handleConfigChange('mode', mode.id)}
            >
              <div className="text-2xl mb-2">{mode.icon}</div>
              <h4 className="font-medium text-gray-900">{mode.name}</h4>
              <p className="mt-1 text-sm text-gray-500">{mode.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Training Parameters */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Training Parameter</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Difficulty */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Schwierigkeitsgrad
            </label>
            <div className="grid grid-cols-3 gap-3">
              {difficulties.map(diff => (
                <button
                  key={diff.id}
                  className={`
                    px-4 py-2 rounded-md text-white text-sm font-medium
                    ${config.difficulty === diff.id
                      ? diff.color
                      : 'bg-gray-200 hover:bg-gray-300'}
                  `}
                  onClick={() => handleConfigChange('difficulty', diff.id)}
                >
                  {diff.name}
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
              Trainingsdauer (Sekunden)
            </label>
            <input
              id="duration"
              type="range"
              min="60"
              max="900"
              step="30"
              value={config.duration}
              onChange={e => handleConfigChange('duration', parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>1 Min</span>
              <span>{Math.floor(config.duration / 60)} Min</span>
              <span>15 Min</span>
            </div>
          </div>

          {/* Target Count */}
          <div>
            <label htmlFor="targetCount" className="block text-sm font-medium text-gray-700 mb-2">
              Anzahl Ziele
            </label>
            <input
              id="targetCount"
              type="number"
              min="1"
              max="100"
              value={config.targetCount}
              onChange={e => handleConfigChange('targetCount', parseInt(e.target.value))}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Reaction Time */}
          <div>
            <label htmlFor="reactTime" className="block text-sm font-medium text-gray-700 mb-2">
              Reaktionszeit (ms)
            </label>
            <input
              id="reactTime"
              type="number"
              min="500"
              max="5000"
              step="100"
              value={config.reactTime}
              onChange={e => handleConfigChange('reactTime', parseInt(e.target.value))}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Brightness */}
          <div>
            <label htmlFor="brightness" className="block text-sm font-medium text-gray-700 mb-2">
              LED Helligkeit
            </label>
            <input
              id="brightness"
              type="range"
              min="0"
              max="100"
              value={config.brightness}
              onChange={e => handleConfigChange('brightness', parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>0%</span>
              <span>{config.brightness}%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Options */}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Optionen
            </label>
            <div className="flex space-x-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.sound}
                  onChange={e => handleConfigChange('sound', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-600">Sound aktiviert</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.stressors}
                  onChange={e => handleConfigChange('stressors', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-600">Stressfaktoren aktiviert</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Settings */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Erweiterte Einstellungen</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SelectField
            id="targetPattern"
            label="Ziel-Muster"
            value={config.targetPattern}
            options={TARGET_PATTERNS}
            onChange={value => handleConfigChange('targetPattern', value)}
          />

          <SelectField
            id="movementPattern"
            label="Bewegungsmuster"
            value={config.movementPattern}
            options={MOVEMENT_PATTERNS}
            onChange={value => handleConfigChange('movementPattern', value)}
          />

          <SelectField
            id="feedbackMode"
            label="Feedback-Modus"
            value={config.feedbackMode}
            options={FEEDBACK_MODES}
            onChange={value => handleConfigChange('feedbackMode', value)}
          />

          <SelectField
            id="scoringSystem"
            label="Punktesystem"
            value={config.scoringSystem}
            options={SCORING_SYSTEMS}
            onChange={value => handleConfigChange('scoringSystem', value)}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <Button
          variant="ghost"
          onClick={() => setConfig(DEFAULT_CONFIG)}
        >
          Zurücksetzen
        </Button>
        
        <Button
          variant="secondary"
          icon={Settings}
          onClick={() => {
            showMessage('Vorlage speichern wird in Kürze implementiert', 'info');
          }}
        >
          Als Vorlage speichern
        </Button>

        <Button
          variant="primary"
          icon={Play}
          onClick={handleStartTraining}
          disabled={selectedClients.size === 0 || loading}
          loading={loading}
        >
          Training starten
        </Button>
      </div>
    </div>
  );
};

export default TrainingConfig;