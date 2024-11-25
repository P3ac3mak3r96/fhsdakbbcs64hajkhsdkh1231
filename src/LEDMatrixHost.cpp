#include "LEDMatrixHost.h"
#include <Update.h>
#include <esp_task_wdt.h>

// Konstruktor & Destruktor
LEDMatrixHost::LEDMatrixHost()
    : webServer(Config::Network::WEB_SERVER_PORT)
    , webSocket("/ws")
    , wsClientCount(0)
    , isInitialized(false) {
    clientsMutex = xSemaphoreCreateMutex();
    messageMutex = xSemaphoreCreateMutex();
}

LEDMatrixHost::~LEDMatrixHost() {
    if (clientsMutex) vSemaphoreDelete(clientsMutex);
    if (messageMutex) vSemaphoreDelete(messageMutex);
}

// Initialisierung
bool LEDMatrixHost::begin() {
    Serial.println("Initializing LED Matrix Host...");

    if (!initializeStorage()) {
        Error::ErrorHandler::logError(Error::Code::HARDWARE_ERROR, "Storage initialization failed");
        return false;
    }

    if (!initializeWiFi()) {
        Error::ErrorHandler::logError(Error::Code::WIFI_CONNECTION_FAILED, "WiFi initialization failed");
        return false;
    }

    if (!initializeUDP()) {
        Error::ErrorHandler::logError(Error::Code::UDP_INIT_FAILED, "UDP initialization failed");
        return false;
    }

    setupWebSocket();
    setupWebServer();
    
    if (!createTasks()) {
        Error::ErrorHandler::logError(Error::Code::TASK_CREATE_FAILED, "Task creation failed");
        return false;
    }

    // Initialize watchdog
    esp_task_wdt_init(Config::Tasks::WATCHDOG_TIMEOUT / 1000, true);
    esp_task_wdt_add(nullptr);

    isInitialized = true;
    Serial.println("LED Matrix Host initialized successfully");
    return true;
}

// Speicher-Initialisierung
bool LEDMatrixHost::initializeStorage() {
    if (!SPIFFS.begin(true)) {
        Serial.println("SPIFFS Mount Failed");
        return false;
    }
    
    // Check available space
    size_t totalBytes = SPIFFS.totalBytes();
    size_t usedBytes = SPIFFS.usedBytes();
    Serial.printf("Storage: %u bytes total, %u bytes used\n", totalBytes, usedBytes);
    
    return true;
}

// WiFi-Initialisierung
bool LEDMatrixHost::initializeWiFi() {
    WiFi.mode(WIFI_MODE_AP);
    
    // Configure AP with static IP
    IPAddress localIP;
    IPAddress gateway;
    IPAddress subnet;
    
    if (!localIP.fromString(Config::Network::AP_IP) || 
        !gateway.fromString(Config::Network::AP_IP) ||
        !subnet.fromString(Config::Network::AP_SUBNET)) {
        return false;
    }

    if (!WiFi.softAPConfig(localIP, gateway, subnet)) {
        Serial.println("AP Config Failed");
        return false;
    }

    if (!WiFi.softAP(Config::Security::WIFI_SSID, 
                    Config::Security::WIFI_PASSWORD,
                    Config::Network::WIFI_CHANNEL,
                    0,  // Hide SSID
                    Config::Network::MAX_CLIENTS)) {
        Serial.println("AP Start Failed");
        return false;
    }

    Serial.print("AP IP address: ");
    Serial.println(WiFi.softAPIP());
    
    return true;
}
// UDP-Initialisierung
bool LEDMatrixHost::initializeUDP() {
    if (!udp.listen(Config::Network::UDP_PORT)) {
        Serial.println("UDP Listener Failed");
        return false;
    }

    udp.onPacket([this](AsyncUDPPacket packet) {
        handleUDPPacket(packet);
    });

    Serial.printf("UDP listening on port %d\n", Config::Network::UDP_PORT);
    return true;
}

// WebSocket-Setup
void LEDMatrixHost::setupWebSocket() {
    webSocket.onEvent([this](AsyncWebSocket* server, 
                           AsyncWebSocketClient* client,
                           AwsEventType type,
                           void* arg, 
                           uint8_t* data, 
                           size_t len) {
        handleWebSocketEvent(server, client, type, arg, data, len);
    });

    webSocket.setAuthentication(Config::Security::API_USERNAME, 
                              Config::Security::API_PASSWORD);
    webServer.addHandler(&webSocket);
}

