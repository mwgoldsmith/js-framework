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
        function getCookie(name) {
            var cookies = global.document.cookie.split(';')
                .map(
                    function (x) { return x.trim().split(/(=)/); })
                .reduce(
                    function (a, b) {
                        a[b[0]] = a[b[0]] ? a[b[0]] + ', ' + b.slice(2).join('') : b.slice(2).join('');
                        return a;
                    }, {});

            return cookies[name];
        }

        function setCookie(name, value, domain, expiration) {
            global.document.cookie = name + '=' + value 
                + (expiration ? '; expires=' + expiration : '') 
                + (domain ? '; domain=' + domain : '') 
                + '; path=/';

            return mdsol;
        }

        function deleteCookie(name) {
            global.document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';

            return mdsol;
        }
        
        extend(mdsol, {
            getCookie: getCookie,

            setCookie: setCookie,

            deleteCookie: deleteCookie
        });
    } ());
});
