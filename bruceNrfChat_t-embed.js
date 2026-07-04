var nrfCE   = 9;
var nrfCSN  = 8;
var nrfSCK  = 14;
var nrfMOSI = 13;
var nrfMISO = 12;

var btnUP     = 38;
var btnDOWN   = 39;
var btnLEFT   = 40;
var btnRIGHT  = 41;
var btnSELECT = 37;
var btnBACK   = 42;

var role = "initiator";
var text = "";
var receivedText = "";
var sharedSecret = 0;
var dhComplete = false;
var mode = "keyboard";
var history = [];
var maxHistory = 50;
var logFile = "/chat_log.txt";
var msgCounter = 0;
var lastTypingTime = 0;

var keyboardLayout = [
    ["1","2","3","4","5","6","7","8","9","0"],
    ["Q","W","E","R","T","Y","U","I","O","P"],
    ["A","S","D","F","G","H","J","K","L",";"],
    ["Z","X","C","V","B","N","M",",",".","?"],
    ["SPACE","BACK","CLEAR","SEND"]
];
var rows = 5;
var cols = 10;
var selectedRow = 0;
var selectedCol = 0;

var p = 2147483647;
var g = 5;
var privateKey = Math.floor(Math.random() * (p - 2)) + 2;
var publicKey = modPow(g, privateKey, p);

if (gpio.read(btnUP) == 0) { role = "responder"; }

nrf.init(nrfSCK, nrfMISO, nrfMOSI, nrfCSN, nrfCE);
nrf.setChannel(100);
nrf.setDataRate("250kbps");
nrf.setPower("max");
display.clear();

function modPow(base, exp, mod) {
    var result = 1;
    base = base % mod;
    while (exp > 0) {
        if (exp % 2 == 1) result = (result * base) % mod;
        exp = exp >> 1;
        base = (base * base) % mod;
    }
    return result;
}

function encryptDecrypt(msg, key) {
    var out = "";
    for (var i = 0; i < msg.length; i++) {
        out += String.fromCharCode(msg.charCodeAt(i) ^ key);
    }
    return out;
}

function saveHistory() {
    var log = "";
    for (var i = 0; i < history.length; i++) {
        var entry = history[i];
        log += (entry.role === "me" ? "Me" : "Other") + ": " + entry.text + (entry.delivered ? " ✓" : " ...") + "\n";
    }
    storage.write(logFile, log);
}

function addHistory(roleText, text, delivered) {
    history.push({role: roleText, text: text, delivered: delivered || false});
    if (history.length > maxHistory) history.shift();
    saveHistory();
}

function dhExchange() {
    display.println("DH: exchanging keys...");
    if (role == "initiator") {
        nrf.send(publicKey.toString());
        var received = nrf.receive();
        while (received == null || received == "") { delay(100); received = nrf.receive(); }
        var otherPublic = parseInt(received);
        sharedSecret = modPow(otherPublic, privateKey, p);
    } else {
        var received = nrf.receive();
        while (received == null || received == "") { delay(100); received = nrf.receive(); }
        var otherPublic = parseInt(received);
        nrf.send(publicKey.toString());
        sharedSecret = modPow(otherPublic, privateKey, p);
    }
    dhComplete = true;
    display.println("DH: secret established.");
    display.println("Secret: " + sharedSecret);
    delay(1000);
    display.clear();
}

function drawKeyboard() {
    display.clear();
    display.println("Chat (" + role + ")");
    display.println("Text: " + text + "_");
    display.println("");
    for (var r = 0; r < rows; r++) {
        var line = "";
        for (var c = 0; c < cols; c++) {
            if (r == selectedRow && c == selectedCol) line += "[" + keyboardLayout[r][c] + "]";
            else line += " " + keyboardLayout[r][c] + " ";
        }
        display.println(line);
    }
    if (receivedText != "") display.println("Last: " + receivedText);
    display.println("Keys: UP/DOWN/LEFT/RIGHT | SELECT=choose | BACK=send");
}

function drawChat() {
    display.clear();
    display.println("Chat (" + role + ")");
    display.println("----------------");
    display.println("You: " + text);
    if (receivedText != "") display.println("Other: " + receivedText);
    display.println("----------------");
    display.println("Press SELECT to send | BACK to keyboard");
}

function drawHistory() {
    display.clear();
    display.println("=== History ===");
    var start = Math.max(0, history.length - 6);
    for (var i = start; i < history.length; i++) {
        var entry = history[i];
        var prefix = (entry.role === "me") ? "Me" : "Other";
        var status = entry.delivered ? " ✓" : " ...";
        display.println(prefix + ": " + entry.text + status);
    }
    display.println("--- SELECT=back ---");
}

function sendMessage(msg) {
    if (!dhComplete) return;
    var encrypted = encryptDecrypt(msg, sharedSecret);
    var packet = "MSG:" + msgCounter + ":" + encrypted;
    nrf.send(packet);
    var ackReceived = false;
    var startTime = millis();
    while (millis() - startTime < 1000) {
        var incoming = nrf.receive();
        if (incoming != null && incoming != "") {
            if (incoming.indexOf("ACK:") == 0) {
                var ackId = parseInt(incoming.substring(4));
                if (ackId == msgCounter) {
                    ackReceived = true;
                    break;
                }
            }
        }
        delay(20);
    }
    if (history.length > 0) {
        var last = history[history.length - 1];
        if (last.role == "me" && last.text == msg) {
            last.delivered = ackReceived;
        }
    }
    saveHistory();
    msgCounter++;
}

