// config.h
#pragma once

#include <Arduino.h>
#include <array>
#include <string_view>

namespace Config {
    // Version information
    constexpr char VERSION[] = "1.0.0";
    
    // Security Configuration
    namespace Security {
        constexpr uint16_t MIN_PASSWORD_LENGTH = 12;
        constexpr char WIFI_SSID[] = "ESP32_LED_NET";
        // Use a strong password with at least 12 characters including special chars
        constexpr char WIFI_PASSWORD[] = "ESP32_Secure_LED_2024!";
        constexpr char API_USERNAME[] = "admin";
        constexpr char API_PASSWORD[] = "Secure_Admin_Pass_2024!";
        constexpr uint32_t SESSION_TIMEOUT = 3600;    // seconds
        constexpr uint32_t MAX_LOGIN_ATTEMPTS = 3;
        constexpr uint32_t LOCKOUT_DURATION = 300;    // seconds
        
        // JWT Configuration
        constexpr char JWT_SECRET[] = "your-secure-jwt-secret-key-2024";
        constexpr uint32_t JWT_EXPIRY = 3600;         // seconds
    }
    
    // Network Configuration
    namespace Network {
        constexpr uint8_t WIFI_CHANNEL = 6;           // Less crowded channel
        constexpr uint8_t MAX_CLIENTS = 32;           // Reduced for better performance
        constexpr uint8_t HOST_ID = 1;
        constexpr uint16_t UDP_PORT = 4210;
        constexpr uint16_t UDP_BUFFER_SIZE = 256;
        constexpr uint16_t WEB_SERVER_PORT = 80;
        constexpr uint8_t MAX_WEBSOCKET_CLIENTS = 8;
        constexpr uint32_t WEBSOCKET_PING_INTERVAL = 5000;  // ms
        constexpr uint32_t UDP_TIMEOUT = 1000;        // ms
        
        // IP Configuration
        constexpr char AP_IP[] = "192.168.4.1";
        constexpr char AP_SUBNET[] = "255.255.255.0";
        constexpr uint32_t DNS_PORT = 53;
    }
    
    // Hardware Configuration
    namespace Hardware {
        // LED Matrix
        constexpr uint8_t LED_PIN = 5;
        constexpr uint8_t LED_MATRIX_WIDTH = 8;
        constexpr uint8_t LED_MATRIX_HEIGHT = 8;
        constexpr uint16_t NUM_LEDS = LED_MATRIX_WIDTH * LED_MATRIX_HEIGHT;
        constexpr uint8_t DEFAULT_BRIGHTNESS = 50;
        constexpr uint8_t MAX_BRIGHTNESS = 255;
        
        // Buzzer
        constexpr uint8_t BUZZER_PIN = 18;
        constexpr uint8_t BUZZER_CHANNEL = 0;
        constexpr uint16_t MIN_FREQUENCY = 20;
        constexpr uint16_t MAX_FREQUENCY = 20000;
        constexpr uint16_t MAX_TONE_DURATION = 5000;  // ms
        
        // Other Hardware
        constexpr uint8_t STATUS_LED_PIN = 2;
        constexpr uint32_t BUTTON_DEBOUNCE_TIME = 50; // ms
    }
    
    // Task Configuration
    namespace Tasks {
        constexpr uint32_t STACK_SIZE = 8192;         // Increased stack size
        constexpr uint8_t PRIORITY_HIGH = 2;
        constexpr uint8_t PRIORITY_MEDIUM = 1;
        constexpr uint8_t PRIORITY_LOW = 0;
        constexpr uint32_t HEARTBEAT_INTERVAL = 2000;      // ms
        constexpr uint32_t CLIENT_TIMEOUT = 10000;         // ms
        constexpr uint32_t WIFI_RECONNECT_INTERVAL = 5000; // ms
        constexpr uint32_t WATCHDOG_TIMEOUT = 30000;       // ms
    }
    
    // Effect Configuration
    namespace Effects {
        constexpr uint16_t DEFAULT_ANIMATION_SPEED = 50;   // ms
        constexpr uint8_t MAX_BRIGHTNESS_STEP = 5;
        constexpr uint8_t COLOR_WHEEL_STEPS = 255;
        constexpr uint8_t MAX_EFFECTS = 8;
        
        enum class Type : uint8_t {
            SOLID = 0,
            RAINBOW = 1,
            FADE = 2,
            SPARKLE = 3,
            WAVE = 4,
            FIRE = 5,
            MATRIX = 6,
            SPECTRUM = 7
        };
    }
    
    // Message Types
    enum class MessageType : uint8_t {
        HEARTBEAT = 0x01,
        LED_COMMAND = 0x02,
        BUZZER_COMMAND = 0x03,
        EFFECT_COMMAND = 0x04,
        STATUS_REQUEST = 0x05,
        CONFIG_UPDATE = 0x06,
        ERROR_REPORT = 0x07,
        BROADCAST = 0xFF
    };
}

// Error handling
namespace Error {
    enum class Code : uint8_t {
        NONE = 0,
        WIFI_CONNECTION_FAILED = 1,
        UDP_INIT_FAILED = 2,
        WEBSOCKET_ERROR = 3,
        INVALID_MESSAGE = 4,
        HARDWARE_ERROR = 5,
        AUTHENTICATION_FAILED = 6,
        MEMORY_ERROR = 7,
        TASK_CREATE_FAILED = 8
    };
    
    struct ErrorInfo {
        Code code;
        const char* message;
        uint32_t timestamp;
    };
}