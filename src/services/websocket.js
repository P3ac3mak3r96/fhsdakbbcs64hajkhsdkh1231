 
// src/services/websocket.js

class WebSocketService {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectTimeout = 1000;
    this.listeners = new Map();
    this.connected = false;
  }

  connect() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    this.ws = new WebSocket(wsUrl);
    
    this.ws.onopen = () => {
      console.log('WebSocket verbunden');
      this.connected = true;
      this.reconnectAttempts = 0;
      this.emit('connection', { status: 'connected' });
    };

    this.ws.onclose = () => {
      console.log('WebSocket getrennt');
      this.connected = false;
      this.emit('connection', { status: 'disconnected' });
      this.attemptReconnect();
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket Fehler:', error);
      this.emit('error', error);
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.emit(data.type, data);
      } catch (error) {
        console.error('Fehler beim Parsen der WebSocket Nachricht:', error);
      }
    };
  }

  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.emit('error', { message: 'Maximale Anzahl an Wiederverbindungsversuchen erreicht' });
      return;
    }

    this.reconnectAttempts++;
    const timeout = this.reconnectTimeout * Math.pow(2, this.reconnectAttempts - 1);

    setTimeout(() => {
      console.log(`Versuche Wiederverbindung (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      this.connect();
    }, timeout);
  }

  send(type, payload) {
    if (!this.connected) {
      console.warn('WebSocket nicht verbunden. Nachricht kann nicht gesendet werden.');
      return false;
    }

    try {
      const message = JSON.stringify({ type, ...payload });
      this.ws.send(message);
      return true;
    } catch (error) {
      console.error('Fehler beim Senden der WebSocket Nachricht:', error);
      return false;
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Fehler im Event Handler (${event}):`, error);
        }
      });
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.listeners.clear();
  }
}

// Singleton-Instanz exportieren
export const wsService = new WebSocketService();