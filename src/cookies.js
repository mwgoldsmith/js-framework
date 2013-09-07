define([
    './core',
    './var/global'
], function (mdsol, global) {
    extend(mdsol, {
        getCookie: function (name) {
            var cookies = global.document.cookie.split(';')
                .map(
                    function (x) { return x.trim().split(/(=)/); })
                .reduce(
                    function (a, b) {
                        a[b[0]] = a[b[0]] ? a[b[0]] + ', ' + b.slice(2).join('') : b.slice(2).join('');
                        return a;
                    }, {});

            return cookies[name];
        },

        setCookie: function (name, value, domain, expiration) {
            var expirePart = expiration ? '; expires=' + expiration : '',
                domainPart = domain ? '; domain=' + domain : '';

            global.document.cookie = name + '=' + value + expirePart + domainPart + '; path=/';

            return mdsol;
        },

        deleteCookie: function(name) {
            global.document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';

            return mdsol;
        }
    });
});
