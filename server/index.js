const configs = require("./config.json");

const sha1 = require("./utils/sha1.js");
const genUUID = require("./utils/genUUID.js");
const servers = require("./utils/server.js");

/*
const { StaticPool } = require('node-worker-threads-pool');
*/

const Codec = require("./network/codec.js");
const serverCodec = new Codec();

const allSessions = {};
const sessionLimit = configs.sessionLimit;

const WebSocket = require("ws");
const path = require("path");
const { Worker } = require("node:worker_threads");

/*
const staticPool = new StaticPool({
    size: sessionLimit,
    task: async (obj) => {
        const WAssembly = require("./network/wasm.js");
        const { JSDOM } = require("jsdom");
        const { window } = new JSDOM("https://zombs.io/");

        const wasm = new WAssembly(window, obj.ipAddress);
        await wasm.init();

        console.log(wasm, obj);
        return wasm;
    },
});
*/

const wss = new WebSocket.Server({ port: configs.port }, () => {
    console.log('Session Saver server initiated at port ' + configs.port);
});

wss.on('connection', ws => {
    ws.hasSynced = false;
    ws.hasBeenVerified = false;
    ws.isConnectedToMaster = false;

    ws.id = genUUID();
    ws.masterId = null;

    ws.connectionTimeout = setTimeout(() => { ws.close(); }, configs.connectionTimeout);

    console.log("New connection to Session Saver");
    ws.on('message', msg => {
        const opcode = new Uint8Array(msg)[0];
        if (!ws.hasBeenVerified || !ws.isConnectedToMaster) {
            if (!ws.hasBeenVerified) {
                try {
                    if (opcode == 9) {
                        const data = serverCodec.decode(msg);
                        console.log(data);
                        if (data.name == "VerifyUser" && sha1(configs.password) == data.response.secretKey) {
                            ws.hasBeenVerified = true;
                            console.log("Verfied user: ", ws.id);
                        };
                    };
                } catch (e) {
                    console.log("Forbidden response from listener: ", e);
                    ws.close();
                };
            };
            if (!ws.isConnectedToMaster) {
                try {
                    if (opcode == 9) {
                        const data = serverCodec.decode(msg);
                        if (data.name == "ConnectSession") {
                            const id = data.response.id;
                            if (allSessions[id] !== undefined) {
                                ws.masterId = id;
                                ws.isConnectedToMaster = true;
                                clearTimeout(ws.connectionTimeout);

                                allSessions[id].listeners.push(ws);
                                allSessions[id].master.postMessage({ name: "NEW_LISTENER", options: { listenerId: ws.id } });
                            } else throw new Error("Session not found: " + id);
                        };
                    };
                } catch (e) {
                    console.log("Forbidden response from listener: ", e);
                    ws.close();
                };
            };
            return;
        };
        if (ws.hasBeenVerified && ws.isConnectedToMaster && [3, 9].indexOf(opcode) > -1) {
            if (opcode == 9) {
                /*
                const data = serverCodec.decode(msg);
                if (data.name == "BuyItem" && data.response.tier == 1) {
                    if (data.response.itemName == "PetCARL" || data.response.itemName == "PetMiner") return;

                    if (data.response.itemName == "Pickaxe" && master.player.inventory.Pickaxe) return;
                    if (data.response.itemName == "Spear" && master.player.inventory.Spear) return;
                    if (data.response.itemName == "Bow" && master.player.inventory.Bow) return;
                    if (data.response.itemName == "Bomb" && master.player.inventory.Bomb) return;
                };
                if (data.name == "SetPartyName" && new Blob([data.response.partyName]).size > 49) return;
                if (data.name == "SendChatMessage" && new Blob([data.response.message]).size <= 249) return;
                */
            };
            allSessions[ws.masterId].master.postMessage({ name: "DATA_OUTGOING", options: { data: msg } });
        };
    });
});


const express = require('express');
const cors = require("cors");
const app = express();
app.use(cors());

app.get('/sessions', (req, res) => {
    const data = {};
    for (const sessionId in allSessions) {
        if (!allSessions[sessionId]?.connectionOptions) continue;
        data[sessionId] = allSessions[sessionId].connectionOptions;
    }
    res.send(data);
});

app.get('/create', async (req, res) => {
    const { name, serverId } = req.query;
    if (name !== undefined && serverId !== undefined) {
        if (new Blob([name]).size > 29) return res.send("Unusable name");
        if (servers[serverId] === undefined) return res.send("Server not found");

        const sessionId = genUUID();
        console.log(sessionId, name, req.query.psk || "", serverId);
        allSessions[sessionId] = {
            master: new Worker(path.join(__dirname, "./master/master.js")),
            listeners: [],
            connectionOptions: servers[serverId],
        };
        allSessions[sessionId].master.on("message", async msg => {
            switch (msg.name) {
                case "MASTER_CREATED":
                    res.send("OK");
                    break;
                case "SYNC_DATA":
                    const listener = allSessions[sessionId].listeners.find(socket => socket.id == msg.listenerId);
                    const syncData = serverCodec.encode(9, {
                        name: "SyncData",
                        json: JSON.stringify(msg.syncNeeds)
                    });
                    listener.send(syncData);
                    listener.hasSynced = true;
                    console.log("Synced data: " + listener.id);
                case "DATA_INCOMING":
                    // console.log(msg.data);
                    try {
                        if (allSessions[sessionId].listeners === undefined) console.log(sessionId, allSessions[sessionId]);
                        for (const listener of allSessions[sessionId].listeners) {
                            if (listener.readyState !== 1) {
                                listener.close();
                                allSessions[sessionId].listeners.splice(allSessions[sessionId].listeners.indexOf(listener));
                                continue;
                            };
                            listener.hasSynced && listener.send(msg.data);
                        };
                    } catch {
                        console.log("brother what", sessionId, allSessions[sessionId]);
                    };
                    break;
                case "MASTER_CLOSED":
                    try {
                        for (const listener of allSessions[sessionId].listeners) {
                            listener.readyState === 1 && listener.close();
                        };
                        allSessions[sessionId].master.terminate();
                        delete allSessions[sessionId];
                        console.log("Session closed: " + sessionId);
                    } catch {
                        console.log("brother how", sessionId);
                    };
                    break;
            }
        });
        allSessions[sessionId].master.postMessage({
            name: "CREATE_SESSION",
            options: [sessionId, name, req.query.psk || "", serverId]
        });
    } else res.send("Incorrect query");
});

app.get("/delete", (req, res) => {
    const { sessionId } = req.query;
    if (allSessions[sessionId] !== undefined) {
        allSessions[sessionId].master.postMessage({ name: "CLOSE_SESSION" });
        res.send("OK");
    } else res.send("Incorrect query");
});

app.listen(configs.port + 1, () => console.log("Session Saver API initiated at port " + (configs.port + 1)));