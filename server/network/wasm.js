//const fetch = require("node-fetch");
const fs = require("fs");

module.exports = class WAssembly {
    constructor(ipAddress) {
        this.ipAddress = ipAddress;
        this.textEncoder = new TextDecoder('utf8');
    }

    #a_a(a) {
        // console.log('A / A - Memory Allocation');
        var t = this.ipAddress;
        if (null == t) return 0;
        t = String(t);
        var r = this.#a_a,
            a = this.#_0x31ce17(t);
        return (!r.bufferSize || r.bufferSize < a + 1) && (r.bufferSize && this._free(r.buffer), (r.bufferSize = a + 1), (r.buffer = this._malloc(r.bufferSize))), this.#_0x309f86(t, r.buffer, r.bufferSize), r.buffer;
    }

    #a_b(a) {
        // console.log('A / B - Return Eval');
        const decoded = this.#decodeParam(a);
        if (decoded.includes('typeof window === "undefined" ? 1 : 0')) return 0;
        if (decoded.includes(`typeof process !== 'undefined' ? 1 : 0`)) return 0;
        if (decoded.includes('Game.currentGame.network.connected')) return 1;
        if (decoded.includes('Game.currentGame.world.myUid')) return 0;
        if (decoded.includes('document.getElementById("hud").children.length')) return 24;
        if (decoded.includes("hostname")) return this.ipAddress;

        console.log("left to eval: " + decoded);
        return 0x0 | eval(decoded);
    }

    #a_c() {
        // console.log('A / C - Return Page load');
        // return performance.now();
    }

    #a_d(err = '') {
        // console.log("a_a fatal error");
        // this.onAbort && this.onAbort(err),
        err = 'Aborted(' + err + ')';
        console.error(err);
        err += '. Build with -sASSERTIONS for more info.';
        throw new WebAssembly.RuntimeError(err);
    }

    #a_e(a) {
        // console.log('A / F - Memory Grow');

        /*
        a >>>= 0x0;
        const _0x4ec8ab = 0x80000000;

        if (a > _0x4ec8ab) return false;

        for (let i = 1; i <= 4; i *= 2) {
            let _0x2c9c55 = this.HEAPU8.length * (0x1 + 0.2 / i);
            _0x2c9c55 = Math.min(_0x2c9c55, a + 0x6000000);

            const _0x21150c = Math.min(_0x4ec8ab, this.#_0x22cf5c(Math.max(0x1000000, a, _0x2c9c55), 0x10000));
            const _0x542766 = this.#grow(_0x21150c);

            if (_0x542766) return true;
        }
        return false;

        */
    }

    #a_f(a, b, c) {
        // console.log('A / E - Memory Copy');
        // this.HEAPU8.copyWithin(a, b, b + c)
    }

    async init() {
        const buffer = fs.readFileSync(require("path").join(__dirname, "/zombs_wasm.wasm"));
        return new Promise(async resolve => {
            const imports = {
                a: {
                    a: (...args) => this.#a_a(...args),
                    b: (...args) => this.#a_b(...args),
                    c: (...args) => this.#a_c(...args),
                    d: (...args) => this.#a_d(...args),
                    e: (...args) => this.#a_e(...args),
                    f: (...args) => this.#a_f(...args)
                }
            }

            await WebAssembly.instantiate(buffer, imports).then(_module => {
                this.memory = _module.instance.exports.g;
                this.#instantiateHeap(this.memory.buffer);
                this.table = _module.instance.exports.k; // h

                this.___wasm_call_ctors = _module.instance.exports.h; // i (?)
                this._main = _module.instance.exports.i; // j
                this._MakeBlendField = _module.instance.exports.j; // k
                this.stackSave = _module.instance.exports.n; // l
                this.stackAlloc = _module.instance.exports.o; //p // n
                this._malloc = _module.instance.exports.l; // o
                // this.stackRestore = _module.instance.exports.o; // m
                this._free = _module.instance.exports.m; // p

                this.#instantiateWasm();
                resolve();
            });
        });
    }

    #instantiateWasm() {
        this.___wasm_call_ctors();

        /*
        let arr = [];
        let length = arr.length + 1;

        let alloc = this.stackAlloc(4 * (length + 1));
        this.HEAP32[alloc >> 2] = this.#getAlloc('./this.program');

        for (let i = 1; i < length; i++)
            this.HEAP32[(alloc >> 2) + i] = this.#getAlloc(arr[i - 1]);

        this.HEAP32[(alloc >> 2) + length] = 0x0;
        */

        try { 
            this.HEAP32[1328256] = 5313008;
            this.HEAP32[1328257] = 0;
            this._main(1, 5313024);
            // this._main(length, alloc) 
        } catch (e) { console.error(`WAssembly._main caught error : ${e.stack.toString()}`) }
    }

    #instantiateHeap(buffer) {
        this.HEAP8 = new Int8Array(buffer);
        this.HEAP16 = new Int16Array(buffer);
        this.HEAP32 = new Int32Array(buffer);
        this.HEAPU8 = new Uint8Array(buffer);
        this.HEAPU16 = new Uint16Array(buffer);
        this.HEAPU32 = new Uint32Array(buffer);
        this.HEAPF32 = new Float32Array(buffer);
        this.HEAPF64 = new Float64Array(buffer);
    }

    #getAlloc(_0x49404f) {
        const _0x4fd158 = this.#_0x31ce17(_0x49404f) + 0x1;
        const alloc = this.stackAlloc(_0x4fd158);

        this.#_0x722087(_0x49404f, this.HEAP8, alloc, _0x4fd158);
        return alloc;
    }

    #_0x31ce17(_0x10db1a) {
        let _0x502ddd = 0;
        for (let i = 0; i < _0x10db1a.length; ++i) {
            let _0x4c7b50 = _0x10db1a.charCodeAt(i);

            _0x4c7b50 >= 0xd800 && _0x4c7b50 <= 0xdfff && (_0x4c7b50 = 0x10000 + ((0x3ff & _0x4c7b50) << 0xa) | 0x3ff & _0x10db1a.charCodeAt(++i));
            _0x4c7b50 <= 0x7f ? ++_0x502ddd : _0x502ddd += _0x4c7b50 <= 0x7ff ? 0x2 : _0x4c7b50 <= 0xffff ? 0x3 : 0x4;
        }
        return _0x502ddd;
    }

    #_0x722087(_0x1758de, _0xed46ea, _0x1af071, _0xab45f) {
        if (!(_0xab45f > 0x0)) return 0x0;

        const _0x151898 = _0x1af071;
        const _0x4c8912 = _0x1af071 + _0xab45f - 0x1;

        for (let i = 0x0; i < _0x1758de.length; ++i) {
            let _0x4f8126 = _0x1758de.charCodeAt(i);
            if (_0x4f8126 >= 0xd800 && _0x4f8126 <= 0xdfff) {
                const _0x556e3f = _0x1758de.charCodeAt(++i);
                _0x4f8126 = 0x10000 + ((0x3ff & _0x4f8126) << 0xa) | 0x3ff & _0x556e3f;
            }
            if (_0x4f8126 <= 0x7f) {
                if (_0x1af071 >= _0x4c8912)
                    break;
                _0xed46ea[_0x1af071++] = _0x4f8126;
            } else {
                if (_0x4f8126 <= 0x7ff) {
                    if (_0x1af071 + 0x1 >= _0x4c8912)
                        break;
                    _0xed46ea[_0x1af071++] = 0xc0 | _0x4f8126 >> 0x6;
                    _0xed46ea[_0x1af071++] = 0x80 | 0x3f & _0x4f8126;
                } else {
                    if (_0x4f8126 <= 0xffff) {
                        if (_0x1af071 + 0x2 >= _0x4c8912)
                            break;
                        _0xed46ea[_0x1af071++] = 0xe0 | _0x4f8126 >> 0xc;
                        _0xed46ea[_0x1af071++] = 0x80 | _0x4f8126 >> 0x6 & 0x3f;
                        _0xed46ea[_0x1af071++] = 0x80 | 0x3f & _0x4f8126;
                    } else {
                        if (_0x1af071 + 0x3 >= _0x4c8912)
                            break;
                        _0xed46ea[_0x1af071++] = 0xf0 | _0x4f8126 >> 0x12;
                        _0xed46ea[_0x1af071++] = 0x80 | _0x4f8126 >> 0xc & 0x3f;
                        _0xed46ea[_0x1af071++] = 0x80 | _0x4f8126 >> 0x6 & 0x3f;
                        _0xed46ea[_0x1af071++] = 0x80 | 0x3f & _0x4f8126;
                    }
                }
            }
        }

        _0xed46ea[_0x1af071] = 0x0;
        return _0x1af071 - _0x151898;
    }

    #_0x22cf5c(_0x105af5, _0x43e4dd) {
        _0x105af5 % _0x43e4dd > 0x0 && (_0x105af5 += _0x43e4dd - _0x105af5 % _0x43e4dd)
        return _0x105af5;
    }

    #decodeParam(_0x69fd2, _0x27b2ce) {
        return _0x69fd2 ? this.#_0x5ea49f(this.HEAPU8, _0x69fd2, _0x27b2ce) : '';
    }

    #_0x5ea49f(_0x588906, _0x3fa574, _0x3f49df) {
        for (var _0x384bd6 = _0x3fa574 + _0x3f49df, _0x64e5ec = _0x3fa574; _0x588906[_0x64e5ec] && !(_0x64e5ec >= _0x384bd6);)
            ++_0x64e5ec;
        if (_0x64e5ec - _0x3fa574 > 0x10 && _0x588906.subarray && this.textEncoder)
            return this.textEncoder.decode(_0x588906.subarray(_0x3fa574, _0x64e5ec));
        for (var _0x23f3f3 = ''; _0x3fa574 < _0x64e5ec;) {
            var _0x322e91 = _0x588906[_0x3fa574++];
            if (0x80 & _0x322e91) {
                var _0x393a0f = 0x3f & _0x588906[_0x3fa574++];
                if (0xc0 != (0xe0 & _0x322e91)) {
                    var _0x1093d2 = 0x3f & _0x588906[_0x3fa574++];
                    if (_0x322e91 = 0xe0 == (0xf0 & _0x322e91) ? (0xf & _0x322e91) << 0xc | _0x393a0f << 0x6 | _0x1093d2 : (0x7 & _0x322e91) << 0x12 | _0x393a0f << 0xc | _0x1093d2 << 0x6 | 0x3f & _0x588906[_0x3fa574++], _0x322e91 < 0x10000)
                        _0x23f3f3 += String.fromCharCode(_0x322e91);
                    else {
                        var _0xca855 = _0x322e91 - 0x10000;
                        _0x23f3f3 += String.fromCharCode(0xd800 | _0xca855 >> 0xa, 0xdc00 | 0x3ff & _0xca855);
                    }
                } else
                    _0x23f3f3 += String.fromCharCode((0x1f & _0x322e91) << 0x6 | _0x393a0f);
            } else
                _0x23f3f3 += String.fromCharCode(_0x322e91);
        }
        return _0x23f3f3;
    }

    #_0x309f86(_0x483075, _0x3a8ac4, _0x4179e5) {
        return this.#_0x722087(_0x483075, this.HEAPU8, _0x3a8ac4, _0x4179e5);
    }

    #grow(_0x159464) {
        try {
            this.memory.grow(_0x159464 - this.memory.buffer.byteLength + 0xffff >>> 0x10)
            this.#instantiateHeap(this.memory.buffer);

            return 1;
        } catch (e) {
            console.error(`WAssembly.grow -> ${e.stack.toString()}`)
        }
    }
}