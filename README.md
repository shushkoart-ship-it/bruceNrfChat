<img width="1814" height="867" alt="image4" src="https://github.com/user-attachments/assets/5b24d186-cbd6-49b6-9bb6-32bb5f8498be" />

# bruceNrfChat v1.2.0 🔐

**Encrypted peer‑to‑peer chat with device discovery and connection requests.**

---

## Overview

`bruceNrfChat` is a real‑time chat application for ESP32‑S3 devices running [Bruce firmware](https://bruce.computer). It uses nRF24L01+ radios to create a direct, encrypted link between two devices – without Wi‑Fi, Bluetooth, or the Internet.

**New in v2.0:** automatic device discovery, connection requests, and dynamic pairing.

---

## Features

- **Discovery mode** – automatically finds other devices running the same application.
- **Connection request** – select a device from the list; the other user receives a prompt to accept or reject the chat.
- **Diffie‑Hellman key exchange** – secure shared secret.
- **XOR encryption** – lightweight message encryption (demonstration‑grade).
- **Chat history** – stored on SD card (`/chat_log.txt`).
- **Typing indicator** – shows when the other side is composing a message.
- **Delivery confirmation (ACK)** – messages display ✓ when delivered.

---

## Supported Devices

| Device |
|--------|
| Smoochiee V2 |
| LilyGO T‑Embed CC1101 |
| M5Stack Cardputer |
| M5StickC Plus2 |
| LilyGO T‑Display S3 |
| CYD‑2432S028 |
| Custom ESP32‑S3 |

All devices now use the **same unified script** – just change the pin definitions at the beginning.

---

## Installation & Setup

1. Flash Bruce firmware (v1.15+) on both devices.
2. Wire nRF24 modules according to your pinout.
3. Open `bruceNrfChat_v2.js`, adjust the pin definitions at the top.
4. Copy the script to the root of an SD card (FAT32).
5. Insert the SD card, run from Bruce menu → Scripts.

---

## Usage

### Discovery Mode
- The script starts in discovery mode and automatically scans for other devices.
- Found devices are shown in a list.
- Use **UP/DOWN** to select a device, press **SELECT** to send a connection request.

### Connection Request
- The selected device receives a prompt: *"User X wants to chat. Accept? [SELECT=YES / BACK=NO]"*.
- Upon acceptance, both devices perform a DH key exchange and enter chat mode.

### Chat Mode
- Virtual keyboard with letters, numbers, space, backspace, clear, send.
- Press **BACK** to send message and switch to chat view.
- Press and hold **BACK** for 2 seconds to view chat history.
- Sent messages show `...` until acknowledged, then `✓`.

---

## Troubleshooting

- **Device not found** – ensure both devices are on the same channel (default 100) and within range.
- **Request ignored** – check that the other device is not already in a chat session.
- **History not saving** – verify SD card is present and writable.

---

## License

MIT – see [LICENSE](LICENSE).

---

**Developed with ❤️ for the Bruce community.**
