// @DONE (2013-09-17 09:20)
define(function () {
    return (function () {
        var toString = ({}).toString,
            map = {
                'String': '',
                'Number': 0,
                'Date': new Date(),
                'Boolean': true,
                'RegExp': /./,
                'Array': [],
                'Object': {},
                'Function': function () {}
            },
            hash = {},
            type, value;

        for (type in map) {
            value = map.hasOwnProperty(type) && map[type];
            if (value) {
                hash[toString.call(value)] = value.constructor.prototype;
            }
        }

        return hash;
    } ());
});