// WebSocket Event Handler
void LEDMatrixHost::handleWebSocketEvent(AsyncWebSocket* server,
                                       AsyncWebSocketClient* client,
                                       AwsEventType type,
                                       void* arg,
                                       uint8_t* data,
                                       size_t len) {
    switch (type) {
        case WS_EVT_CONNECT:
            handleWebSocketConnect(client);
            break;
            
        case WS_EVT_DISCONNECT:
            handleWebSocketDisconnect(client);
            break;
            
        case WS_EVT_DATA:
            handleWebSocketData(arg, data, len);
            break;
            
        case WS_EVT_ERROR:
            handleWebSocketError(client, arg);
            break;
    }
}

void LEDMatrixHost::handleWebSocketConnect(AsyncWebSocketClient* client) {
    if (wsClientCount >= Config::Network::MAX_WEBSOCKET_CLIENTS) {
        client->close();
        Error::ErrorHandler::logError(Error::Code::WEBSOCKET_ERROR, "Max WebSocket clients reached");
        return;
    }
    
    wsClientCount++;
    Serial.printf("WebSocket client connected. ID: %u\n", client->id());
    
    // Send initial state
    DynamicJsonDocument doc(1024);
    doc["type"] = "initial_state";
    doc["clients"] = getClientListJson();
    
    String response;
    serializeJson(doc, response);
    client->text(response);
}

void LEDMatrixHost::handleWebSocketDisconnect(AsyncWebSocketClient* client) {
    wsClientCount--;
    Serial.printf("WebSocket client disconnected. ID: %u\n", client->id());
}

void LEDMatrixHost::handleWebSocketData(void* arg, uint8_t* data, size_t len) {
    AwsFrameInfo* info = (AwsFrameInfo*)arg;
    if (info->final && info->index == 0 && info->len == len && info->opcode == WS_TEXT) {
        data[len] = 0;
        DynamicJsonDocument doc(1024);
        DeserializationError error = deserializeJson(doc, (char*)data);
        
        if (error) {
            Error::ErrorHandler::logError(Error::Code::INVALID_MESSAGE, "Invalid WebSocket JSON");
            return;
        }
        
        processWebSocketMessage(doc);
    }
}

void LEDMatrixHost::handleWebSocketError(AsyncWebSocketClient* client, void* arg) {
    Error::ErrorHandler::logError(Error::Code::WEBSOCKET_ERROR, 
            String("WebSocket error for client " + String(client->id())).c_str());
}

void LEDMatrixHost::processWebSocketMessage(const JsonDocument& doc) {
    String command = doc["command"].as<String>();
    
    if (command == "getClients") {
        String response = getClientListJson();
        webSocket.textAll(response);
    }
    else if (command == "startTraining") {
        uint8_t clientId = doc["clientId"] | 0;
        TrainingModes::TrainingConfig config;
        // Parse training config from JSON
        config.mode = static_cast<TrainingModes::Mode>(doc["mode"] | 0);
        config.difficulty = static_cast<TrainingModes::Difficulty>(doc["difficulty"] | 0);
        config.duration = doc["duration"] | 300;
        config.targetCount = doc["targetCount"] | 10;
        config.reactTime = doc["reactTime"] | 1000;
        config.soundEnabled = doc["sound"] | true;
        config.stressorsEnabled = doc["stressors"] | false;
        config.brightness = doc["brightness"] | 128;
        
        startTraining(clientId, config);
    }
    else if (command == "stopTraining") {
        uint8_t clientId = doc["clientId"] | 0;
        stopTraining(clientId);
    }
}
// Web Server Setup
void LEDMatrixHost::setupWebServer() {
    setupStaticRoutes();
    setupAPIRoutes();
    
    webServer.begin();
    Serial.println("Web Server started");
}

void LEDMatrixHost::setupStaticRoutes() {
    // Serve static files from SPIFFS
    webServer.serveStatic("/", SPIFFS, "/").setDefaultFile("index.html");
    
    // Language files
    webServer.on("/lang/{lang}.json", HTTP_GET, [](AsyncWebServerRequest *request) {
        String lang = request->pathArg(0);
        String path = "/lang/" + lang + ".json";
        
        if (SPIFFS.exists(path)) {
            request->send(SPIFFS, path, "application/json");
        } else {
            request->send(404);
        }
    });
}

