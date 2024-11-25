// Global state
let currentLanguage = 'de';
let translations = {};
let selectedClients = new Set();
let websocket = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

// Training modes configuration
const trainingModes = [
    { id: 0, key: 'basicTraining' },
    { id: 1, key: 'reactionTraining' },
    { id: 2, key: 'colorCoded' },
    { id: 3, key: 'movingTarget' },
    { id: 4, key: 'stressTraining' },
    { id: 5, key: 'timedTraining' },
    { id: 6, key: 'endurance' },
    { id: 7, key: 'teamTraining' },
    { id: 8, key: 'competition' },
    { id: 9, key: 'skillFocus' },
    { id: 10, key: 'adrenaline' },
    { id: 11, key: 'nightVision' },
    { id: 12, key: 'distance' },
    { id: 13, key: 'multiTarget' },
    { id: 14, key: 'hostageRescue' }
];

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    initializeWebSocket();
    loadLanguage(currentLanguage);
    initializeTrainingModes();
    setupEventListeners();
});

// WebSocket Management
function initializeWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws_url = `${protocol}//${window.location.host}/ws`;
    
    websocket = new WebSocket(ws_url);
    websocket.onopen = onWebSocketOpen;
    websocket.onclose = onWebSocketClose;
    websocket.onerror = onWebSocketError;
    websocket.onmessage = onWebSocketMessage;
}

function onWebSocketOpen() {
    console.log('WebSocket Connected');
    reconnectAttempts = 0;
    updateConnectionStatus(true);
    requestClientList();
}

function onWebSocketClose() {
    console.log('WebSocket Disconnected');
    updateConnectionStatus(false);
    
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttempts++;
        setTimeout(initializeWebSocket, 2000 * reconnectAttempts);
    } else {
        showMessage('Verbindung verloren. Bitte Seite neu laden.', 'error');
    }
}

function onWebSocketError(error) {
    console.error('WebSocket Error:', error);
    showMessage('Verbindungsfehler', 'error');
}

function onWebSocketMessage(event) {
    try {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
            case 'client_list':
                updateClientList(data.clients);
                break;
            case 'training_status':
                updateTrainingStatus(data);
                break;
            case 'training_started':
                handleTrainingStarted(data);
                break;
            case 'training_completed':
                handleTrainingCompleted(data);
                break;
            case 'error':
                handleError(data);
                break;
        }
    } catch (error) {
        console.error('Error processing message:', error);
    }
}

// Client Management
function updateClientList(clients) {
    const clientList = document.getElementById('clientList');
    clientList.innerHTML = '';
    
    clients.forEach(client => {
        const div = document.createElement('div');
        div.className = `client-item ${selectedClients.has(client.id) ? 'selected' : ''}`;
        div.onclick = () => toggleClient(client.id);
        
        // Create status indicator
        const status = document.createElement('div');
        status.className = 'client-status';
        status.style.backgroundColor = client.training ? '#4CAF50' : '#2196F3';
        
        // Create client info
        const info = document.createElement('div');
        info.className = 'client-info';
        info.textContent = `Client ${client.id}`;
        
        if (client.training) {
            const progress = document.createElement('div');
            progress.className = 'training-progress';
            const percent = (client.training.elapsed / client.training.duration) * 100;
            progress.style.width = `${percent}%`;
            div.appendChild(progress);
        }
        
        div.appendChild(status);
        div.appendChild(info);
        clientList.appendChild(div);
    });
}

function toggleClient(id) {
    if (selectedClients.has(id)) {
        selectedClients.delete(id);
    } else {
        selectedClients.add(id);
    }
    updateClientList(Array.from(document.querySelectorAll('.client-item')));
}

function selectAllClients() {
    document.querySelectorAll('.client-item').forEach(item => {
        const id = parseInt(item.dataset.id);
        selectedClients.add(id);
    });
    updateClientList(Array.from(document.querySelectorAll('.client-item')));
}

function deselectAllClients() {
    selectedClients.clear();
    updateClientList(Array.from(document.querySelectorAll('.client-item')));
}

// Training Control
function initializeTrainingModes() {
    const select = document.getElementById('trainingMode');
    trainingModes.forEach(mode => {
        const option = document.createElement('option');
        option.value = mode.id;
        option.textContent = translateKey(mode.key);
        select.appendChild(option);
    });
}

