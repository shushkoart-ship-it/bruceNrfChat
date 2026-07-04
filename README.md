# bruceNrfChat 🔐

**Encrypted text chat for ESP32‑S3 devices**  
Using nRF24L01+ radios, Bruce firmware, and Diffie‑Hellman key exchange.

---

## ✨ What makes it special?

- 🔐 **End‑to‑end encryption** – Diffie‑Hellman + XOR (no plaintext over the air).  
- 🎮 **Full‑screen virtual keyboard** – type messages with physical buttons.  
- 📡 **No Wi‑Fi, no Internet** – pure radio communication up to ~100 m (with PA/LNA).  
- 🧩 **Works on multiple boards** – Smoochiee V2, LilyGO T‑Embed, and any ESP32‑S3 with nRF24.  
- ⚡ **Instant startup** – runs from SD card, no firmware rebuild needed.

---

## 🧠 How it works (in 30 seconds)

1. **Both devices** generate a random private key and a public key.
2. **They exchange public keys** via nRF24.
3. **Each computes a shared secret** using Diffie‑Hellman.
4. **All messages** are XOR‑encrypted with that secret.
5. **Nobody else** can decrypt the traffic – even if they capture every byte.

```
[Alice]                [Bob]
   |                      |
   |  Public key A        |
   |--------------------->|
   |                      |
   |  Public key B        |
   |<---------------------|
   |                      |
   |  Shared secret S     |
   |  (computed locally)  |
   |                      |
   |  Encrypted message   |
   |--------------------->|
   |                      |
   |  Decrypted message   |
   |                      |
```

> The encryption is lightweight (XOR) – perfect for ESP32. For stronger security, we’ll add AES in a future release.

---

## 🖥️ What you see on the display

### Virtual keyboard
```
Chat (Initiator)
Text: Hello_
[1][2][3][4][5][6][7][8][9][0]
 Q W E R T Y U I O P
 A S D F G H J K L ;
 Z X C V B N M , . ?
[SPACE][BACK][CLEAR][SEND]
Keys: UP/DOWN/LEFT/RIGHT | SELECT=choose | BACK=exit
```

### Chat mode
```
Chat (Initiator)
----------------
You: Hello, how are you?
Other: I'm fine, thanks!
----------------
Press SELECT to return to keyboard
```

---

## 🚀 Real‑world use cases

- **Secure messaging between two friends** – no cellular, no Wi‑Fi needed.
- **Field communication** for events, camps, or remote areas.
- **Educational demo** of Diffie‑Hellman and encryption on embedded systems.
- **Backup channel** when normal networks are down.

---

## 📦 What you need

- 2x ESP32‑S3 devices (any board with Bruce firmware)
- 2x nRF24L01+ modules (PA/LNA recommended for longer range)
- 2x SD cards (FAT32)
- A few wires and buttons (or a board with built‑in buttons)

---

## 🛠️ Setup in 3 steps

### 1. Flash Bruce
Install Bruce firmware (v1.15+) on both devices via Web Flasher or `esptool`.

### 2. Wire nRF24
Connect nRF24 to your ESP32‑S3:

| nRF24 pin | ESP32‑S3 (default) |
|-----------|-------------------|
| VCC       | 3.3V              |
| GND       | GND               |
| CE        | GPIO 9            |
| CSN       | GPIO 8            |
| SCK       | GPIO 14           |
| MOSI      | GPIO 13           |
| MISO      | GPIO 12           |

*If your board differs, edit the pin numbers in the script.*

### 3. Run the script
- Copy `bruceNrfChat_smoochiee.js` (or `_t-embed.js`) to SD card root.
- Insert SD card, open Bruce menu → **Scripts** → select the file.
- On **one** device, hold **UP** during startup – it becomes the **Responder**.
- On the **other**, start normally – it becomes the **Initiator**.

That’s it! Start typing and send your first encrypted message.

---

## 🎮 Controls

| Button | Action |
|--------|--------|
| **UP** / **DOWN** | Navigate keyboard rows |
| **LEFT** / **RIGHT** | Navigate columns |
| **SELECT** | Pick a character / send message |
| **BACK** | Send current message & switch to chat |

---

## 🧩 Supported Devices

bruceNrfChat provides ready‑to‑run scripts for the following devices:

| Device | Script File |
|--------|-------------|
| **Smoochiee V2** | `bruceNrfChat_smoochiee.js` |
| **LilyGO T‑Embed CC1101** | `bruceNrfChat_t-embed.js` |
| **M5Stack Cardputer** | `bruceNrfChat_cardputer.js` |
| **M5StickC Plus2** | `bruceNrfChat_stickcplus2.js` |
| **LilyGO T‑Display S3** | `bruceNrfChat_tdisplay-s3.js` |
| **CYD‑2432S028** | `bruceNrfChat_cyd.js` |

For other boards, simply change the `nrfCE`, `nrfCSN`, and button pin numbers at the top of the script.

---

## 🛡️ Security note

The current encryption uses **XOR + Diffie‑Hellman**. It is **demonstration‑grade** – it prevents casual sniffing but is not resistant to advanced cryptanalysis. A future update will replace XOR with **AES‑128** for better protection.

---

## 📈 Future plans

- ✅ Diffie‑Hellman key exchange  
- ✅ XOR encryption  
- 🔜 AES‑128 encryption (with a tiny library)  
- 🔜 Save chat history to SD card  
- 🔜 Support for CC1101 (sub‑GHz) as an alternative  

---

## 🤝 Contribute

We welcome contributions! Fork the repo, create a branch, and send a Pull Request.

---

## 📜 License

MIT – see [LICENSE](LICENSE) for details.

---

## 🙏 Thanks

- [Bruce firmware](https://bruce.computer) – the soul of this project.
- nRF24 community – for keeping the radio alive.
- You – for building your own secure chat!

---

**Made with 💙 by the bruceNrfChat community.**