void LEDMatrixHost::setupAPIRoutes() {
    // Training API endpoints
    webServer.on("/api/training", HTTP_POST, [this](AsyncWebServerRequest *request) {
        handleTrainingRequest(request);
    });

    webServer.on("/api/training/status", HTTP_GET, [this](AsyncWebServerRequest *request) {
        handleStatusRequest(request);
    });

    // LED control endpoints
    webServer.on("/api/led", HTTP_POST, [this](AsyncWebServerRequest *request) {
        handleAPIRequest(request, Config::MessageType::LED_COMMAND);
    });

    // Buzzer control endpoints
    webServer.on("/api/buzzer", HTTP_POST, [this](AsyncWebServerRequest *request) {
        handleAPIRequest(request, Config::MessageType::BUZZER_COMMAND);
    });

    // Effect control endpoints
    webServer.on("/api/effect", HTTP_POST, [this](AsyncWebServerRequest *request) {
        handleAPIRequest(request, Config::MessageType::EFFECT_COMMAND);
    });
}

void LEDMatrixHost::handleTrainingRequest(AsyncWebServerRequest* request) {
    if (!request->authenticate(Config::Security::API_USERNAME, Config::Security::API_PASSWORD)) {
        return request->requestAuthentication();
    }

    if (request->hasParam("plain", true)) {
        String body = request->getParam("plain", true)->value();
        DynamicJsonDocument doc(1024);
        DeserializationError error = deserializeJson(doc, body);

        if (error) {
            request->send(400, "application/json", "{\"message\":\"Invalid JSON\"}");
            return;
        }

        uint8_t clientId = doc["clientId"];
        TrainingModes::TrainingConfig config;
        
        config.mode = static_cast<TrainingModes::Mode>(doc["mode"].as<uint8_t>());
        config.difficulty = static_cast<TrainingModes::Difficulty>(doc["difficulty"].as<uint8_t>());
        config.duration = doc["duration"] | 300;  // default 5 minutes
        config.targetCount = doc["targetCount"] | 10;
        config.reactTime = doc["reactTime"] | 1000;
        config.soundEnabled = doc["sound"] | true;
        config.stressorsEnabled = doc["stressors"] | false;
        config.brightness = doc["brightness"] | 128;

        sendTrainingCommand(clientId, config);
        
        if (xSemaphoreTake(clientsMutex, pdMS_TO_TICKS(100))) {
            auto it = clients.find(clientId);
            if (it != clients.end()) {
                it->second->training = config;
                it->second->training.timestamp = millis();
                it->second->score = 0;
                it->second->hitCount = 0;
                it->second->missCount = 0;
            }
            xSemaphoreGive(clientsMutex);
        }

        request->send(200, "application/json", "{\"message\":\"Training started\"}");
    } else {
        request->send(400, "application/json", "{\"message\":\"No data received\"}");
    }
}

