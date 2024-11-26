// src/components/clients/ClientCard.js
import React from 'react';
import { useAppState, Actions } from '../../context/AppContext';
import { 
  CheckCircle, 
  XCircle, 
  Battery, 
  Signal, 
  Play,
  Pause,
  Settings,
  ChevronRight
} from 'lucide-react';
import Button from '../ui/Button';

const ClientCard = ({ client }) => {
  const { selectedClients, dispatch } = useAppState();
  const isSelected = selectedClients.has(client.id);

  const handleSelect = (e) => {
    e.stopPropagation();
    if (isSelected) {
      dispatch(Actions.deselectClient(client.id));
    } else {
      dispatch(Actions.selectClient(client.id));
    }
  };

  const getBatteryIcon = (level) => {
    if (level > 75) return <Battery className="text-green-500" />;
    if (level > 25) return <Battery className="text-yellow-500" />;
    return <Battery className="text-red-500" />;
  };

  const getSignalIcon = (strength) => {
    if (strength > -50) return <Signal className="text-green-500" />;
    if (strength > -70) return <Signal className="text-yellow-500" />;
    return <Signal className="text-red-500" />;
  };

  return (
    <div 
      className={`
        relative rounded-lg border-2 transition-all duration-200
        ${isSelected 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-200 hover:border-blue-200'}
      `}
      onClick={handleSelect}
    >
      {/* Status Badge */}
      <div className="absolute top-3 right-3">
        {client.status === 'active' 
          ? <CheckCircle className="h-5 w-5 text-green-500" />
          : <XCircle className="h-5 w-5 text-red-500" />
        }
      </div>

      <div className="p-4">
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Client {client.id}
          </h3>
          <p className="text-sm text-gray-500">{client.ip}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center">
            {getBatteryIcon(client.battery)}
            <span className="ml-2 text-sm text-gray-600">
              {client.battery}%
            </span>
          </div>
          <div className="flex items-center">
            {getSignalIcon(client.rssi)}
            <span className="ml-2 text-sm text-gray-600">
              {client.rssi} dBm
            </span>
          </div>
        </div>

        {/* Training Status */}
        {client.training && (
          <div className="mb-4 p-3 bg-blue-50 rounded-md">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-blue-900">
                Training aktiv
              </span>
              <span className="text-xs text-blue-700">
                {client.training.mode}
              </span>
            </div>
            <div className="space-y-2">
              <div className="w-full h-1.5 bg-blue-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 rounded-full transition-all"
                  style={{ width: `${client.training.progress}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-blue-700">
                <span>{client.training.stats.hits} Treffer</span>
                <span>{client.training.stats.accuracy}% Genauigkeit</span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1"
            icon={client.training ? Pause : Play}
            onClick={(e) => {
              e.stopPropagation();
              // TODO: Implement training toggle
            }}
          >
            {client.training ? 'Stopp' : 'Start'}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            icon={Settings}
            onClick={(e) => {
              e.stopPropagation();
              // TODO: Open settings modal
            }}
          />
          
          <Button
            variant="ghost"
            size="sm"
            icon={ChevronRight}
            onClick={(e) => {
              e.stopPropagation();
              // TODO: Navigate to details
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ClientCard;