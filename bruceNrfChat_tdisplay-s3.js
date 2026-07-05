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

var myID = "";
var mode = "discovery";
var foundDevices = [];
var selectedDevice = 0;
var chatPartner = null;
var sharedSecret = 0;
var dhComplete = false;
var text = "";
var receivedText = "";
var history = [];
var maxHistory = 50;
var logFile = "/chat_log.txt";
var msgCounter = 0;
var lastTypingTime = 0;
var ackTimeout = 2000;
var dhTimeout = 5000;
var historyTimeout = 10000;
var historyTimer = 0;
var lastIncomingTime = 0;

var p = 2147483647;
var g = 5;
var privateKey = Math.floor(Math.random() * (p - 2)) + 2;
var publicKey = modPow(g, privateKey, p);

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

function getDeviceID() {
    var mac = wifi.macAddress();
    var parts = mac.split(":");
    return parts[4] + parts[5];
}

myID = getDeviceID();

if (!nrf.init(nrfSCK, nrfMISO, nrfMOSI, nrfCSN, nrfCE)) {
    display.clear();
    display.println("NRF24 init failed");
    display.println("Check wiring and power");
    while (true) { delay(1000); }
}

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
    var result = storage.write(logFile, log);
    if (!result) {
        display.println("SD write error");
        delay(500);
    }
}

function addHistory(roleText, text, delivered) {
    history.push({role: roleText, text: text, delivered: delivered || false});
    if (history.length > maxHistory) history.shift();
    saveHistory();
}

function drawDiscovery() {
    display.clear();
    display.println("=== Discover ===");
    display.println("My ID: " + myID);
    display.println("Found devices:");
    if (foundDevices.length == 0) {
        display.println("(none)");
    } else {
        for (var i = 0; i < foundDevices.length; i++) {
            var prefix = (i == selectedDevice) ? ">" : " ";
            display.println(prefix + foundDevices[i]);
        }
    }
    display.println("UP/DOWN select | SELECT request");
}

function drawChat() {
    display.clear();
    display.println("Chat with " + chatPartner);
    display.println("----------------");
    display.println("You: " + text);
    if (receivedText != "") display.println("Other: " + receivedText);
    display.println("----------------");
    display.println("SELECT send | BACK keyboard");
}

function drawKeyboard() {
    display.clear();
    display.println("Chat with " + chatPartner);
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
    display.println("UP/DOWN/LEFT/RIGHT | SELECT=choose | BACK=send");
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
    historyTimer = millis();
}