void LEDMatrixHost::handleAPIRequest(AsyncWebServerRequest* request, Config::MessageType commandType) {
    if (!request->authenticate(Config::Security::API_USERNAME, Config::Security::API_PASSWORD)) {
        return request->requestAuthentication();
    }

    if (request->hasParam("plain", true)) {
        String body = request->getParam("plain", true)->value();
        DynamicJsonDocument doc(1024);
        DeserializationError error = deserializeJson(doc, body);

        if (error) {
            request->send(400, "application/json", "{\"message\":\"Invalid JSON\"}");
            return;
        }

        uint8_t clientId = doc["clientId"];
        uint8_t packet[Config::Network::UDP_BUFFER_SIZE];
        packet[0] = static_cast<uint8_t>(commandType);
        packet[1] = clientId;
        size_t packetSize = 2;

        if (commandType == Config::MessageType::LED_COMMAND && doc.containsKey("color")) {
            String color = doc["color"];
            uint32_t rgb = strtoul(color.substring(1).c_str(), NULL, 16);
            packet[2] = (rgb >> 16) & 0xFF; // Rot
            packet[3] = (rgb >> 8) & 0xFF;  // Grün
            packet[4] = rgb & 0xFF;         // Blau
            packetSize += 3;
        } else if (commandType == Config::MessageType::BUZZER_COMMAND) {
            uint16_t frequency = doc["frequency"];
            uint16_t duration = doc["duration"];
            packet[2] = (frequency >> 8) & 0xFF;
            packet[3] = frequency & 0xFF;
            packet[4] = (duration >> 8) & 0xFF;
            packet[5] = duration & 0xFF;
            packetSize += 4;
        } else if (commandType == Config::MessageType::EFFECT_COMMAND && doc.containsKey("effect")) {
            String effect = doc["effect"];
            if (effect == "rainbow") {
                packet[2] = static_cast<uint8_t>(Config::Effects::Type::RAINBOW);
            } else if (effect == "fade") {
                packet[2] = static_cast<uint8_t>(Config::Effects::Type::FADE);
            } else if (effect == "sparkle") {
                packet[2] = static_cast<uint8_t>(Config::Effects::Type::SPARKLE);
            }
            packetSize += 1;
        }

        sendPacketToClient(packet, packetSize, clientId);
        request->send(200, "application/json", "{\"message\":\"Command sent\"}");
    } else {
        request->send(400, "application/json", "{\"message\":\"No data received\"}");
    }
}
// Task Creation
bool LEDMatrixHost::createTasks() {
    // Heartbeat task
    BaseType_t result = xTaskCreatePinnedToCore(
        heartbeatTask,
        "Heartbeat",
        Config::Tasks::STACK_SIZE,
        this,
        Config::Tasks::PRIORITY_MEDIUM,
        nullptr,
        1
    );
    
    if (result != pdPASS) {
        return false;
    }

    // Message processor task
    result = xTaskCreatePinnedToCore(
        messageProcessorTask,
        "MsgProcessor",
        Config::Tasks::STACK_SIZE,
        this,
        Config::Tasks::PRIORITY_HIGH,
        nullptr,
        1
    );
    
    if (result != pdPASS) {
        return false;
    }

    // Status broadcast task
    result = xTaskCreatePinnedToCore(
        statusBroadcastTask,
        "StatusBcast",
        Config::Tasks::STACK_SIZE,
        this,
        Config::Tasks::PRIORITY_LOW,
        nullptr,
        1
    );
    
    if (result != pdPASS) {
        return false;
    }

    // Training monitor task
    result = xTaskCreatePinnedToCore(
        trainingMonitorTask,
        "TrainingMon",
        Config::Tasks::STACK_SIZE,
        this,
        Config::Tasks::PRIORITY_MEDIUM,
        nullptr,
        1
    );
    
    return result == pdPASS;
}

// Task Implementation
void LEDMatrixHost::heartbeatTask(void* parameter) {
    LEDMatrixHost* host = static_cast<LEDMatrixHost*>(parameter);
    TickType_t xLastWakeTime = xTaskGetTickCount();
    
    for (;;) {
        host->removeInactiveClients();
        vTaskDelayUntil(&xLastWakeTime, pdMS_TO_TICKS(Config::Tasks::HEARTBEAT_INTERVAL));
    }
}

void LEDMatrixHost::messageProcessorTask(void* parameter) {
    LEDMatrixHost* host = static_cast<LEDMatrixHost*>(parameter);
    
    for (;;) {
        if (xSemaphoreTake(host->messageMutex, pdMS_TO_TICKS(100)) == pdTRUE) {
            while (!host->messageQueue.empty()) {
                Message msg = host->messageQueue.front();
                host->messageQueue.pop();
                host->processMessage(msg);
            }
            xSemaphoreGive(host->messageMutex);
        }
        vTaskDelay(pdMS_TO_TICKS(10));
    }
}

void LEDMatrixHost::statusBroadcastTask(void* parameter) {
    LEDMatrixHost* host = static_cast<LEDMatrixHost*>(parameter);
    TickType_t xLastWakeTime = xTaskGetTickCount();
    
    for (;;) {
        host->broadcastClientStatus();
        vTaskDelayUntil(&xLastWakeTime, pdMS_TO_TICKS(1000));
    }
}

void LEDMatrixHost::trainingMonitorTask(void* parameter) {
    LEDMatrixHost* host = static_cast<LEDMatrixHost*>(parameter);
    TickType_t xLastWakeTime = xTaskGetTickCount();
    
    for (;;) {
        if (xSemaphoreTake(host->clientsMutex, pdMS_TO_TICKS(100)) == pdTRUE) {
            for (auto& clientPair : host->clients) {
                auto& client = clientPair.second;
                if (client && client->isActive) {
                    // Check if training time is up
                    uint32_t trainingDuration = (millis() - client->training.timestamp) / 1000;
                    if (trainingDuration >= client->training.duration) {
                        host->stopTraining(client->id);
                    }
                }
            }
            xSemaphoreGive(host->clientsMutex);
        }
        vTaskDelayUntil(&xLastWakeTime, pdMS_TO_TICKS(1000));
    }
}

