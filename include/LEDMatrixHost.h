#pragma once

#include <WiFi.h>
#include <AsyncTCP.h>
#include <ESPAsyncWebServer.h>
#include <AsyncUDP.h>
#include <ArduinoJson.h>
#include <SPIFFS.h>
#include <memory>
#include <map>
#include <queue>
#include <vector>
#include "config.h"
#include "ErrorHandling.h"
#include "TrainingModes.h"

class LEDMatrixHost {
public:
    LEDMatrixHost();
    ~LEDMatrixHost();
    
    bool begin();
    void loop();

private:
    struct Client {
        uint8_t id;
        IPAddress ip;
        uint32_t lastSeen;
        bool isActive;
        std::array<uint8_t, 3> currentColor;
        Config::Effects::Type currentEffect;
        uint8_t brightness;
        TrainingModes::TrainingConfig training;
        TrainingModes::TrainingResult results;
        Error::Code lastError;
    };

    struct Message {
        Config::MessageType type;
        uint8_t clientId;
        std::vector<uint8_t> data;
        uint32_t timestamp;
    };

    // Server-Komponenten
    AsyncWebServer webServer;
    AsyncWebSocket webSocket;
    AsyncUDP udp;

    // Datenverwaltung
    std::map<uint8_t, std::unique_ptr<Client>> clients;
    std::queue<Message> messageQueue;
    
    // Synchronisation
    SemaphoreHandle_t clientsMutex;
    SemaphoreHandle_t messageMutex;
    
    // Status
    uint8_t wsClientCount;
    bool isInitialized;

    // Initialisierungsmethoden
    bool initializeStorage();
    bool initializeWiFi();
    bool initializeUDP();
    bool createTasks();

    // WebSocket-Handler
    void setupWebSocket();
    void handleWebSocketEvent(AsyncWebSocket* server, AsyncWebSocketClient* client,
                            AwsEventType type, void* arg, uint8_t* data, size_t len);
    void handleWebSocketConnect(AsyncWebSocketClient* client);
    void handleWebSocketDisconnect(AsyncWebSocketClient* client);
    void handleWebSocketData(void* arg, uint8_t* data, size_t len);
    void handleWebSocketError(AsyncWebSocketClient* client, void* arg);
    void processWebSocketMessage(const JsonDocument& doc);

    // Webserver-Setup
    void setupWebServer();
    void setupAPIRoutes();
    void setupStaticRoutes();
    
    // API-Handler
    void handleAPIRequest(AsyncWebServerRequest* request, Config::MessageType commandType);
    void handleTrainingRequest(AsyncWebServerRequest* request);
    void handleStatusRequest(AsyncWebServerRequest* request);
    void handleConfigRequest(AsyncWebServerRequest* request);
    
    // UDP-Handler
    void handleUDPPacket(AsyncUDPPacket& packet);
    void processMessage(const Message& msg);
    
    // Client-Verwaltung
    void updateClientStatus(uint8_t clientId, const IPAddress& ip);
    void removeInactiveClients();
    void broadcastClientStatus();
    
    // Training-Verwaltung
    void startTraining(uint8_t clientId, const TrainingModes::TrainingConfig& config);
    void stopTraining(uint8_t clientId);
    void updateTrainingStatus(uint8_t clientId, const TrainingModes::TrainingResult& result);
    
    // Hilfsmethoden
    void sendPacketToClient(uint8_t* packet, size_t packetSize, uint8_t clientId);
    String getClientListJson();
    String getTrainingStatusJson(uint8_t clientId);
    
    // Task-Handler
    static void heartbeatTask(void* parameter);
    static void messageProcessorTask(void* parameter);
    static void statusBroadcastTask(void* parameter);
    static void trainingMonitorTask(void* parameter);
};