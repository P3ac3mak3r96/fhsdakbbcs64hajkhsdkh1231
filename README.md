# fhsdakbbcs64hajkhsdkh1231

ESP32-basiertes LED-Matrix Zielsystem für Schießtraining.

## Features
- 8x8 LED Matrix Visualisierung
- Mehrere Trainingsmodi 
- Web-Interface zur Steuerung
- Mehrsprachenunterstützung (DE, EN, FR)
- WiFi-basierte Host-Client Architektur
- Real-time Status Updates über WebSocket
- Verschiedene LED-Effekte und Muster

## Hardware-Anforderungen
- ESP32 Development Board
- WS2812B 8x8 LED Matrix
- Buzzer (optional)
- Stromversorgung 5V/2A

## Software-Voraussetzungen
- PlatformIO
- Visual Studio Code
- Web Browser (für Interface)

## Projektstruktur
```
esp32-pistol-target/
├── include/                 # Header-Dateien
│   ├── config.h            # Konfiguration
│   ├── ErrorHandling.h     # Fehlerbehandlung
│   ├── LEDMatrixHost.h     # Host-Klasse Header
│   └── TrainingModes.h     # Trainingsmodi
├── src/                    # Quellcode
│   ├── LEDMatrixHost.cpp   # Host-Implementierung
│   └── main.cpp            # Hauptprogramm
├── data/                   # Web Interface Dateien
│   ├── css/
│   ├── js/
│   ├── lang/
│   └── index.html
└── platformio.ini          # PlatformIO Konfiguration
```

## Installation & Setup

1. Repository klonen:
```bash
git clone https://github.com/P3ac3mak3r96/fhsdakbbcs64hajkhsdkh1231.git
cd fhsdakbbcs64hajkhsdkh1231
```

2. In VS Code mit PlatformIO öffnen
3. Abhängigkeiten installieren
4. Kompilieren und auf ESP32 hochladen

## Verwendung

1. ESP32 mit Stromversorgung verbinden
2. Mit dem WiFi-Netzwerk "ESP32_LED_NET" verbinden
   - Standard-Passwort: "ESP32_Secure_LED_2024!"
3. Web-Interface über Browser aufrufen:
   - URL: http://192.168.4.1
   - Standard Login: admin/Secure_Admin_Pass_2024!

## Training Modi

- Basis-Training
- Reaktions-Training
- Farb-kodiertes Training
- Bewegliche Ziele
- Stress-Training
- Zeit-Training
- und mehr...

## Entwicklung

- IDE: VS Code mit PlatformIO
- Framework: Arduino für ESP32
- Sprache: C++
- Web: HTML5, CSS3, JavaScript

## Lizenz

[Ihre gewählte Lizenz]

## Mitwirkende

- [Ihr Name/Username]