// Message Processing
void LEDMatrixHost::processMessage(const Message& msg) {
    switch (msg.type) {
        case Config::MessageType::STATUS_REQUEST:
            if (msg.data.size() >= 6) {
                uint16_t hits = (msg.data[2] << 8) | msg.data[3];
                uint16_t misses = (msg.data[4] << 8) | msg.data[5];
                updateTrainingStatus(msg.clientId, TrainingModes::TrainingResult{
                    hits,
                    misses,
                    millis(),
                    0,  // avgReactionTime will be calculated
                    0   // score will be calculated
                });
            }
            break;
            
        case Config::MessageType::ERROR_REPORT:
            if (msg.data.size() >= 3) {
                Error::Code errorCode = static_cast<Error::Code>(msg.data[2]);
                Error::ErrorHandler::logError(errorCode, 
                    "Client error reported", msg.clientId);
            }
            break;
            
        default:
            break;
    }
}

// Client Management
void LEDMatrixHost::removeInactiveClients() {
    if (xSemaphoreTake(clientsMutex, pdMS_TO_TICKS(100)) == pdTRUE) {
        for (auto it = clients.begin(); it != clients.end();) {
            if (!it->second->isActive || 
                (millis() - it->second->lastSeen) > Config::Tasks::CLIENT_TIMEOUT) {
                it = clients.erase(it);
            } else {
                ++it;
            }
        }
        xSemaphoreGive(clientsMutex);
    }
}

void LEDMatrixHost::broadcastClientStatus() {
    String status = getClientListJson();
    webSocket.textAll(status);
}
// Training Control
void LEDMatrixHost::startTraining(uint8_t clientId, const TrainingModes::TrainingConfig& config) {
    if (xSemaphoreTake(clientsMutex, pdMS_TO_TICKS(100)) == pdTRUE) {
        auto it = clients.find(clientId);
        if (it != clients.end() && it->second->isActive) {
            it->second->training = config;
            it->second->training.timestamp = millis();
            
            // Send training start command to client
            uint8_t packet[32];  // Adjust size as needed
            packet[0] = static_cast<uint8_t>(Config::MessageType::EFFECT_COMMAND);
            packet[1] = clientId;
            packet[2] = static_cast<uint8_t>(config.mode);
            packet[3] = static_cast<uint8_t>(config.difficulty);
            packet[4] = (config.duration >> 8) & 0xFF;
            packet[5] = config.duration & 0xFF;
            packet[6] = (config.targetCount >> 8) & 0xFF;
            packet[7] = config.targetCount & 0xFF;
            packet[8] = (config.reactTime >> 8) & 0xFF;
            packet[9] = config.reactTime & 0xFF;
            packet[10] = config.soundEnabled ? 1 : 0;
            packet[11] = config.stressorsEnabled ? 1 : 0;
            packet[12] = config.brightness;
            
            sendPacketToClient(packet, 13, clientId);
            
            // Notify WebSocket clients
            DynamicJsonDocument doc(512);
            doc["type"] = "training_started";
            doc["clientId"] = clientId;
            doc["mode"] = static_cast<uint8_t>(config.mode);
            doc["difficulty"] = static_cast<uint8_t>(config.difficulty);
            
            String notification;
            serializeJson(doc, notification);
            webSocket.textAll(notification);
        }
        xSemaphoreGive(clientsMutex);
    }
}

void LEDMatrixHost::stopTraining(uint8_t clientId) {
    if (xSemaphoreTake(clientsMutex, pdMS_TO_TICKS(100)) == pdTRUE) {
        auto it = clients.find(clientId);
        if (it != clients.end() && it->second->isActive) {
            // Send stop command to client
            uint8_t packet[3];
            packet[0] = static_cast<uint8_t>(Config::MessageType::EFFECT_COMMAND);
            packet[1] = clientId;
            packet[2] = 0xFF;  // Special code for stop training
            
            sendPacketToClient(packet, 3, clientId);
            
            // Calculate final results
            auto& result = it->second->results;
            result.totalTime = millis() - it->second->training.timestamp;
            result.score = TrainingModes::TrainingManager::calculateScore(result);
            
            // Notify WebSocket clients
            DynamicJsonDocument doc(512);
            doc["type"] = "training_completed";
            doc["clientId"] = clientId;
            doc["results"] = getTrainingStatusJson(clientId);
            
            String notification;
            serializeJson(doc, notification);
            webSocket.textAll(notification);
            
            // Reset training state
            it->second->training = TrainingModes::TrainingConfig();
        }
        xSemaphoreGive(clientsMutex);
    }
}

