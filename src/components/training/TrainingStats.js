// src/components/training/TrainingStats.js
import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';
import { 
  Calendar,
  Download,
  Filter,
  ChevronDown,
  Target,
  Clock,
  Activity,
  Award
} from 'lucide-react';
import Button from '../ui/Button';

const TrainingStats = ({ clients }) => {
  const [timeRange, setTimeRange] = useState('week');
  const [selectedMetric, setSelectedMetric] = useState('accuracy');
  
  // Aggregierte Statistiken berechnen
  const stats = useMemo(() => {
    const activeClients = clients.filter(client => client.training?.active);
    return {
      totalSessions: activeClients.length,
      averageAccuracy: activeClients.reduce((acc, client) => 
        acc + (client.training?.stats?.accuracy || 0), 0) / (activeClients.length || 1),
      totalHits: activeClients.reduce((acc, client) => 
        acc + (client.training?.stats?.hits || 0), 0),
      averageReactionTime: activeClients.reduce((acc, client) => 
        acc + (client.training?.stats?.avgReactionTime || 0), 0) / (activeClients.length || 1)
    };
  }, [clients]);

  // Mock-Daten für die Charts
  const performanceData = [
    { name: 'Mo', accuracy: 85, speed: 92, hits: 45 },
    { name: 'Di', accuracy: 88, speed: 87, hits: 52 },
    { name: 'Mi', accuracy: 82, speed: 89, hits: 48 },
    { name: 'Do', accuracy: 91, speed: 85, hits: 55 },
    { name: 'Fr', accuracy: 84, speed: 91, hits: 50 },
    { name: 'Sa', accuracy: 89, speed: 88, hits: 53 },
    { name: 'So', accuracy: 86, speed: 90, hits: 51 }
  ];

  const skillsData = [
    { subject: 'Genauigkeit', value: 85 },
    { subject: 'Geschwindigkeit', value: 90 },
    { subject: 'Konsistenz', value: 75 },
    { subject: 'Stressresistenz', value: 80 },
    { subject: 'Multitasking', value: 70 }
  ];

  const sessionData = [
    { name: '08:00', sessions: 5 },
    { name: '10:00', sessions: 8 },
    { name: '12:00', sessions: 12 },
    { name: '14:00', sessions: 15 },
    { name: '16:00', sessions: 10 },
    { name: '18:00', sessions: 7 },
    { name: '20:00', sessions: 4 }
  ];

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="day">Heute</option>
              <option value="week">Diese Woche</option>
              <option value="month">Dieser Monat</option>
              <option value="year">Dieses Jahr</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>

          <Button
            variant="ghost"
            icon={Filter}
          >
            Filter
          </Button>
        </div>

        <Button
          variant="secondary"
          icon={Download}
        >
          Export
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Target className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm text-gray-500">Durchschnittliche Genauigkeit</p>
              <p className="mt-1 text-2xl font-semibold">
                {stats.averageAccuracy.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Activity className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm text-gray-500">Training Sessions</p>
              <p className="mt-1 text-2xl font-semibold">
                {stats.totalSessions}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-sm text-gray-500">Reaktionszeit</p>
              <p className="mt-1 text-2xl font-semibold">
                {stats.averageReactionTime.toFixed(0)}ms
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Award className="h-8 w-8 text-yellow-500" />
            <div className="ml-4">
              <p className="text-sm text-gray-500">Gesamttreffer</p>
              <p className="mt-1 text-2xl font-semibold">
                {stats.totalHits}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium">Performance Trend</h3>
          <div className="flex items-center space-x-4">
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-md py-1 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="accuracy">Genauigkeit</option>
              <option value="speed">Geschwindigkeit</option>
              <option value="hits">Treffer</option>
            </select>
          </div>
        </div>
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
                dataKey={selectedMetric}
                stroke="#2563eb"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Skills Radar & Session Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skills Radar */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-6">Fähigkeiten-Analyse</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={skillsData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar
                  name="Fähigkeiten"
                  dataKey="value"
                  stroke="#2563eb"
                  fill="#3b82f6"
                  fillOpacity={0.6}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Session Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-6">Training-Verteilung</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sessionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar 
                  dataKey="sessions"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Training Sessions */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium">Letzte Trainingseinheiten</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Modus
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Datum
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dauer
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Genauigkeit
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Punkte
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clients.filter(client => client.training?.active).map((client, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Client {client.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {client.training.mode}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(client.training.startTime).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {Math.round(client.training.duration / 60)} Min
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {client.training.stats.accuracy}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {client.training.stats.score}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TrainingStats;
