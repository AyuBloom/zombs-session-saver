'use strict';

const ByteBuffer = require('bytebuffer');
const WAssembly = require('./wasm.js');

let PACKET = {
    PRE_ENTER_WORLD: 5,
    ENTER_WORLD: 4,
    RPC: 9,
    PING: 7,
    ENTITY_UPDATE: 0,
    INPUT: 3,
    ENTER_WORLD2: 6,
    BLEND: 10,
};

var ATTRIBUTE_TYPE;
(function (ATTRIBUTE_TYPE) {
    ATTRIBUTE_TYPE[ATTRIBUTE_TYPE["Uninitialized"] = 0] = "Uninitialized";
    ATTRIBUTE_TYPE[ATTRIBUTE_TYPE["Uint32"] = 1] = "Uint32";
    ATTRIBUTE_TYPE[ATTRIBUTE_TYPE["Int32"] = 2] = "Int32";
    ATTRIBUTE_TYPE[ATTRIBUTE_TYPE["Float"] = 3] = "Float";
    ATTRIBUTE_TYPE[ATTRIBUTE_TYPE["String"] = 4] = "String";
    ATTRIBUTE_TYPE[ATTRIBUTE_TYPE["Vector2"] = 5] = "Vector2";
    ATTRIBUTE_TYPE[ATTRIBUTE_TYPE["EntityType"] = 6] = "EntityType";
    ATTRIBUTE_TYPE[ATTRIBUTE_TYPE["ArrayUint32"] = 8] = "ArrayUint32";
    ATTRIBUTE_TYPE[ATTRIBUTE_TYPE["Uint16"] = 9] = "Uint16";
    ATTRIBUTE_TYPE[ATTRIBUTE_TYPE["Uint8"] = 10] = "Uint8";
    ATTRIBUTE_TYPE[ATTRIBUTE_TYPE["Int16"] = 11] = "Int16";
    ATTRIBUTE_TYPE[ATTRIBUTE_TYPE["Int8"] = 12] = "Int8";
    ATTRIBUTE_TYPE[ATTRIBUTE_TYPE["Uint64"] = 13] = "Uint64";
    ATTRIBUTE_TYPE[ATTRIBUTE_TYPE["Int64"] = 14] = "Int64";
    ATTRIBUTE_TYPE[ATTRIBUTE_TYPE["Double"] = 15] = "Double";
})(ATTRIBUTE_TYPE || (ATTRIBUTE_TYPE = {}));
var e_ParameterType;
(function (e_ParameterType) {
    e_ParameterType[e_ParameterType["Uint32"] = 0] = "Uint32";
    e_ParameterType[e_ParameterType["Int32"] = 1] = "Int32";
    e_ParameterType[e_ParameterType["Float"] = 2] = "Float";
    e_ParameterType[e_ParameterType["String"] = 3] = "String";
    e_ParameterType[e_ParameterType["Uint64"] = 4] = "Uint64";
    e_ParameterType[e_ParameterType["Int64"] = 5] = "Int64";
})(e_ParameterType || (e_ParameterType = {}));

