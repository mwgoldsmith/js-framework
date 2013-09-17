/*global extend*/
// @DONE (2013-09-17 11:03)
define([
    './core',
    './var/global'
], function (mdsol, global) {
    /*
    * Use IIFE to prevent cluttering of globals
    */
    (function () {
        var BASE64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

        /*
        * Encodes the specified string to Base 64.
        */
        function base64Encode(input) {
            var output = '',
                chr1, chr2, chr3,
                enc1, enc2, enc3,
                enc4, i = 0;

            input = global.escape(input);

            do {
                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);

                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;

                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }

                output = output +
                    BASE64.charAt(enc1) +
                    BASE64.charAt(enc2) +
                    BASE64.charAt(enc3) +
                    BASE64.charAt(enc4);

            } while (i < input.length);

            return output;
        }

        /*
        * Decodes the specified Base 64 string.
        */
        function base64Decode(input) {
            var fromCharCode = ''.fromCharCode,
                output = '',
                chr1, chr2, chr3,
                enc1, enc2, enc3,
                enc4, i = 0;

            // Verify the input only contains valid characters
            if (/[^A-Za-z0-9\+\/\=]/g.exec(input)) {
                return null;
            }

            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, '');

            do {
                enc1 = BASE64.indexOf(input.charAt(i++));
                enc2 = BASE64.indexOf(input.charAt(i++));
                enc3 = BASE64.indexOf(input.charAt(i++));
                enc4 = BASE64.indexOf(input.charAt(i++));

                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;

                output = output + fromCharCode(chr1);

                if (enc3 !== 64) {
                    output = output + fromCharCode(chr2);
                }
                if (enc4 !== 64) {
                    output = output + fromCharCode(chr3);
                }
            } while (i < input.length);

            return global.unescape(output);
        }
        
        extend(mdsol, {
            base64Encode: base64Encode,

            base64Decode: base64Decode
        });
    } ());
});