display.println("Starting DH exchange...");
dhExchange();

if (storage.exists(logFile)) {
    var content = storage.read(logFile);
    var lines = content.split("\n");
    for (var i = 0; i < lines.length; i++) {
        if (lines[i].length > 0) {
            var parts = lines[i].split(": ");
            if (parts.length == 2) {
                var roleText = (parts[0] == "Me") ? "me" : "other";
                var text = parts[1].replace(" ✓", "").replace(" ...", "");
                var delivered = parts[1].indexOf("✓") > -1;
                history.push({role: roleText, text: text, delivered: delivered});
            }
        }
    }
}

drawKeyboard();

while (true) {
    if (mode == "keyboard") {
        if (gpio.read(btnUP) == 0) {
            selectedRow = (selectedRow - 1 + rows) % rows;
            if (selectedRow == rows - 1) selectedCol = 0;
            drawKeyboard();
            delay(200);
            if (millis() - lastTypingTime > 1000) {
                nrf.send("TYP");
                lastTypingTime = millis();
            }
        }
        if (gpio.read(btnDOWN) == 0) {
            selectedRow = (selectedRow + 1) % rows;
            if (selectedRow == rows - 1) selectedCol = 0;
            drawKeyboard();
            delay(200);
            if (millis() - lastTypingTime > 1000) {
                nrf.send("TYP");
                lastTypingTime = millis();
            }
        }
        if (gpio.read(btnLEFT) == 0) {
            selectedCol = (selectedCol - 1 + cols) % cols;
            drawKeyboard();
            delay(200);
        }
        if (gpio.read(btnRIGHT) == 0) {
            selectedCol = (selectedCol + 1) % cols;
            drawKeyboard();
            delay(200);
        }
        if (gpio.read(btnSELECT) == 0) {
            var key = keyboardLayout[selectedRow][selectedCol];
            if (key == "SPACE") {
                text += " ";
                drawKeyboard();
            } else if (key == "BACK") {
                if (text.length > 0) text = text.slice(0, -1);
                drawKeyboard();
            } else if (key == "CLEAR") {
                text = "";
                drawKeyboard();
            } else if (key == "SEND") {
                if (text.length > 0) {
                    addHistory("me", text, false);
                    sendMessage(text);
                    receivedText = "";
                    mode = "chat";
                    drawChat();
                }
            } else {
                text += key;
                drawKeyboard();
            }
            delay(200);
        }
        if (gpio.read(btnBACK) == 0) {
            if (text.length > 0) {
                addHistory("me", text, false);
                sendMessage(text);
                receivedText = "";
                mode = "chat";
                drawChat();
            }
            delay(200);
        }
        var backPressTime = 0;
        if (gpio.read(btnBACK) == 0) {
            delay(50);
            if (gpio.read(btnBACK) == 0) {
                backPressTime = millis();
                while (gpio.read(btnBACK) == 0) { delay(20); }
                if (millis() - backPressTime > 1500) {
                    mode = "history";
                    drawHistory();
                    delay(200);
                }
            }
        }
        var incoming = nrf.receive();
        if (incoming != null && incoming != "") {
            if (incoming == "TYP") {
                display.clear();
                display.println("Other is typing...");
                delay(500);
                drawKeyboard();
            } else if (incoming.indexOf("MSG:") == 0) {
                var parts = incoming.substring(4).split(":");
                var msgId = parseInt(parts[0]);
                var encryptedText = parts.slice(1).join(":");
                var decrypted = encryptDecrypt(encryptedText, sharedSecret);
                receivedText = decrypted;
                addHistory("other", decrypted, true);
                nrf.send("ACK:" + msgId);
                drawKeyboard();
            }
        }
        delay(50);
    }
    else if (mode == "chat") {
        display.println("Press SELECT to return to keyboard");
        display.println("Press BACK to view history");
        if (gpio.read(btnSELECT) == 0) {
            mode = "keyboard";
            drawKeyboard();
            delay(200);
        }
        if (gpio.read(btnBACK) == 0) {
            mode = "history";
            drawHistory();
            delay(200);
        }
        var incoming = nrf.receive();
        if (incoming != null && incoming != "") {
            if (incoming.indexOf("MSG:") == 0) {
                var parts = incoming.substring(4).split(":");
                var msgId = parseInt(parts[0]);
                var encryptedText = parts.slice(1).join(":");
                var decrypted = encryptDecrypt(encryptedText, sharedSecret);
                receivedText = decrypted;
                addHistory("other", decrypted, true);
                nrf.send("ACK:" + msgId);
                drawChat();
            }
        }
        delay(50);
    }
    else if (mode == "history") {
        if (gpio.read(btnSELECT) == 0) {
            mode = "keyboard";
            drawKeyboard();
            delay(200);
        }
        if (gpio.read(btnBACK) == 0) {
            mode = "keyboard";
            drawKeyboard();
            delay(200);
        }
        delay(50);
    }
}