module.exports = class Codec {
    constructor(ipAddress) {
        this.absentEntitiesFlags = [];
        this.rpcMaps = [{
            "name": "SyncData",
            "parameters": [{
                "name": "json",
                "type": 3
            }],
            "isArray": false,
            "index": 0
        }, {
            "name": "VerifyUser",
            "parameters": [{
                "name": "secretKey",
                "type": 3,
            }],
            "isArray": false,
            "index": 1
        }, {
            "name": "ConnectSession",
            "parameters": [{
                "name": "id",
                "type": 3
            }],
            "isArray": false,
            "index": 2
        }];
        this.rpcMapsByName = {
            "SyncData": {
                "name": "SyncData",
                "parameters": [{
                    "name": "json",
                    "type": 3
                }],
                "isArray": false,
                "index": 0
            },
            "VerifyUser": {
                "name": "VerifyUser",
                "parameters": [{
                    "name": "secretKey",
                    "type": 3
                }],
                "isArray": false,
                "index": 1
            },
            "ConnectSession": {
                "name": "ConnectSession",
                "parameters": [{
                    "name": "id",
                    "type": 3
                }],
                "isArray": false,
                "index": 2
            },
        };
        this.updatedEntityFlags = [];
        this.attributeMaps = {};
        this.entityTypeNames = {};
        this.removedEntities = {};
        this.sortedUidsByType = {};
        
        this.ipAddress = ipAddress;
    };

    async init() {
        this.wasm = new WAssembly(this.ipAddress);
        await this.wasm.init();
    }

    encode(opcode, data) {
        const buffer = new ByteBuffer(100, true);
        switch (opcode) {
            case PACKET.ENTER_WORLD:
                buffer.writeUint8(PACKET.ENTER_WORLD);
                this.encodeEnterWorld(buffer, data);
                break;
            case PACKET.ENTER_WORLD2:
                buffer.writeUint8(PACKET.ENTER_WORLD2);
                this.encodeEnterWorld2(buffer);
                break;
            case PACKET.INPUT:
                buffer.writeUint8(PACKET.INPUT);
                this.encodeInput(buffer, data);
                break;
            case PACKET.PING:
                buffer.writeUint8(PACKET.PING);
                this.encodePing(buffer);
                break;
            case PACKET.RPC:
                buffer.writeUint8(PACKET.RPC);
                this.encodeRpc(buffer, data);
                break;
            case PACKET.BLEND:
                buffer.writeUint8(PACKET.BLEND);
                this.encodeBlend(buffer, data);
        }

        buffer.flip();
        buffer.compact();

        return buffer.toArrayBuffer();
    }

    decode(arrayBuffer) {
        const buffer = ByteBuffer.wrap(arrayBuffer, 'utf8', true);
        const opcode = buffer.readUint8();

        let decoded;
        switch (opcode) {
            case PACKET.PRE_ENTER_WORLD:
                decoded = this.decodePreEnterWorldResponse(buffer);
                break;
            case PACKET.ENTER_WORLD:
                decoded = this.decodeEnterWorldResponse(buffer);
                break;
            case PACKET.ENTITY_UPDATE:
                decoded = this.decodeEntityUpdate(buffer);
                break;
            case PACKET.PING:
                decoded = this.decodePing();
                break;
            case PACKET.RPC:
                decoded = this.decodeRpc(buffer);
                break;
            case PACKET.BLEND:
                decoded = this.decodeBlend(buffer);
        }

        decoded.opcode = opcode;
        return decoded;
    }

    safeReadVString(buffer) {
        let offset = buffer.offset;
        const len = buffer.readVarint32(offset);

        try {
            const func = buffer.readUTF8String.bind(buffer);
            offset += len.length;

            const str = func(len.value, ByteBuffer.METRICS_BYTES, offset);
            offset += str.length;
            buffer.offset = offset;

            return str.string;
        } catch (e) {
            offset += len.value;
            buffer.offset = offset;

            return '?';
        }
    }

    decodePreEnterWorldResponse(buffer) {
        this.wasm._MakeBlendField(255, 140);
        var extra = this.decodeBlendInternal(buffer);
        return { extra };
    };

    decodeBlend(buffer) {
        var extra = this.decodeBlendInternal(buffer);
        return { extra };
    };

    decodeBlendInternal(buffer) {
        this.wasm._MakeBlendField(24, 132);

        let BlendField = this.wasm._MakeBlendField(228, buffer.remaining());
        for (let i = 0; buffer.remaining();) {
            this.wasm.HEAPU8[BlendField + i] = buffer.readUint8();
            i++;
        }

        this.wasm._MakeBlendField(172, 36);
        BlendField = this.wasm._MakeBlendField(4, 152);

        let extra = new ArrayBuffer(64);
        let extraData = new Uint8Array(extra);

        for (let i = 0; i < 64; i++)
            extraData[i] = this.wasm.HEAPU8[BlendField + i];

        return {extra};
    }

    decodeEnterWorldResponse(buffer) {
        const EnterWorldResponse = {
            allowed: buffer.readUint32(),
            uid: buffer.readUint32(),
            startingTick: buffer.readUint32(),
            tickRate: buffer.readUint32(),
            effectiveTickRate: buffer.readUint32(),
            players: buffer.readUint32(),
            maxPlayers: buffer.readUint32(),
            chatChannel: buffer.readUint32(),
            effectiveDisplayName: this.safeReadVString(buffer),
            x1: buffer.readInt32(),
            y1: buffer.readInt32(),
            x2: buffer.readInt32(),
            y2: buffer.readInt32()
        }

        const dataLength = buffer.readUint32();

        this.attributeMaps = {};
        this.entityTypeNames = {};

        for (let h = 0; h < dataLength; h++) {
            const attributes = [];
            const attributeID = buffer.readUint32();
            const entityNames = buffer.readVString();
            const attributesLength = buffer.readUint32();

            for (let i = 0; i < attributesLength; i++) {
                attributes.push({
                    name: buffer.readVString(),
                    type: buffer.readUint32()
                });
            }

            this.attributeMaps[attributeID] = attributes;
            this.entityTypeNames[attributeID] = entityNames;
            this.sortedUidsByType[attributeID] = [];
        }

        const rpcLength = buffer.readUint32();

        this.rpcMaps = [];
        this.rpcMapsByName = {};

        for (let h = 0; h < rpcLength; h++) {
            const name = buffer.readVString();
            const parameterLength = buffer.readUint8();
            const isArray = buffer.readUint8() !== 0;
            const parameters = [];

            for (let i = 0; i < parameterLength; i++) {
                parameters.push({
                    'name': buffer.readVString(),
                    'type': buffer.readUint8()
                });
            }

            const rpc = {
                name,
                parameters,
                isArray,
                index: this.rpcMaps.length
            };

            this.rpcMaps.push(rpc);
            this.rpcMapsByName[name] = rpc;
        }

        return EnterWorldResponse;
    }

    decodeEntityUpdate(buffer) {
        const tick = buffer.readUint32();
        const _0x4676f3 = buffer.readVarint32();
        const _0x2fb96a = {};

        _0x2fb96a.tick = tick;
        _0x2fb96a.entities = {};

        for (var _0x783a78 in this.removedEntities)
            delete this.removedEntities[_0x783a78];
        for (var _0x275c56 = 0x0; _0x275c56 < _0x4676f3; _0x275c56++) {
            var _0x783a78 = buffer.readUint32();
            this.removedEntities[_0x783a78] = 0x1;
        }
        for (var _0x3c16a1 = buffer.readVarint32(), _0x275c56 = 0x0; _0x275c56 < _0x3c16a1; _0x275c56++)
            for (var _0x3bb40a = buffer.readVarint32(), _0x268c2f = buffer.readUint32(), _0x5e7837 = (this.entityTypeNames[_0x268c2f], 0x0); _0x5e7837 < _0x3bb40a; _0x5e7837++) {
                var _0xdc8034 = buffer.readUint32();
                this.sortedUidsByType[_0x268c2f][`push`](_0xdc8034);
            }
        for (var _0x275c56 in this.sortedUidsByType) {
            for (var _0x16d7c6 = this.sortedUidsByType[_0x275c56], _0x3048e4 = [], _0x5e7837 = 0x0; _0x5e7837 < _0x16d7c6.length; _0x5e7837++) {
                var _0x783a78 = _0x16d7c6[_0x5e7837];
                _0x783a78 in this.removedEntities || _0x3048e4.push(_0x783a78);
            }
            _0x3048e4.sort(function (_0x2d1ae3, _0x177d9a) {
                return _0x2d1ae3 < _0x177d9a ? -0x1 : _0x2d1ae3 > _0x177d9a ? 0x1 : 0x0;
            }),
                this.sortedUidsByType[_0x275c56] = _0x3048e4;
        }
        for (; buffer.remaining();) {
            var _0x50ca55 = buffer.readUint32();
            this.entityTypeNames[_0x50ca55];
            if (!(_0x50ca55 in this.attributeMaps))
                throw new Error(`Entity type is not in attribute map: ` + _0x50ca55);
            var _0x14d5cd = Math.floor((this.sortedUidsByType[_0x50ca55][`length`] + 0x7) / 0x8);
            this.absentEntitiesFlags.length = 0x0;
            for (var _0x275c56 = 0x0; _0x275c56 < _0x14d5cd; _0x275c56++)
                this.absentEntitiesFlags.push(buffer.readUint8());
            for (var _0x2c50cb = this.attributeMaps[_0x50ca55], _0x31de8a = 0x0; _0x31de8a < this.sortedUidsByType[_0x50ca55]['length']; _0x31de8a++) {
                var _0x783a78 = this.sortedUidsByType[_0x50ca55][_0x31de8a];
                if (0x0 === (this.absentEntitiesFlags[Math.floor(_0x31de8a / 0x8)] & 0x1 << _0x31de8a % 0x8)) {
                    var _0x611b31 = {
                        'uid': _0x783a78
                    };
                    this.updatedEntityFlags.length = 0x0;
                    for (var _0x5e7837 = 0x0; _0x5e7837 < Math.ceil(_0x2c50cb.length / 0x8); _0x5e7837++)
                        this.updatedEntityFlags.push(buffer.readUint8());
                    for (var _0x5e7837 = 0x0; _0x5e7837 < _0x2c50cb.length; _0x5e7837++) {
                        var _0x5d28b7 = _0x2c50cb[_0x5e7837],
                            _0xdf61d9 = Math.floor(_0x5e7837 / 0x8),
                            _0x57e9b3 = _0x5e7837 % 0x8,
                            _0x95dcdb = void 0x0,
                            _0x2b9d9b = [];
                        if (this.updatedEntityFlags[_0xdf61d9] & 0x1 << _0x57e9b3)
                            switch (_0x5d28b7.type) {
                                case ATTRIBUTE_TYPE.Uint32:
                                    _0x611b31[_0x5d28b7.name] = buffer.readUint32();
                                    break;
                                case ATTRIBUTE_TYPE.Int32:
                                    _0x611b31[_0x5d28b7.name] = buffer.readInt32();
                                    break;
                                case ATTRIBUTE_TYPE.Float:
                                    _0x611b31[_0x5d28b7.name] = buffer.readInt32() / 0x64;
                                    break;
                                case ATTRIBUTE_TYPE.String:
                                    _0x611b31[_0x5d28b7.name] = this.safeReadVString(buffer);
                                    break;
                                case ATTRIBUTE_TYPE.Vector2:
                                    var _0xf997d6 = buffer.readInt32() / 0x64,
                                        _0x1b8caf = buffer.readInt32() / 0x64;
                                    _0x611b31[_0x5d28b7.name] = {
                                        'x': _0xf997d6,
                                        'y': _0x1b8caf
                                    };
                                    break;
                                case ATTRIBUTE_TYPE.ArrayVector2:
                                    _0x95dcdb = buffer.readInt32(),
                                        _0x2b9d9b = [];
                                    for (var _0x275c56 = 0x0; _0x275c56 < _0x95dcdb; _0x275c56++) {
                                        var _0x56717a = buffer.readInt32() / 0x64,
                                            _0x1a9b35 = buffer.readInt32() / 0x64;
                                        _0x2b9d9b.push({
                                            'x': _0x56717a,
                                            'y': _0x1a9b35
                                        });
                                    }
                                    _0x611b31[_0x5d28b7.name] = _0x2b9d9b;
                                    break;
                                case ATTRIBUTE_TYPE.ArrayUint32:
                                    _0x95dcdb = buffer.readInt32(),
                                        _0x2b9d9b = [];
                                    for (var _0x275c56 = 0x0; _0x275c56 < _0x95dcdb; _0x275c56++) {
                                        var _0x5a3cb1 = buffer.readInt32();
                                        _0x2b9d9b.push(_0x5a3cb1);
                                    }
                                    _0x611b31[_0x5d28b7.name] = _0x2b9d9b;
                                    break;
                                case ATTRIBUTE_TYPE.Uint16:
                                    _0x611b31[_0x5d28b7.name] = buffer.readUint16();
                                    break;
                                case ATTRIBUTE_TYPE.Uint8:
                                    _0x611b31[_0x5d28b7.name] = buffer.readUint8();
                                    break;
                                case ATTRIBUTE_TYPE.Int16:
                                    _0x611b31[_0x5d28b7.name] = buffer.readInt16();
                                    break;
                                case ATTRIBUTE_TYPE.Int8:
                                    _0x611b31[_0x5d28b7.name] = buffer.readInt8();
                                    break;
                                case ATTRIBUTE_TYPE.Uint64:
                                    _0x611b31[_0x5d28b7.name] = buffer.readUint32() + 4294967296 * buffer.readUint32();
                                    break;
                                case ATTRIBUTE_TYPE.Int64:
                                    var _0x28ae50 = buffer.readUint32(),
                                        _0x1ce59e = buffer.readInt32();
                                    _0x1ce59e < 0x0 && (_0x28ae50 *= -0x1),
                                        _0x28ae50 += 4294967296 * _0x1ce59e,
                                        _0x611b31[_0x5d28b7.name] = _0x28ae50;
                                    break;
                                case ATTRIBUTE_TYPE.Double:
                                    var _0x267a2e = buffer.readUint32(),
                                        _0x289083 = buffer.readInt32();
                                    _0x289083 < 0x0 && (_0x267a2e *= -0x1),
                                        _0x267a2e += 4294967296 * _0x289083,
                                        _0x267a2e /= 0x64,
                                        _0x611b31[_0x5d28b7.name] = _0x267a2e;
                                    break;
                                default:
                                    throw new Error(`Unsupported attribute type: ` + _0x5d28b7.type);
                            }
                    }
                    _0x2fb96a.entities[_0x611b31.uid] = _0x611b31;
                } else _0x2fb96a.entities[_0x783a78] = true;
            }
        }

        _0x2fb96a.byteSize = buffer.capacity();
        return _0x2fb96a;
    }

    decodePing() {
        return {};
    }

    encodeBlend(buffer, params) {
        const extra = new Uint8Array(params.extra);

        for (let i = 0; i < params.extra.byteLength; i++)
            buffer.writeUint8(extra[i]);
    }

    encodeRpc(buffer, packet) {
        if (!(packet.name in this.rpcMapsByName)) return console.error(`RPC not in map: ${packet.name}`);

        const rpc = this.rpcMapsByName[packet.name];
        buffer.writeUint32(rpc.index);

        for (const parameter of rpc.parameters) {
            const _0x539cc1 = packet[parameter.name];
            switch (parameter.type) {
                case e_ParameterType.Float:
                    buffer.writeInt32(Math.floor(100 * _0x539cc1));
                    break;
                case e_ParameterType.Int32:
                    buffer.writeInt32(_0x539cc1);
                    break;
                case e_ParameterType.String:
                    buffer.writeVString(_0x539cc1);
                    break;
                case e_ParameterType.Uint32:
                    buffer.writeUint32(_0x539cc1);
            }
        }
    }

    decodeRpcObject(buffer, parameters) {
        const decodedObject = {};

        for (let parameter of parameters) {
            switch (parameter.type) {
                case e_ParameterType.Uint32:
                    decodedObject[parameter.name] = buffer.readUint32();
                    break;
                case e_ParameterType.Int32:
                    decodedObject[parameter.name] = buffer.readInt32();
                    break;
                case e_ParameterType.Float:
                    decodedObject[parameter.name] = buffer.readInt32() / 100.0;
                    break;
                case e_ParameterType.String:
                    decodedObject[parameter.name] = this.safeReadVString(buffer);
                    break;
                case e_ParameterType.Uint64:
                    decodedObject[parameter.name] = buffer.readUint32() + 4294967296 * buffer.readUint32();
            }
        }
        return decodedObject;
    }

    decodeRpc(buffer) {
        const rpcIndex = buffer.readUint32();
        const rpcInMap = this.rpcMaps[rpcIndex];

        const rpc = {
            name: rpcInMap.name,
            response: null
        };

        if (rpcInMap.isArray) {
            const _0x565f3a = [];
            const _0x37944e = buffer.readUint16();

            for (let i = 0; i < _0x37944e; i++)
                _0x565f3a.push(this.decodeRpcObject(buffer, rpcInMap.parameters));

            rpc.response = _0x565f3a;
        } else rpc.response = this.decodeRpcObject(buffer, rpcInMap.parameters);

        return rpc;
    }

    encodeEnterWorld(buffer, params) {
        buffer.writeVString(params.displayName);
        const extra = new Uint8Array(params.extra);

        for (let i = 0x0; i < params.extra.byteLength; i++)
            buffer.writeUint8(extra[i]);
    }

    encodeEnterWorld2(buffer) {
        const BlendField = this.wasm._MakeBlendField(187, 22);

        for (let i = 0; i < 16; i++)
            buffer.writeUint8(this.wasm.HEAPU8[BlendField + i]);
    }

    encodeInput(buffer, input) {
        return buffer.writeVString(JSON.stringify(input));
    }

    encodePing(buffer) {
        return buffer.writeUint8(0);
    }
}