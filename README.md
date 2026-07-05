# bruceNrfChat 🔐

**Encrypted P2P Chat for ESP32‑S3**  
Uses nRF24L01+ radios, Bruce firmware, and Diffie‑Hellman key exchange.

---

## Overview

`bruceNrfChat` is a real‑time encrypted messaging application for two ESP32‑S3 devices running [Bruce firmware](https://bruce.computer). It establishes a direct radio link using nRF24L01+ modules, enabling secure communication without Wi‑Fi, Bluetooth, the Internet, or any central server.

This project runs entirely from an SD card – no firmware recompilation is required. Just copy the JavaScript file, insert the card, and start chatting.

---

## Features (v1.2.1)

- **🔐 End‑to‑end encryption** – Diffie‑Hellman key exchange + XOR cipher (lightweight, demonstration‑grade).
- **🔍 Device Discovery** – automatically finds other devices running the same application.
- **🤝 Connection Requests** – select a device and send a chat invitation; the recipient can accept or reject.
- **⌨️ Virtual Keyboard** – full QWERTY layout with navigation via physical buttons.
- **💬 Chat History** – messages are saved to SD card (`/chat_log.txt`) and can be viewed by holding **BACK** for 2 seconds.
- **✍️ Typing Indicator** – shows when the other device is composing a message.
- **✅ Delivery Confirmation (ACK)** – messages display `...` until delivered, then change to `✓`.
- **🔄 Duplicate Protection** – automatically ignores duplicate messages.
- **⏱️ Timeouts & Reliability** – DH handshake timeout, connection loss detection, and automatic return to Discovery mode.
- **📡 Off‑grid operation** – pure 2.4 GHz radio, no external infrastructure needed.
- **📦 Portable** – runs from SD card; no firmware rebuilding required.
- **🧩 Modular** – easily adaptable to any ESP32‑S3 board – just edit the pin definitions.

---

## Supported Hardware

| Device / Board | Script File |
|----------------|-------------|
| **Smoochiee V2** | `bruceNrfChat_smoochiee.js` |
| **LilyGO T‑Embed CC1101** | `bruceNrfChat_t-embed.js` |
| **M5Stack Cardputer** | `bruceNrfChat_cardputer.js` |
| **M5StickC Plus2** | `bruceNrfChat_stickcplus2.js` |
| **LilyGO T‑Display S3** | `bruceNrfChat_tdisplay-s3.js` |
| **CYD‑2432S028** | `bruceNrfChat_cyd.js` |
| **Custom ESP32‑S3** | `bruceNrfChat_ESP32-generic.js` (edit pins at the top) |

> All scripts share the same logic – only pin definitions differ.

---

## Requirements

- **Two ESP32‑S3 devices** (or compatible boards) with Bruce firmware **v1.15 or newer**.
- **Two nRF24L01+ modules** (PA/LNA recommended for extended range).
- **Two SD cards** (FAT32) – one per device.
- **Physical buttons** for navigation (wired according to your board's pinout).
- **Optional:** USB keyboard for text entry (USB‑host capable boards).

---

## Installation & Setup

### 1. Prepare Your Hardware
- Flash Bruce firmware (v1.15+) on both devices.
- Wire the nRF24 module to the SPI pins (defaults are listed in each script).
- Add **100 µF electrolytic capacitors** near the nRF24 modules to prevent voltage drops.

### 2. Choose & Copy the Script
- Download the correct script for your board from the [Releases](https://github.com/am1s3/bruceNrfChat/releases) page.
- For custom boards, edit the pin definitions at the top of `bruceNrfChat_ESP32-generic.js`.
- Copy the `.js` file to the **root directory** of the SD card.

### 3. Run the Script
- Insert the SD card, open Bruce menu → **Scripts** → select the file.
- On **one** device, **press and hold UP** during startup – it becomes the **Responder**.
- On the **other**, start normally – it becomes the **Initiator**.

The devices will automatically perform a Diffie‑Hellman key exchange and enter chat mode.

---

## Usage Guide

### Discovery Mode
- The script starts in **Discovery Mode** and automatically scans for other devices.
- Found devices are shown in a list with their unique IDs.
- Use **UP / DOWN** to select a device, press **SELECT** to send a connection request.

### Connection Request
- The recipient sees a prompt: `"User X wants to chat. Accept? [SELECT=YES / BACK=NO]"`.
- If accepted, both devices perform a DH key exchange and switch to **Chat Mode**.
- If rejected, the initiator is notified, and both return to Discovery.

### Chat Mode
- Virtual keyboard with letters, numbers, punctuation, and control keys.
- **UP / DOWN / LEFT / RIGHT** – navigate the keyboard.
- **SELECT** – select a character or send the message.
- **BACK** – in keyboard mode: send the current message and switch to chat view; in chat view: return to the keyboard.
- Special keys: `SPACE`, `BACK`, `CLEAR`, `SEND`.

### Chat History
- **View history:** press and hold **BACK** for 2 seconds.
- The last 50 messages are displayed.
- Press **SELECT** or **BACK** to return.

---

## Security Model

`bruceNrfChat` uses a **two‑stage cryptographic process**:

1. **Diffie‑Hellman key exchange** – a secure public‑key protocol allowing both devices to independently compute a shared secret without transmitting it over the air.
2. **XOR encryption** – each message is XOR‑encrypted using the shared secret (cyclic repetition).

> ⚠️ **Important:** XOR is a demonstration‑grade cipher. It protects against casual eavesdropping but is not cryptographically secure against determined adversaries. For production‑grade security, consider replacing with AES‑128 (planned for a future release).

---

## Customising Pin Assignments

For custom wiring, edit the following variables at the top of `bruceNrfChat_ESP32-generic.js`:

```javascript
var nrfCE   = 9;
var nrfCSN  = 8;
var nrfSCK  = 14;
var nrfMOSI = 13;
var nrfMISO = 12;

var btnUP     = 5;
var btnDOWN   = 39;
var btnLEFT   = 40;
var btnRIGHT  = 41;
var btnSELECT = 16;
var btnBACK   = 42;
```

Set these values to match your actual GPIO connections, save the file, and run the script as usual.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| **"NRF24 init failed"** | Check wiring and power; add capacitors near the nRF24 module. |
| **No devices found** | Ensure both devices are on the same channel (default 100) and within range. |
| **DH timeout** | Move devices closer or reduce interference; try again. |
| **Messages not received** | Verify antennas are connected; check signal strength. |
| **History not saving** | Ensure SD card is present, formatted as FAT32, and writable. |
| **Connection lost** | The script will automatically return to Discovery mode after 5 seconds of inactivity. |

---

## Contributing

Contributions are welcome! To propose improvements or bug fixes:

1. Fork this repository.
2. Create a new feature branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -m 'Add your feature'`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a Pull Request.

Please follow the existing code style and include appropriate documentation.

---

## License

This project is distributed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- The [Bruce firmware](https://bruce.computer) team for their outstanding platform.
- The open‑source community for nRF24L01+ support and inspiration.
- All contributors and testers who helped refine this project.

---

**Maintained by [am1s3](https://github.com/am1s3).**  
**Developed with 🔐 and 💻 for the Bruce community.**