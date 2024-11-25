#include <Arduino.h>
#include "LEDMatrixHost.h"

LEDMatrixHost* host = nullptr;

void setup() {
    // Initialize Serial for debugging
    Serial.begin(115200);
    Serial.println("\nInitializing ESP32 LED Matrix Host System...");
    
    // Create host instance
    host = new LEDMatrixHost();
    
    // Initialize host
    if (!host->begin()) {
        Serial.println("Host initialization failed!");
        ESP.restart();  // Restart on initialization failure
    }
    
    Serial.println("Host initialized successfully!");
}

void loop() {
    // Main loop
    if (host) {
        host->loop();
    }
    
    // Small delay to prevent watchdog issues
    vTaskDelay(pdMS_TO_TICKS(10));
}