# bruceNrfChat

**A text chat application for ESP32-S3 and LilyGO T-Embed devices using nRF24L01+ modules and Bruce firmware.**

---

## 📖 Table of Contents

- [About the Project](#about-the-project)
- [Features](#features)
- [Supported Devices](#supported-devices)
- [Requirements](#requirements)
- [Installation and Setup](#installation-and-setup)
  - [1. Prepare Your Device](#1-prepare-your-device)
  - [2. Copy the Script](#2-copy-the-script)
  - [3. Configure nRF24 Pins (if needed)](#3-configure-nrf24-pins-if-needed)
  - [4. Run the Script](#4-run-the-script)
- [How to Use](#how-to-use)
  - [Roles: Initiator and Responder](#roles-initiator-and-responder)
  - [Virtual Keyboard Controls](#virtual-keyboard-controls)
  - [Chat Mode](#chat-mode)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

---

## 🧠 About the Project

**bruceNrfChat** is a lightweight, real‑time text messaging application designed for ESP32‑S3 devices running the **Bruce** firmware. It uses **nRF24L01+** radio modules to establish a direct wireless link between two devices, allowing them to exchange messages without Wi‑Fi, Bluetooth, or the Internet.

The project was created as a practical demonstration of:

- **nRF24L01+ communication** with the BruceJS API.
- **Virtual keyboard** implementation on a small TFT display.
- **Peer‑to‑peer messaging** with role‑based addressing (Initiator / Responder).

All logic is written in pure JavaScript and runs directly from an SD card – no firmware recompilation is required.

---

## ✨ Features

- **Real‑time text messaging** between two devices.
- **Virtual QWERTY keyboard** with navigation via physical buttons.
- **Role‑based communication** (Initiator sends first, Responder listens and replies).
- **Automatic channel and data rate configuration** for optimal range.
- **Pre‑defined keyboard layout** with letters, numbers, punctuation, and control keys (SPACE, BACK, CLEAR, SEND).
- **Two dedicated script versions**:
  - `bruceNrfChat_smoochiee.js` – for Smoochiee V2 (with standard pinout).
  - `bruceNrfChat_t-embed.js` – for LilyGO T‑Embed CC1101.
- **No extra hardware** – uses the same nRF24 modules you already have.
- **Portable** – runs from an SD card; no need to reflash the device.

---

## 🧩 Supported Devices

| Device | Script File | Notes |
|--------|-------------|-------|
| **Smoochiee V2** | `bruceNrfChat_smoochiee.js` | Official Bruce reference board with ESP32‑S3 and ST7789 display. |
| **LilyGO T‑Embed CC1101** | `bruceNrfChat_t-embed.js` | Popular board with built‑in CC1101; nRF24 connected via SPI. |

> If you have a different ESP32‑S3 board, you can easily adapt the script by changing the `nrfCE`, `nrfCSN`, and button pin definitions at the top of the file.

---

## ⚙️ Requirements

- **Bruce firmware** (version 1.15 or newer) installed on both devices.
- **nRF24L01+ module** (with or without PA/LNA) connected to each device.
- **SD card** (any size, formatted as FAT32) to store the script.
- **A second device** (another ESP32‑S3 running the same script) to exchange messages.

---

## 🚀 Installation and Setup

### 1. Prepare Your Device

Make sure your device is running **Bruce firmware** and that the **nRF24L01+ module** is correctly connected. If you are using a custom pinout, ensure that the pins are properly defined in your `brucePins.conf` file (or adjust the script directly).

### 2. Copy the Script

- Download the appropriate script file for your device:
  - `bruceNrfChat_smoochiee.js` for Smoochiee V2.
  - `bruceNrfChat_t-embed.js` for LilyGO T‑Embed.
- Copy the script file to the **root directory** of your SD card.
- Insert the SD card into your device.

### 3. Configure nRF24 Pins (if needed)

The scripts are pre‑configured with the standard pinout for each device. If you are using a different wiring, edit the following variables at the top of the script:

```javascript
var nrfCE   = 9;   // Chip Enable
var nrfCSN  = 8;   // Chip Select
var nrfSCK  = 14;  // SPI Clock
var nrfMOSI = 13;  // SPI Master Out Slave In
var nrfMISO = 12;  // SPI Master In Slave Out
```

Adjust these values to match your physical connections.

### 4. Run the Script

1. On your device, open the Bruce menu.
2. Navigate to **Scripts** → select your script file.
3. The application will start and display the virtual keyboard.

---

## 🎮 How to Use

### Roles: Initiator and Responder

To establish a connection, one device must act as the **Initiator (Alice)** and the other as the **Responder (Bob)**.

- **To start as Responder (Bob):** Press and hold the **UP** button while the script is starting (during the splash screen). The device will wait for an incoming message.
- **To start as Initiator (Alice):** Just run the script normally (without holding UP). This device will send the first message.

> 💡 The role assignment is shown in the top‑left corner of the display.

### Virtual Keyboard Controls

Use the physical buttons to navigate and type:

| Button | Function |
|--------|----------|
| **UP / DOWN** | Move vertically through the keyboard rows. |
| **LEFT / RIGHT** | Move horizontally through the keyboard columns. |
| **SELECT** | Select the highlighted key. |
| **BACK** | In keyboard mode – send the current message and switch to chat view. In chat view – return to keyboard. |

**Special keys on the keyboard:**
- `SPACE` – adds a space.
- `BACK` – deletes the last character.
- `CLEAR` – clears the entire text.
- `SEND` – sends the typed message and switches to chat mode.

### Chat Mode

After sending a message, the display switches to **Chat Mode**, showing:

- Your outgoing message.
- Any incoming message from the other device.
- Instructions to return to the keyboard.

To go back and type another message, press **SELECT** or **BACK**.

---

## 🛠️ Troubleshooting

| Issue | Possible Solution |
|-------|-------------------|
| **"NRF24 not configured"** error | Check that the nRF24 pins are correctly defined in the script or in `brucePins.conf`. |
| **No messages received** | Ensure both devices are on the same RF channel (default is 100) and data rate (250kbps). Make sure the nRF24 modules are powered and within range. |
| **Display shows garbage** | Verify that the display driver (ST7789) is correctly initialized by Bruce. Try a different script version. |
| **Buttons not responding** | Double‑check the button pin definitions at the top of the script. They may differ between Smoochiee and T‑Embed. |
| **Script fails to start** | Ensure the script is saved with **Unix (LF) line endings** and that the file name ends with `.js`. |

---

## 🤝 Contributing

Contributions are welcome! If you have an idea, a bug fix, or a new feature:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a Pull Request.

Please make sure your code follows the existing style and includes appropriate comments.

---

## 📜 License

This project is licensed under the **MIT License** – see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- The **Bruce firmware** team for creating an amazing platform for ESP32 experimentation.
- The **nRF24L01+** community for providing reliable and affordable wireless modules.
- All beta testers who helped debug the application.

---

**Built with ❤️ by the bruceNrfChat community.**