function startTraining() {
    if (selectedClients.size === 0) {
        showMessage(translateKey('noClientSelected'), 'error');
        return;
    }

    const config = {
        mode: parseInt(document.getElementById('trainingMode').value),
        difficulty: parseInt(document.getElementById('difficulty').value),
        duration: parseInt(document.getElementById('duration').value),
        targetCount: parseInt(document.getElementById('targetCount').value),
        sound: document.getElementById('soundEnabled').checked,
        stressors: document.getElementById('stressorsEnabled').checked,
        brightness: parseInt(document.getElementById('brightness').value)
    };

    selectedClients.forEach(clientId => {
        const message = {
            command: 'startTraining',
            clientId: clientId,
            config: config
        };
        websocket.send(JSON.stringify(message));
    });

    document.getElementById('startTrainingBtn').disabled = true;
    document.getElementById('stopTrainingBtn').disabled = false;
}

function stopTraining() {
    selectedClients.forEach(clientId => {
        const message = {
            command: 'stopTraining',
            clientId: clientId
        };
        websocket.send(JSON.stringify(message));
    });

    document.getElementById('startTrainingBtn').disabled = false;
    document.getElementById('stopTrainingBtn').disabled = true;
}

function updateTrainingStatus(data) {
    const statusContent = document.getElementById('trainingStatusContent');
    const statusItem = document.createElement('div');
    statusItem.className = 'status-item';
    
    const progress = (data.elapsed / data.duration) * 100;
    
    statusItem.innerHTML = `
        <div class="status-header">
            <span>Client ${data.clientId}</span>
            <span>${translateKey(trainingModes[data.mode].key)}</span>
        </div>
        <div class="status-progress">
            <div class="progress-bar" style="width: ${progress}%"></div>
        </div>
        <div class="status-details">
            <div>Treffer: ${data.hits}</div>
            <div>Fehler: ${data.misses}</div>
            <div>Punkte: ${data.score}</div>
        </div>
    `;
    
    statusContent.appendChild(statusItem);
}

// LED Control
function sendLEDCommand(color) {
    if (selectedClients.size === 0) {
        showMessage(translateKey('noClientSelected'), 'error');
        return;
    }

    const rgb = hexToRgb(color || document.getElementById('colorPicker').value);
    const brightness = parseInt(document.getElementById('brightness').value);

    selectedClients.forEach(clientId => {
        const message = {
            command: 'led',
            clientId: clientId,
            color: rgb,
            brightness: brightness
        };
        websocket.send(JSON.stringify(message));
    });
}

function sendEffect(effectName) {
    if (selectedClients.size === 0) {
        showMessage(translateKey('noClientSelected'), 'error');
        return;
    }

    selectedClients.forEach(clientId => {
        const message = {
            command: 'effect',
            clientId: clientId,
            effect: effectName
        };
        websocket.send(JSON.stringify(message));
    });
}

// Utility Functions
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function updateConnectionStatus(connected) {
    const status = document.getElementById('connectionStatus');
    status.textContent = connected ? translateKey('connected') : translateKey('disconnected');
    status.className = `connection-status ${connected ? '' : 'disconnected'}`;
}

function showMessage(message, type = 'info') {
    const messageBox = document.getElementById('messageBox');
    messageBox.textContent = message;
    messageBox.className = `message-box ${type}`;
    messageBox.style.display = 'block';
    
    setTimeout(() => {
        messageBox.style.display = 'none';
    }, 3000);
}

// Language Management
async function loadLanguage(lang) {
    try {
        const response = await fetch(`/lang/${lang}.json`);
        translations[lang] = await response.json();
        applyTranslations();
    } catch (error) {
        console.error('Error loading language:', error);
    }
}

function changeLanguage(lang) {
    currentLanguage = lang;
    if (!translations[lang]) {
        loadLanguage(lang);
    } else {
        applyTranslations();
    }
}

function applyTranslations() {
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.dataset.translate;
        if (translations[currentLanguage][key]) {
            element.textContent = translations[currentLanguage][key];
        }
    });
    
    // Update training mode options
    initializeTrainingModes();
}

function translateKey(key) {
    return translations[currentLanguage][key] || key;
}

// Event Listeners
function setupEventListeners() {
    // Color picker change
    document.getElementById('colorPicker').addEventListener('change', () => sendLEDCommand());
    
    // Brightness change
    document.getElementById('brightness').addEventListener('input', () => sendLEDCommand());
    
    // Training config changes
    document.getElementById('trainingMode').addEventListener('change', updateTrainingConfig);
    document.getElementById('difficulty').addEventListener('change', updateTrainingConfig);
}

function updateTrainingConfig() {
    const mode = parseInt(document.getElementById('trainingMode').value);
    const difficulty = parseInt(document.getElementById('difficulty').value);
    
    // Update UI based on selected mode and difficulty
}