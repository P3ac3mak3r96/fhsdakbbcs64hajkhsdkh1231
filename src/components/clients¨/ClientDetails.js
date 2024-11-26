// src/components/clients/ClientDetails.js
import React, { useState } from 'react';
import { useAppState } from '../../context/AppContext';
import { 
  ArrowLeft,
  Battery,
  Signal,
  Clock,
  Target,
  Activity,
  Settings,
  Zap,
  Play,
  Pause,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import Button from '../ui/Button';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const ClientDetails = ({ clientId, onClose }) => {
  const { clients, wsService } = useAppState();
  const [activeTab, setActiveTab] = useState('overview');
  const client = clients.get(clientId);

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <p className="text-gray-500">Client nicht gefunden</p>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Übersicht' },
    { id: 'training', label: 'Training' },
    { id: 'stats', label: 'Statistiken' },
    { id: 'settings', label: 'Einstellungen' }
  ];

  // Mock data for the charts - replace with real data
  const performanceData = [
    { name: '1h', accuracy: 85, speed: 92, hits: 45 },
    { name: '2h', accuracy: 88, speed: 87, hits: 52 },
    { name: '3h', accuracy: 82, speed: 89, hits: 48 },
    { name: '4h', accuracy: 91, speed: 85, hits: 55 }
  ];

  return (
    <div className="bg-white shadow rounded-lg">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={onClose}
              className="mr-4 p-2 rounded-md hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5 text-gray-500" />
            </button>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Client {client.id}
              </h2>
              <p className="text-sm text-gray-500">{client.ip}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              icon={RefreshCw}
              onClick={() => wsService.requestClientStatus(clientId)}
            >
              Aktualisieren
            </Button>
            <Button
              variant={client.training ? 'danger' : 'primary'}
              icon={client.training ? Pause : Play}
            >
              {client.training ? 'Training beenden' : 'Training starten'}
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mt-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`
                px-4 py-2 text-sm font-medium rounded-md
                ${activeTab === tab.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}
              `}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Batterie</p>
                    <p className="mt-1 text-2xl font-semibold">
                      {client.battery}%
                    </p>
                  </div>
                  <Battery className={`h-8 w-8 ${
                    client.battery > 75 ? 'text-green-500' :
                    client.battery > 25 ? 'text-yellow-500' :
                    'text-red-500'
                  }`} />
                </div>
              </div>

              <div className="bg-white rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Signalstärke</p>
                    <p className="mt-1 text-2xl font-semibold">
                      {client.rssi} dBm
                    </p>
                  </div>
                  <Signal className={`h-8 w-8 ${
                    client.rssi > -50 ? 'text-green-500' :
                    client.rssi > -70 ? 'text-yellow-500' :
                    'text-red-500'
                  }`} />
                </div>
              </div>

              <div className="bg-white rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Verbindungszeit</p>
                    <p className="mt-1 text-2xl font-semibold">
                      {Math.floor((Date.now() - client.connectedSince) / 1000 / 60)} Min
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-blue-500" />
                </div>
              </div>
            </div>

            {/* Performance Chart */}
            {client.training && (
              <div className="bg-white rounded-lg border p-4">
                <h3 className="text-lg font-medium mb-4">Performance</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="accuracy" 
                        stroke="#2563eb" 
                        name// src/components/clients/ClientDetails.js (Fortsetzung)
                        name="Genauigkeit (%)" 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="speed" 
                        stroke="#16a34a" 
                        name="Geschwindigkeit" 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="hits" 
                        stroke="#dc2626" 
                        name="Treffer" 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'training' && (
          <div className="space-y-6">
            {/* Aktives Training */}
            {client.training ? (
              <div className="bg-white rounded-lg border p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-medium">Aktives Training</h3>
                    <p className="text-sm text-gray-500">
                      {client.training.mode} - {client.training.difficulty}
                    </p>
                  </div>
                  <Button
                    variant="danger"
                    icon={Pause}
                    onClick={() => {
                      // TODO: Implement stop training
                    }}
                  >
                    Training beenden
                  </Button>
                </div>

                {/* Progress */}
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm text-gray-500 mb-1">
                      <span>Fortschritt</span>
                      <span>{client.training.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 rounded-full transition-all"
                        style={{ width: `${client.training.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-blue-600">
                        {client.training.stats.hits}
                      </div>
                      <div className="text-sm text-gray-500">Treffer</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-red-600">
                        {client.training.stats.misses}
                      </div>
                      <div className="text-sm text-gray-500">Fehler</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-green-600">
                        {client.training.stats.accuracy}%
                      </div>
                      <div className="text-sm text-gray-500">Genauigkeit</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-purple-600">
                        {client.training.stats.avgReactionTime}ms
                      </div>
                      <div className="text-sm text-gray-500">Reaktionszeit</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Training Starten */
              <div className="bg-white rounded-lg border p-6">
                <h3 className="text-lg font-medium mb-6">Neues Training starten</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Trainingsmodus */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Trainingsmodus
                    </label>
                    <select className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                      <option value="basic">Basis Training</option>
                      <option value="reaction">Reaktionstraining</option>
                      <option value="precision">Präzisionstraining</option>
                      <option value="stress">Stresstraining</option>
                    </select>
                  </div>

                  {/* Schwierigkeit */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Schwierigkeit
                    </label>
                    <select className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                      <option value="easy">Einfach</option>
                      <option value="medium">Mittel</option>
                      <option value="hard">Schwer</option>
                    </select>
                  </div>

                  {/* Dauer */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dauer (Minuten)
                    </label>
                    <input 
                      type="number"
                      min="1"
                      max="60"
                      defaultValue="5"
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  {/* Zielanzahl */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Anzahl Ziele
                    </label>
                    <input 
                      type="number"
                      min="1"
                      max="100"
                      defaultValue="10"
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Optionen */}
                <div className="mt-6 flex items-center space-x-6">
                  <label className="flex items-center">
                    <input 
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      defaultChecked
                    />
                    <span className="ml-2 text-sm text-gray-600">
                      Sound aktivieren
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input 
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">
                      Stressfaktoren
                    </span>
                  </label>
                </div>

                {/* Start Button */}
                <div className="mt-6">
                  <Button
                    variant="primary"
                    icon={Play}
                    onClick={() => {
                      // TODO: Implement start training
                    }}
                  >
                    Training starten
                  </Button>
                </div>
              </div>
            )}

            {/* Trainingshistorie */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-medium mb-6">Trainingshistorie</h3>
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Datum
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Modus
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dauer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Treffer/Fehler
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Genauigkeit
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {/* TODO: Implement history data */}
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      2024-01-15 14:30
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Reaktionstraining
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      5 Min
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      45/12
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      78.9%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-6">
            {/* Performance über Zeit */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-medium mb-4">Performance Entwicklung</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="accuracy" 
                      stroke="#2563eb" 
                      name="Genauigkeit (%)" 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="speed" 
                      stroke="#16a34a" 
                      name="Geschwindigkeit" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Statistik-Karten */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg border p-6">
                <h4 className="text-sm font-medium text-gray-500 mb-4">
                  Gesamtstatistik
                </h4>
                <dl className="space-y-4">
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Trainingseinheiten</dt>
                    <dd className="text-sm font-medium text-gray-900">24</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Gesamtzeit</dt>
                    <dd className="text-sm font-medium text-gray-900">12.5h</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Durchschn. Genauigkeit</dt>
                    <dd className="text-sm font-medium text-gray-900">82.4%</dd>
                  </div>
                </dl>
              </div>

              <div className="bg-white rounded-lg border p-6">
                <h4 className="text-sm font-medium text-gray-500 mb-4">
                  Beste Leistungen
                </h4>
                <dl className="space-y-4">
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Höchste Genauigkeit</dt>
                    <dd className="text-sm font-medium text-gray-900">95.2%</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Schnellste Reaktion</dt>
                    <dd className="text-sm font-medium text-gray-900">178ms</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Längste Serie</dt>
                    <dd className="text-sm font-medium text-gray-900">28 Treffer</dd>
                  </div>
                </dl>
              </div>

              <div className="bg-white rounded-lg border p-6">
                <h4 className="text-sm font-medium text-gray-500 mb-4">
                  Systemstatus
                </h4>
                <dl className="space-y-4">
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Uptime</dt>
                    <dd className="text-sm font-medium text-gray-900">5.2 Tage</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Firmware Version</dt>
                    <dd className="text-sm font-medium text-gray-900">v2.1.0</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Letzte Wartung</dt>
                    <dd className="text-sm font-medium text-gray-900">vor 12 Tagen</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* Allgemeine Einstellungen */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-medium mb-6">Allgemeine Einstellungen</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client Name
                  </label>
                  <input 
                    type="text"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    defaultValuedefaultValue={`Client ${client.id}`}
                    />
                  </div>
  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      LED Helligkeit
                    </label>
                    <input 
                      type="range"
                      min="0"
                      max="100"
                      defaultValue="75"
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>0%</span>
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                  </div>
  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Aktualisierungsintervall
                    </label>
                    <select className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                      <option value="1000">1 Sekunde</option>
                      <option value="2000">2 Sekunden</option>
                      <option value="5000">5 Sekunden</option>
                    </select>
                  </div>
                </div>
              </div>
  
              {/* Netzwerkeinstellungen */}
              <div className="bg-white rounded-lg border p-6">
                <h3 className="text-lg font-medium mb-6">Netzwerkeinstellungen</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      IP-Adresse
                    </label>
                    <input 
                      type="text"
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      defaultValue={client.ip}
                    />
                  </div>
  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      WiFi-Kanal
                    </label>
                    <select className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                      {[...Array(11)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>Kanal {i + 1}</option>
                      ))}
                    </select>
                  </div>
  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      DHCP
                    </label>
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center">
                        <input 
                          type="radio"
                          name="dhcp"
                          value="auto"
                          defaultChecked
                          className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-600">Automatisch</span>
                      </label>
                      <label className="flex items-center">
                        <input 
                          type="radio"
                          name="dhcp"
                          value="manual"
                          className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-600">Manuell</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
  
              {/* Hardware-Einstellungen */}
              <div className="bg-white rounded-lg border p-6">
                <h3 className="text-lg font-medium mb-6">Hardware-Einstellungen</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      LED Matrix Orientierung
                    </label>
                    <select className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                      <option value="0">0°</option>
                      <option value="90">90°</option>
                      <option value="180">180°</option>
                      <option value="270">270°</option>
                    </select>
                  </div>
  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sound Lautstärke
                    </label>
                    <input 
                      type="range"
                      min="0"
                      max="100"
                      defaultValue="50"
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Leise</span>
                      <span>Mittel</span>
                      <span>Laut</span>
                    </div>
                  </div>
  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Energiesparmodis
                    </label>
                    <select className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                      <option value="disabled">Deaktiviert</option>
                      <option value="low">Energiesparen</option>
                      <option value="ultra">Ultra-Energiesparen</option>
                    </select>
                  </div>
  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      LED Matrix Kalibrierung
                    </label>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        // TODO: Implement calibration
                      }}
                    >
                      Kalibrierung starten
                    </Button>
                  </div>
                </div>
              </div>
  
              {/* System Wartung */}
              <div className="bg-white rounded-lg border p-6">
                <h3 className="text-lg font-medium mb-6">System Wartung</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Firmware Update</h4>
                      <p className="text-sm text-gray-500">Aktuelle Version: v2.1.0</p>
                    </div>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        // TODO: Implement firmware update check
                      }}
                    >
                      Nach Updates suchen
                    </Button>
                  </div>
  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Diagnose</h4>
                      <p className="text-sm text-gray-500">System-Diagnose durchführen</p>
                    </div>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        // TODO: Implement diagnostics
                      }}
                    >
                      Diagnose starten
                    </Button>
                  </div>
  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Neustart</h4>
                      <p className="text-sm text-gray-500">Client neu starten</p>
                    </div>
                    <Button
                      variant="danger"
                      onClick={() => {
                        // TODO: Implement restart
                      }}
                    >
                      Neustart
                    </Button>
                  </div>
                </div>
              </div>
  
              {/* Speichern Button */}
              <div className="flex justify-end space-x-4">
                <Button
                  variant="ghost"
                  onClick={() => {
                    // TODO: Reset changes
                  }}
                >
                  Änderungen verwerfen
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    // TODO: Save changes
                  }}
                >
                  Einstellungen speichern
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  export default ClientDetails;