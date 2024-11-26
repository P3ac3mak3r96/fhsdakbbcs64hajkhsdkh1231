// src/components/training/TrainingStatus.js
import React from 'react';
import { useAppState } from '../../context/AppContext';
import { 
  Target,
  Clock,
  Activity,
  Zap,
  Pause,
  BarChart
} from 'lucide-react';
import Button from '../ui/Button';

const TrainingStatus = ({ client }) => {
  const { wsService } = useAppState();
  
  if (!client.training) return null;

  const { training } = client;
  const progress = Math.round((Date.now() - training.startTime) / (training.duration * 1000) * 100);
  const timeLeft = Math.max(0, training.duration - (Date.now() - training.startTime) / 1000);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStopTraining = async () => {
    try {
      await wsService.stopTraining(client.id);
      // TODO: Show success notification
    } catch (error) {
      // TODO: Show error notification
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            Client {client.id}
          </h3>
          <p className="text-sm text-gray-500">
            {client.ip}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            icon={BarChart}
            onClick={() => {
              // TODO: Show detailed stats
            }}
          >
            Details
          </Button>
          <Button
            variant="danger"
            icon={Pause}
            onClick={handleStopTraining}
          >
            Beenden
          </Button>
        </div>
      </div>

      {/* Training Info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center">
            <Activity className="h-5 w-5 text-blue-500 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Modus</p>
              <p className="mt-1 font-medium">{training.mode}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-green-500 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Zeit übrig</p>
              <p className="mt-1 font-medium">{formatTime(timeLeft)}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center">
            <Zap className="h-5 w-5 text-yellow-500 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Reaktionszeit</p>
              <p className="mt-1 font-medium">{training.stats.avgReactionTime}ms</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center">
            <Target className="h-5 w-5 text-purple-500 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Genauigkeit</p>
              <p className="mt-1 font-medium">{training.stats.accuracy}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-500">
          <span>Fortschritt</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-600 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 border-t border-gray-200 pt-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-500">Treffer</h4>
            <div className="mt-2 flex items-center">
              <span className="text-2xl font-bold text-gray-900">
                {training.stats.hits}
              </span>
              <span className="ml-2 text-sm text-green-500">
                von {training.targetCount}
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500">Fehler</h4>
            <div className="mt-2 flex items-center">
              <span className="text-2xl font-bold text-gray-900">
                {training.stats.misses}
              </span>
              <span className="ml-2 text-sm text-red-500">
                ({((training.stats.misses / (training.stats.hits + training.stats.misses)) * 100).toFixed(1)}%)
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500">Punkte</h4>
            <div className="mt-2">
              <span className="text-2xl font-bold text-gray-900">
                {training.stats.score}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainingStatus; 