function sendMessage(msg) {
    if (!dhComplete) return;
    var encrypted = encryptDecrypt(msg, sharedSecret);
    var packet = "MSG:" + msgCounter + ":" + encrypted;
    var delayMs = Math.random() * 100;
    delay(delayMs);
    nrf.send(packet);
    var ackReceived = false;
    var startTime = millis();
    while (millis() - startTime < ackTimeout) {
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

function discoveryLoop() {
    if (millis() % 2000 < 50) {
        nrf.send("HELLO:" + myID);
    }
    var incoming = nrf.receive();
    if (incoming != null && incoming != "") {
        if (incoming.indexOf("HELLO:") == 0) {
            var id = incoming.substring(6);
            if (id != myID && foundDevices.indexOf(id) == -1) {
                foundDevices.push(id);
                drawDiscovery();
            }
        }
    }
    if (foundDevices.length > 0) {
        if (gpio.read(btnUP) == 0) {
            selectedDevice = (selectedDevice - 1 + foundDevices.length) % foundDevices.length;
            drawDiscovery();
            delay(200);
        }
        if (gpio.read(btnDOWN) == 0) {
            selectedDevice = (selectedDevice + 1) % foundDevices.length;
            drawDiscovery();
            delay(200);
        }
        if (gpio.read(btnSELECT) == 0) {
            var target = foundDevices[selectedDevice];
            nrf.send("REQUEST:" + myID + ":" + target);
            mode = "request";
            display.clear();
            display.println("Waiting for response...");
            delay(200);
        }
    }
    delay(50);
}

function requestLoop() {
    var incoming = nrf.receive();
    if (incoming != null && incoming != "") {
        if (incoming.indexOf("REQUEST:") == 0) {
            var parts = incoming.substring(8).split(":");
            var from = parts[0];
            var to = parts[1];
            if (to == myID) {
                display.clear();
                display.println(from + " wants to chat.");
                display.println("Accept? [SELECT=YES / BACK=NO]");
                while (true) {
                    if (gpio.read(btnSELECT) == 0) {
                        nrf.send("ACCEPT:" + myID + ":" + from);
                        chatPartner = from;
                        mode = "dh";
                        display.clear();
                        display.println("Accepted. Starting key exchange...");
                        delay(1000);
                        break;
                    }
                    if (gpio.read(btnBACK) == 0) {
                        nrf.send("REJECT:" + myID + ":" + from);
                        mode = "discovery";
                        drawDiscovery();
                        return;
                    }
                    delay(50);
                }
            }
        }
        if (incoming.indexOf("ACCEPT:") == 0) {
            var parts = incoming.substring(7).split(":");
            var from = parts[0];
            var to = parts[1];
            if (to == myID) {
                chatPartner = from;
                mode = "dh";
                display.clear();
                display.println("Accepted. Starting key exchange...");
                delay(1000);
            }
        }
        if (incoming.indexOf("REJECT:") == 0) {
            mode = "discovery";
            display.clear();
            display.println("Rejected.");
            delay(1000);
            drawDiscovery();
        }
    }
    delay(50);
}

function dhLoop() {
    if (!dhComplete) {
        var startTime = millis();
        if (myID < chatPartner) {
            nrf.send(publicKey.toString());
            var received = null;
            while (millis() - startTime < dhTimeout) {
                received = nrf.receive();
                if (received != null && received != "") break;
                delay(50);
            }
            if (received == null || received == "") {
                display.clear();
                display.println("DH timeout");
                display.println("Returning to discovery");
                delay(1500);
                mode = "discovery";
                dhComplete = false;
                chatPartner = null;
                drawDiscovery();
                return;
            }
            var otherPublic = parseInt(received);
            sharedSecret = modPow(otherPublic, privateKey, p);
        } else {
            var received = null;
            while (millis() - startTime < dhTimeout) {
                received = nrf.receive();
                if (received != null && received != "") break;
                delay(50);
            }
            if (received == null || received == "") {
                display.clear();
                display.println("DH timeout");
                display.println("Returning to discovery");
                delay(1500);
                mode = "discovery";
                dhComplete = false;
                chatPartner = null;
                drawDiscovery();
                return;
            }
            var otherPublic = parseInt(received);
            nrf.send(publicKey.toString());
            sharedSecret = modPow(otherPublic, privateKey, p);
        }
        dhComplete = true;
        mode = "chat";
        display.clear();
        display.println("Chat ready!");
        delay(1000);
        drawKeyboard();
    }
}

function chatLoop() {
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
                drawHistory();
                mode = "history";
                delay(200);
            }
        }
    }
    var incoming = nrf.receive();
    if (incoming != null && incoming != "") {
        lastIncomingTime = millis();
        if (incoming == "TYP") {
            display.clear();
            display.println("Other is typing...");
            delay(500);
            drawKeyboard();
        } else if (incoming.indexOf("MSG:") == 0) {
            var parts = incoming.substring(4).split(":");
            var msgId = parseInt(parts[0]);
            var encryptedText = parts.slice(1).join(":");
            if (!window.receivedIds) window.receivedIds = [];
            if (window.receivedIds.indexOf(msgId) == -1) {
                window.receivedIds.push(msgId);
                var decrypted = encryptDecrypt(encryptedText, sharedSecret);
                receivedText = decrypted;
                addHistory("other", decrypted, true);
                nrf.send("ACK:" + msgId);
                drawKeyboard();
            }
        }
    }
    if (millis() - lastIncomingTime > 5000 && dhComplete) {
        display.clear();
        display.println("Connection lost");
        display.println("Returning to discovery");
        delay(1500);
        mode = "discovery";
        dhComplete = false;
        chatPartner = null;
        drawDiscovery();
    }
    delay(50);
}

function historyLoop() {
    if (gpio.read(btnSELECT) == 0 || gpio.read(btnBACK) == 0) {
        mode = "chat";
        drawKeyboard();
        delay(200);
        return;
    }
    if (millis() - historyTimer > historyTimeout) {
        mode = "chat";
        drawKeyboard();
        delay(200);
        return;
    }
    delay(50);
}

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

drawDiscovery();

while (true) {
    if (mode == "discovery") discoveryLoop();
    else if (mode == "request") requestLoop();
    else if (mode == "dh") dhLoop();
    else if (mode == "chat") chatLoop();
    else if (mode == "history") historyLoop();
}