void LEDMatrixHost::updateTrainingStatus(uint8_t clientId, const TrainingModes::TrainingResult& result) {
    if (xSemaphoreTake(clientsMutex, pdMS_TO_TICKS(100)) == pdTRUE) {
        auto it = clients.find(clientId);
        if (it != clients.end() && it->second->isActive) {
            it->second->results = result;
            it->second->results.score = TrainingModes::TrainingManager::calculateScore(result);
            
            // Notify WebSocket clients
            String status = getTrainingStatusJson(clientId);
            webSocket.textAll(status);
        }
        xSemaphoreGive(clientsMutex);
    }
}

// Helper Methods
void LEDMatrixHost::sendPacketToClient(uint8_t* packet, size_t packetSize, uint8_t clientId) {
    if (clientId == static_cast<uint8_t>(Config::MessageType::BROADCAST)) {
        udp.broadcastTo(packet, packetSize, Config::Network::UDP_PORT);
    } else {
        if (xSemaphoreTake(clientsMutex, pdMS_TO_TICKS(100)) == pdTRUE) {
            auto it = clients.find(clientId);
            if (it != clients.end() && it->second->isActive) {
                udp.writeTo(packet, packetSize, it->second->ip, Config::Network::UDP_PORT);
            }
            xSemaphoreGive(clientsMutex);
        }
    }
}

String LEDMatrixHost::getClientListJson() {
    DynamicJsonDocument doc(2048);
    JsonArray clientArray = doc.createNestedArray("clients");
    
    if (xSemaphoreTake(clientsMutex, pdMS_TO_TICKS(100)) == pdTRUE) {
        for (const auto& clientPair : clients) {
            const auto& client = clientPair.second;
            if (client && client->isActive) {
                JsonObject clientObj = clientArray.createNestedObject();
                clientObj["id"] = client->id;
                clientObj["ip"] = client->ip.toString();
                clientObj["lastSeen"] = client->lastSeen;
                clientObj["color"] = String(client->currentColor[0]) + "," + 
                                   String(client->currentColor[1]) + "," + 
                                   String(client->currentColor[2]);
                clientObj["effect"] = static_cast<uint8_t>(client->currentEffect);
                clientObj["brightness"] = client->brightness;
                
                if (client->training.timestamp > 0) {
                    JsonObject trainingObj = clientObj.createNestedObject("training");
                    trainingObj["mode"] = static_cast<uint8_t>(client->training.mode);
                    trainingObj["difficulty"] = static_cast<uint8_t>(client->training.difficulty);
                    trainingObj["duration"] = client->training.duration;
                    trainingObj["elapsed"] = (millis() - client->training.timestamp) / 1000;
                    trainingObj["hits"] = client->results.hits;
                    trainingObj["misses"] = client->results.misses;
                    trainingObj["score"] = client->results.score;
                }
            }
        }
        xSemaphoreGive(clientsMutex);
    }
    
    String jsonString;
    serializeJson(doc, jsonString);
    return jsonString;
}

String LEDMatrixHost::getTrainingStatusJson(uint8_t clientId) {
    DynamicJsonDocument doc(512);
    
    if (xSemaphoreTake(clientsMutex, pdMS_TO_TICKS(100)) == pdTRUE) {
        auto it = clients.find(clientId);
        if (it != clients.end() && it->second->isActive) {
            const auto& client = it->second;
            doc["type"] = "training_status";
            doc["clientId"] = clientId;
            doc["mode"] = static_cast<uint8_t>(client->training.mode);
            doc["difficulty"] = static_cast<uint8_t>(client->training.difficulty);
            doc["duration"] = client->training.duration;
            doc["elapsed"] = (millis() - client->training.timestamp) / 1000;
            doc["hits"] = client->results.hits;
            doc["misses"] = client->results.misses;
            doc["score"] = client->results.score;
            doc["avgReactionTime"] = client->results.avgReactionTime;
        }
        xSemaphoreGive(clientsMutex);
    }
    
    String jsonString;
    serializeJson(doc, jsonString);
    return jsonString;
}

// Main loop method - can be used for non-task operations if needed
void LEDMatrixHost::loop() {
    esp_task_wdt_reset();  // Reset watchdog timer
}