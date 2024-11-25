#pragma once

#include <Arduino.h>
#include <string>

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
        TASK_CREATE_FAILED = 8,
        TRAINING_ERROR = 9,
        COMMUNICATION_ERROR = 10
    };
    
    struct ErrorInfo {
        Code code;
        std::string message;
        uint32_t timestamp;
        uint8_t clientId;
        
        ErrorInfo(Code c, const std::string& msg, uint8_t id = 0)
            : code(c)
            , message(msg)
            , timestamp(millis())
            , clientId(id) {}
    };
    
    class ErrorHandler {
    public:
        static void logError(Code code, const std::string& message, uint8_t clientId = 0);
        static void clearErrors();
        static const std::vector<ErrorInfo>& getErrorLog();
        static String getErrorJson();
        
    private:
        static std::vector<ErrorInfo> errorLog;
        static const size_t MAX_LOG_SIZE = 100;
    };
}