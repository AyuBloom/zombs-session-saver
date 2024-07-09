const WebSocket = require("ws");
const { parentPort: thread } = require("worker_threads");

const BinCodec = require("../network/codec.js");
const servers = require("../utils/server.js");

const metrics = {
    "name": "Metrics",
    "minFps": 4.790189691457077,
    "maxFps": 71.58196138239042,
    "currentFps": 60.096153811711446,
    "averageFps": 59.64973211303138,
    "framesRendered": 2459,
    "framesInterpolated": 2458,
    "framesExtrapolated": 1,
    "allocatedNetworkEntities": 205,
    "currentClientLag": 587,
    "minClientLag": 566,
    "maxClientLag": 978,
    "currentPing": 19,
    "minPing": 17.5,
    "maxPing": 494.5,
    "averagePing": 64.23017486783245,
    "longFrames": 1,
    "stutters": 136,
    "isMobile": 0,
    "group": 0,
    "timeResets": 2,
    "maxExtrapolationTime": 477.7999997138977,
    "totalExtrapolationTime": 477.7999997138977,
    "extrapolationIncidents": 1,
    "differenceInClientTime": 2.3000082969665527
};

class Master {
    constructor(id, name, psk, serverId, reconnect, mainThread) {
        this.sessionId = id;
        this.connectionOptions = servers[serverId];

        this.mainThread = mainThread;

        this.world = new World();
        this.player = new Player(name, psk);

        this.shouldReconnect = reconnect;
        this.isReady = false;

        this.init();
    }
    async init() {
        const { ipAddress, hostname } = this.connectionOptions;

        this.codec = new BinCodec(ipAddress);
        await this.codec.init();

        try {
            this.socket = new WebSocket(`wss://${hostname}:443`, {
                headers: {
                    'Accept-Encoding': 'gzip, deflate',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Cache-Control': 'no-cache',
                    'Connection': 'Upgrade',
                    'Host': hostname,
                    'Origin': 'https://zombs.io',
                    'Pragma': 'no-cache',
                    'Sec-WebSocket-Version': '13',
                    'Upgrade': 'websocket',
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
                },
            });
            this.socket.binaryType = "arraybuffer";
            this.socket.onmessage = this.onMessage.bind(this);
            this.socket.onclose = this.onClose.bind(this);
        } catch {
            this.mainThread.postMessage({ name: "ERROR" });
        }
    };
    onMessage({ data }) {
        this.sendPingIfNecessary();
        this.data = this.codec.decode(data);
        switch (this.data.opcode) {
            case 0:
                this.onEntityUpdate(this.data, data);
                break;
            case 4:
                if (this.data.allowed == 0) return this.mainThread.postMessage({ name: "ERROR" });
                this.isReady = true;
                this.mainThread.postMessage({ name: "MASTER_CREATED" });

                this.world.players = this.data.players;
                this.player.uid = this.data.uid;

                this.sendEnterWorld2();
                this.sendInput({ left: 1, up: 1, mouseMovedWhileDown: 0 });
                this.sendRpc({ name: "JoinPartyByShareKey", partyShareKey: this.player.partyShareKey });

                this.sendRpc({ name: "BuyItem", itemName: "PetCARL", tier: 1 });
                this.sendRpc({ name: "BuyItem", itemName: "PetMiner", tier: 1 });

                this.sendRpc({ name: "EquipItem", itemName: "PetCARL", tier: 1 });
                this.sendRpc({ name: "EquipItem", itemName: "PetMiner", tier: 1 });

                this.sendLbLoader();
                break;
            case 5:
                this.sendEnterWorld({
                    displayName: this.player.name,
                    extra: this.data.extra.extra
                });
                break;
            case 7:
                this.broadcastData(data);
                break;
            case 9:
                this.onRpc(this.data, data);
                break;
            case 10:
                this.sendBlend({ extra: this.data.extra.extra });
                break;
        }
    };
    onClose() {
        if (this.socket.readyState !== 1) {
            this.isReady = false;
            this.mainThread.postMessage({ name: this.shouldReconnect ? "MASTER_RECONNECT" : "MASTER_CLOSED" });
        };
        /*
        for (const listener of this.listeners) {
            listener.readyState === 1 && listener.close();
        };
        delete this.allSessions[this.sessionId];
        */
    };
    onEntityUpdate(data, buffer) {
        this.world.tick = data.tick;
        for (const uid in data.entities) {
            const entity = data.entities[uid];
            this.world.entities[uid] ||= {};
            entity !== true && Object.assign(this.world.entities[uid], entity);
        };
        for (const uid in this.world.entities) {
            if (!(uid in data.entities)) delete this.world.entities[uid];
        };
        this.broadcastData(buffer);
    };
    onRpc(data, buffer) {
        switch (data.name) {
            case "LocalBuilding":
                for (let i = 0; i < data.response.length; i++) {
                    const update = data.response[i];
                    if (update.dead) delete this.world.buildings[update.uid];
                    else this.world.buildings[update.uid] = update;
                };
                break;
            case "SetItem":
                if (data.response.stacks == 0) {
                    delete this.player.inventory[data.response.itemName];
                } else {
                    this.player.inventory[data.response.itemName] = data.response;
                    if (data.response.itemName == "ZombieShield") {
                        this.sendRpc({
                            name: "EquipItem",
                            itemName: "ZombieShield",
                            tier: data.response.tier
                        });
                    };
                };
                break;
            case "PartyShareKey":
                this.player.partyShareKey = data.response.partyShareKey;
                break;
            case "PartyInfo":
                this.player.partyInfo = data.response;
                break;
            case "SetPartyList":
                this.world.parties = {};
                this.world.players = 0;
                for (const partyData of data.response) {
                    this.world.parties[partyData.partyId] = partyData;
                    this.world.players += partyData.memberCount;
                };
                break;
            case "DayCycle":
                this.world.dayCycle = data.response;
                break;
            case "Leaderboard":
                this.world.leaderboard = data.response;
                break;
            case "ReceiveChatMessage":
                this.player.messages.push(data.response);
                this.player.messages.length > 50 && this.player.messages.shift();
                break;
            case "CastSpellResponse":
                this.player.castSpellResponse = data.response;
                break;
        };
        this.broadcastData(buffer);
    };
    broadcastData(data) {
        this.isReady && this.mainThread.postMessage({ name: "DATA_INCOMING", data });
        /*
        for (const listener of this.listeners) {
            if (listener.readyState !== 1) {
                listener.close();
                this.listeners.splice(this.listeners.indexOf(listener));
                continue;
            };
            listener.send(data);
        }
        */
    };
    sendPacket(e, t) {
        this.socket.readyState == 1 && this.socket.send(this.codec.encode(e, t));
    }
    sendPing() {
        this.sendPacket(7, { nonce: 0 });
    };
    sendInput(t) {
        this.sendPacket(3, t);
    };
    sendEnterWorld(t) {
        this.sendPacket(4, t);
    };
    sendEnterWorld2() {
        this.sendPacket(6, {});
    };
    sendBlend(t) {
        this.sendPacket(10, t);
    };
    sendRpc(t) {
        this.sendPacket(9, t);
    };
    sendMetrics() {
        this.sendPacket(9, metrics);
    };
    sendLbLoader() {
        this.sendPing();
        this.sendMetrics();
        for (let i = 0; i < 30; i++) {
            this.sendInput({ up: 1, right: 1 });
        };
    }
    sendPingIfNecessary() {
        var pingInProgress = (this.pingStart != null);
        if (pingInProgress) return;
        if (this.pingCompletion != null) {
            var msSinceLastPing = (new Date().getTime() - this.pingCompletion.getTime());
            if (msSinceLastPing <= 5000) return;
        }
        this.pingStart = new Date();
        this.sendPing();
    };
    getSyncNeeds() {
        const syncNeeds = [];
        syncNeeds.push({
            allowed: 1,
            uid: this.player.uid,
            startingTick: this.world.tick,
            tickRate: 20,
            effectiveTickRate: 20,
            players: this.world.players,
            maxPlayers: 32,
            chatChannel: 0,
            effectiveDisplayName: this.player.name,
            x1: 0,
            y1: 0,
            x2: 24000,
            y2: 24000,
            opcode: 4
        });
        syncNeeds.push({ name: 'PartyInfo', response: this.player.partyInfo, opcode: 9 });
        syncNeeds.push({ name: 'PartyShareKey', response: { partyShareKey: this.player.partyShareKey }, opcode: 9 });
        syncNeeds.push({ name: 'DayCycle', response: this.world.dayCycle, opcode: 9 });
        // syncNeeds.push({ name: 'Leaderboard', response: this.world.leaderboard, opcode: 9 });
        syncNeeds.push({ name: 'SetPartyList', response: Object.values(this.world.parties), opcode: 9 });
        const localBuildings = Object.values(this.world.buildings);
        return {
            tick: this.world.tick,
            entities: this.world.entities,
            byteSize: 654,
            opcode: 0,

            syncNeeds: syncNeeds,
            localBuildings: localBuildings,
            inventory: this.player.inventory,
            messages: this.player.messages,
            connectionOptions: this.connectionOptions,
            castSpellResponse: this.player.castSpellResponse,

            sortedUidsByType: this.codec.sortedUidsByType,
            removedEntities: this.codec.removedEntities,
            absentEntitiesFlags: this.codec.absentEntitiesFlags,
            updatedEntityFlags: this.codec.updatedEntityFlags
        };
    };
    addListener(listenerId) {
        const syncNeeds = this.getSyncNeeds();
        this.mainThread.postMessage({ name: "SYNC_DATA", syncNeeds, listenerId });
        /*
        ws.send(syncPacket);

        this.listeners.push(ws);
        ws.isConnectedToMaster = true;
        ws.masterId = this.sessionId;
        */
    }
}

class World {
    constructor() {
        this.tick = 0;
        this.players = 0;
        this.parties = {};
        this.entities = {};
        this.buildings = {};
        this.leaderboard = [];
        this.dayCycle = { cycleStartTick: 100, nightEndTick: 0, dayEndTick: 1300, isDay: 1 };
    }
}

class Player {
    constructor(name, psk) {
        this.name = name;
        this.partyShareKey = psk;

        this.inventory = {};
        this.partyInfo = [];
        this.messages = [];

        this.castSpellResponse = null;

        this.uid = null;
    };
};

let master = null;

thread.on("message", async ({ name, options }) => {
    switch (name) {
        case "CREATE_SESSION":
            const [id, name, psk, serverId, reconnect] = options;
            master = new Master(id, name, psk, serverId, reconnect, thread);
            await master.init();
            break;
        case "NEW_LISTENER":
            master.addListener(options.listenerId);
            break;
        case "DATA_OUTGOING":
            master.isReady && master.socket.send(options.data);
            break;
        case "CLOSE_SESSION":
            master.socket.close();
            break;
        default:
            thread.postMessage({ name: "ERROR" });
    };
});