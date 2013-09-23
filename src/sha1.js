define([
    './core'
], function (mdsol) {
    /*
    * Use IIFE to prevent cluttering of globals
    */
    (function () {
        function sha1Ft(t, b, c, d) {
            if (t < 20) {
                return (b & c) | ((~b) & d);
            }
            if (t < 40) {
                return b ^ c ^ d;
            }
            if (t < 60) {
                return (b & c) | (b & d) | (c & d);
            }
            return b ^ c ^ d;
        }

        function sha1Kt(t) {
            return (t < 20) ? 1518500249 : (t < 40) ? 1859775393 : (t < 60) ? -1894007588 : -899497514;
        }

        function bitRol(num, cnt) {
            return (num << cnt) | (num >>> (32 - cnt));
        }

        function str2RstrUtf8(input) {
            var output = '',
                i = -1,
                x,
                y;

            while (++i < input.length) {
                /* Decode utf-16 surrogate pairs */
                x = input.charCodeAt(i);
                y = i + 1 < input.length ? input.charCodeAt(i + 1) : 0;
                
                if (0xD800 <= x && x <= 0xDBFF && 0xDC00 <= y && y <= 0xDFFF) {
                    x = 0x10000 + ((x & 0x03FF) << 10) + (y & 0x03FF);
                    i++;
                }

                /* Encode output as utf-8 */
                if (x <= 0x7F) {
                    output += String.fromCharCode(x);
                } else if (x <= 0x7FF) {
                    output += String.fromCharCode(0xC0 | ((x >>> 6) & 0x1F),
                    0x80 | (x & 0x3F));
                } else if (x <= 0xFFFF) {
                    output += String.fromCharCode(0xE0 | ((x >>> 12) & 0x0F),
                    0x80 | ((x >>> 6) & 0x3F),
                    0x80 | (x & 0x3F));
                } else if (x <= 0x1FFFFF) {
                    output += String.fromCharCode(0xF0 | ((x >>> 18) & 0x07),
                    0x80 | ((x >>> 12) & 0x3F),
                    0x80 | ((x >>> 6) & 0x3F),
                    0x80 | (x & 0x3F));
                }
            }

            return output;
        }

        function binb2Rstr(input) {
            var output = '',
                i;

            for (i = 0; i < input.length * 32; i += 8) {
                output += String.fromCharCode((input[i >> 5] >>> (24 - i % 32)) & 0xFF);
            }

            return output;
        }
        
        function safeAdd(x, y) {
            var lsw = (x & 0xFFFF) + (y & 0xFFFF),
                msw = (x >> 16) + (y >> 16) + (lsw >> 16);

            return (msw << 16) | (lsw & 0xFFFF);
        }

        function binbSha1(x, len) {
            var w = [],
                a = 1732584193,
                b = -271733879,
                c = -1732584194,
                d = 271733878,
                e = -1009589776,
                i, j, t,
                olda, oldb, oldc,
                oldd, olde;

            x[len >> 5] |= 0x80 << (24 - len % 32);
            x[((len + 64 >> 9) << 4) + 15] = len;

            for (i = 0; i < x.length; i += 16) {
                olda = a;
                oldb = b;
                oldc = c;
                oldd = d;
                olde = e;

                for (j = 0; j < 80; j++) {
                    if (j < 16) {
                        w[j] = x[i + j];
                    } else {
                        w[j] = bitRol(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1);
                    }

                    t = safeAdd(safeAdd(bitRol(a, 5), sha1Ft(j, b, c, d)), safeAdd(safeAdd(e, w[j]), sha1Kt(j)));
                    e = d;
                    d = c;
                    c = bitRol(b, 30);
                    b = a;
                    a = t;
                }

                a = safeAdd(a, olda);
                b = safeAdd(b, oldb);
                c = safeAdd(c, oldc);
                d = safeAdd(d, oldd);
                e = safeAdd(e, olde);
            }

            return [a, b, c, d, e];
        }

        function rstr2Binb(input) {
            var output = [],
                i;

            output.length = input.length >> 2;
            for (i = 0; i < output.length; i++) {
                output[i] = 0;
            }

            for (i = 0; i < input.length * 8; i += 8) {
                output[i >> 5] |= (input.charCodeAt(i / 8) & 0xFF) << (24 - i % 32);
            }

            return output;
        }

        function rstrSha1(s) {
            return binb2Rstr(binbSha1(rstr2Binb(s), s.length * 8));
        }

        function rstrHmacSha1(key, data) {
            var bkey = rstr2Binb(key),
                hash,
                ipad = [],
                opad = [],
                i;

            if (bkey.length > 16) {
                bkey = binbSha1(bkey, key.length * 8);
            }

            for (i = 0; i < 16; i++) {
                ipad[i] = bkey[i] ^ 0x36363636;
                opad[i] = bkey[i] ^ 0x5C5C5C5C;
            }

            hash = binbSha1(ipad.concat(rstr2Binb(data)), 512 + data.length * 8);

            return binb2Rstr(binbSha1(opad.concat(hash), 512 + 160));
        }

        function rstr2Hex(input) {
            var hexTab = '0123456789ABCDEF',
                output = '',
                x,
                i;

            for (i = 0; i < input.length; i++) {
                x = input.charCodeAt(i);
                output += hexTab.charAt((x >>> 4) & 0x0F) + hexTab.charAt(x & 0x0F);
            }
            return output;
        }

        extend(mdsol, {
            sha1: function (data) {
                return rstr2Hex(rstrSha1(str2RstrUtf8(data)));
            },

            hmacSha1: function (key, data) {
                return rstr2Hex(rstrHmacSha1(str2RstrUtf8(key), str2RstrUtf8(data)));
            }
        });
    } ());
});