# bruceNrfChat

**A text chat application for ESP32-S3 devices using nRF24L01+ modules and Bruce firmware.**

---

## About

bruceNrfChat is a lightweight, real‑time messaging tool that runs on ESP32‑S3 devices with the Bruce firmware. It uses nRF24L01+ radio modules to establish a direct wireless link between two devices, allowing them to exchange text messages without Wi‑Fi, Bluetooth, or the Internet.

The project is written in JavaScript and runs directly from an SD card – no firmware recompilation is needed.

---

## Features

- Real‑time text messaging between two devices.
- Virtual QWERTY keyboard with navigation via physical buttons.
- Two communication roles: **Initiator** (sends first) and **Responder** (waits and replies).
- Automatic RF channel and data rate configuration for optimal range.
- Pre‑defined keyboard layout with letters, numbers, punctuation, and control keys (SPACE, BACK, CLEAR, SEND).
- Ready‑to‑use scripts for two popular boards (Smoochiee V2 and LilyGO T‑Embed CC1101).
- **Easily adaptable** to any ESP32‑S3 board – just adjust the pin definitions at the top of the script.

---

## Supported Devices (out‑of‑the‑box)

| Device | Script File |
|--------|-------------|
| **Smoochiee V2** | `bruceNrfChat_smoochiee.js` |
| **LilyGO T‑Embed CC1101** | `bruceNrfChat_t-embed.js` |

For other ESP32‑S3 boards, simply change the `nrfCE`, `nrfCSN`, and button pin numbers in the script – no other modifications are required.

---

## Requirements

- Bruce firmware (v1.15 or newer) on both devices.
- nRF24L01+ module (with or without PA/LNA) connected to each device.
- SD card (FAT32) to store the script.
- A second device to exchange messages.

---

## Installation and Setup

### 1. Prepare Your Device

Make sure your device runs Bruce firmware and that the nRF24 module is properly wired.

### 2. Copy the Script

- Download the script for your board:
  - `bruceNrfChat_smoochiee.js` for Smoochiee V2.
  - `bruceNrfChat_t-embed.js` for LilyGO T‑Embed.
- If you have a different board, use either script and edit the pin definitions at the top.
- Copy the script to the root directory of your SD card.
- Insert the SD card into the device.

### 3. Adjust Pins (if needed)

If your wiring differs from the default, open the script and modify these variables:

```javascript
var nrfCE   = 9;   // Chip Enable
var nrfCSN  = 8;   // Chip Select (CS)
var nrfSCK  = 14;  // SPI Clock
var nrfMOSI = 13;  // SPI Master Out Slave In
var nrfMISO = 12;  // SPI Master In Slave Out

// Button pins (adjust for your board)
var btnUP     = 5;
var btnDOWN   = 39;
var btnLEFT   = 40;
var btnRIGHT  = 41;
var btnSELECT = 16;
var btnBACK   = 42;
```

Save the file and re‑insert the SD card.

### 4. Run the Script

1. On your device, open the Bruce menu.
2. Navigate to **Scripts** → select your script file.
3. The virtual keyboard will appear.

---

## How to Use

### Roles: Initiator and Responder

One device must act as the **Initiator** (sends the first message), the other as the **Responder** (waits for a message).

- **To start as Responder:** Press and hold the **UP** button while the script is starting (during the splash screen). The device will wait for an incoming message.
- **To start as Initiator:** Run the script normally (without holding UP). This device will send the first message.

> The current role is displayed in the top‑left corner of the screen.

### Virtual Keyboard Controls

| Button | Action |
|--------|--------|
| **UP / DOWN** | Move vertically across keyboard rows. |
| **LEFT / RIGHT** | Move horizontally across columns. |
| **SELECT** | Select the highlighted key. |
| **BACK** | In keyboard mode – send the current message and switch to chat view. In chat view – return to the keyboard. |

**Special keys on the keyboard:**
- `SPACE` – add a space.
- `BACK` – delete the last character.
- `CLEAR` – clear the entire text.
- `SEND` – send the typed message and switch to chat mode.

### Chat Mode

After sending a message, the display switches to **Chat Mode**, showing:
- Your sent message.
- Any incoming message from the other device.
- Instructions to return to the keyboard.

Press **SELECT** or **BACK** to go back and type another message.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| **"NRF24 not configured"** error | Check your pin definitions in the script or `brucePins.conf`. |
| **No messages received** | Ensure both devices use the same channel (default 100) and data rate (250kbps). Verify power and range. |
| **Display shows garbage** | Confirm that the display driver (ST7789) is correctly initialized by Bruce. Try a different Bruce build. |
| **Buttons don't respond** | Double‑check button pin numbers in the script – they may differ between boards. |
| **Script doesn't start** | Make sure the file is saved with UTF‑8 encoding, Unix (LF) line endings, and `.js` extension. |

---

## Adapting to Other Boards

To use bruceNrfChat on a different ESP32‑S3 board:

1. Open the script file.
2. Change the `nrfCE`, `nrfCSN`, and button pins to match your wiring.
3. If your display resolution differs, you may also need to adjust the keyboard layout (optional).
4. Save and run – that's it.

No other code changes are needed.

---

## Contributing

Contributions are welcome! If you want to add a new feature, fix a bug, or improve documentation:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a Pull Request.

Please follow the existing code style and include relevant comments.

---

## License

This project is licensed under the **MIT License** – see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- The Bruce firmware team for creating an amazing platform.
- The nRF24L01+ community for reliable wireless modules.
- All testers and contributors.

---

**Built with ❤️ by the bruceNrfChat community.**
