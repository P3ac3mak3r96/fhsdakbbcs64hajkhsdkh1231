// src/components/clients/ClientList.js
import React from 'react';
import { useAppState, Actions } from '../../context/AppContext';
import { 
  CheckCircle,
  XCircle,
  Battery,
  Signal,
  ChevronRight,
  Play,
  Pause,
  Settings 
} from 'lucide-react';
import Button from '../ui/Button';

const ClientList = () => {
  const { filteredClients, selectedClients, dispatch } = useAppState();

  const getStatusIcon = (status) => {
    return status === 'active' 
      ? <CheckCircle className="h-5 w-5 text-green-500" />
      : <XCircle className="h-5 w-5 text-red-500" />;
  };

  const getBatteryColor = (level) => {
    if (level > 75) return 'text-green-500';
    if (level > 25) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getSignalStrength = (rssi) => {
    if (rssi > -50) return 'Ausgezeichnet';
    if (rssi > -70) return 'Gut';
    if (rssi > -80) return 'Mäßig';
    return 'Schlecht';
  };

  const getSignalColor = (rssi) => {
    if (rssi > -50) return 'text-green-500';
    if (rssi > -70) return 'text-yellow-500';
    return 'text-red-500';
  };

  const handleRowClick = (clientId) => {
    if (selectedClients.has(clientId)) {
      dispatch(Actions.deselectClient(clientId));
    } else {
      dispatch(Actions.selectClient(clientId));
    }
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Client
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Verbindung
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Batterie
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Training
            </th>
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">Aktionen</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredClients.map(client => (
            <tr 
              key={client.id}
              onClick={() => handleRowClick(client.id)}
              className={`
                cursor-pointer transition-colors
                ${selectedClients.has(client.id) ? 'bg-blue-50' : 'hover:bg-gray-50'}
              `}
            >
              {/* Status */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  {getStatusIcon(client.status)}
                  <span className="ml-2 text-sm text-gray-500">
                    {client.status === 'active' ? 'Aktiv' : 'Inaktiv'}
                  </span>
                </div>
              </td>

              {/* Client Info */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-col">
                  <div className="text-sm font-medium text-gray-900">
                    Client {client.id}
                  </div>
                  <div className="text-sm text-gray-500">
                    {client.ip}
                  </div>
                </div>
              </td>

              {/* Connection */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <Signal className={`h-5 w-5 ${getSignalColor(client.rssi)}`} />
                  <span className="ml-2 text-sm text-gray-500">
                    {getSignalStrength(client.rssi)}
                  </span>
                </div>
              </td>

              {/* Battery */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <Battery className={`h-5 w-5 ${getBatteryColor(client.battery)}`} />
                  <span className="ml-2 text-sm text-gray-500">
                    {client.battery}%
                  </span>
                </div>
              </td>

              {/* Training Status */}
              <td className="px-6 py-4 whitespace-nowrap">
                {client.training ? (
                  <div className="flex flex-col">
                    <div className="flex items-center text-sm text-blue-600">
                      <Play className="h-4 w-4 mr-1" />
                      {client.training.mode}
                    </div>
                    <div className="mt-1 flex items-center">
                      <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-600 rounded-full transition-all"
                          style={{ width: `${client.training.progress}%` }}
                        />
                      </div>
                      <span className="ml-2 text-xs text-gray-500">
                        {client.training.progress}%
                      </span>
                    </div>
                  </div>
                ) : (
                  <span className="text-sm text-gray-500">
                    Kein aktives Training
                  </span>
                )}
              </td>

              {/* Actions */}
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={client.training ? Pause : Play}
                    onClick={(e) => {
                      e.stopPropagation();
                      // TODO: Implement training toggle
                    }}
                  />
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ClientList;