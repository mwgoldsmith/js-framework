define(function () {
    return (function (map) {
        var hash = {},
            objToString = ({}).toString,
            p, o;

        for (p in map) {
            if (map.hasOwnProperty(p)) {
                o = map[p];
                if (o !== undefined && o !== null) {
                    hash[objToString.call(o)] = o.constructor.prototype;
                }
            }
        }

        return hash;
    } ({
        'Null': null,
        'Undefined': undefined,
        'String': '',
        'Number': 0,
        'Date': new Date(),
        'Boolean': true,
        'RegExp': /./,
        'Array': [],
        'Object': {},
        'Function': function () { }
    }));
});