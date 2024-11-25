#pragma once

#include <Arduino.h>
#include <array>

namespace TrainingModes {
    enum class Mode : uint8_t {
        BASIC_TRAINING = 0,         // Statisches Zielschießen
        REACTION_TRAINING = 1,      // Zufälliges Zielschießen
        COLOR_CODED = 2,           // Farb- und Sound-Reaktionsmodus
        MOVING_TARGET = 3,         // Bewegliches Ziel
        STRESS_TRAINING = 4,       // Ablenkungsmodus
        TIMED_TRAINING = 5,        // Zeitlimitmodus
        ENDURANCE = 6,             // Ausdauer- und Präzisionsmodus
        TEAM_TRAINING = 7,         // Kooperatives Schießen
        COMPETITION = 8,           // Wettkampfmodus
        SKILL_FOCUS = 9,          // Fokusmodus
        ADRENALINE = 10,          // Stresssimulationsmodus
        NIGHT_VISION = 11,        // Dunkelheitsmodus
        DISTANCE = 12,            // Distanzmodus
        MULTI_TARGET = 13,        // Mehrfachzielmodus
        HOSTAGE_RESCUE = 14       // Szenarienmodus
    };

    enum class Difficulty : uint8_t {
        EASY = 0,
        MEDIUM = 1,
        HARD = 2
    };

    struct TrainingConfig {
        Mode mode;
        Difficulty difficulty;
        uint16_t duration;           // Dauer in Sekunden
        uint16_t targetCount;        // Anzahl der Ziele
        uint16_t reactTime;          // Reaktionszeit in Millisekunden
        uint16_t targetSize;         // Größe der Ziele (1-64 LEDs)
        bool soundEnabled;           // Ton aktiviert
        bool stressorsEnabled;       // Stressfaktoren aktiviert
        uint8_t brightness;          // LED-Helligkeit (0-255)
        
        // Spezifische Konfigurationen für verschiedene Modi
        struct {
            uint8_t movementSpeed;   // Geschwindigkeit beweglicher Ziele
            uint8_t distractionLevel;// Intensität der Ablenkungen
            bool teamMode;           // Team-Modus aktiviert
            uint8_t targetPattern;   // Muster der Zielanordnung
        } modeConfig;
    };

    struct TrainingResult {
        uint16_t hits;              // Anzahl der Treffer
        uint16_t misses;            // Anzahl der Fehlschüsse
        uint32_t totalTime;         // Gesamtzeit in Millisekunden
        uint16_t avgReactionTime;   // Durchschnittliche Reaktionszeit
        uint32_t score;             // Gesamtpunktzahl
        std::array<uint16_t, 8> roundScores; // Punktzahlen pro Runde
    };

    class TrainingManager {
    public:
        static TrainingConfig getDefaultConfig(Mode mode, Difficulty diff);
        static uint32_t calculateScore(const TrainingResult& result);
        static String getConfigJson(const TrainingConfig& config);
        static String getResultJson(const TrainingResult& result);
    };
}