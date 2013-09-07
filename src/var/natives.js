define(function () {
    return (function (map, undefined) {
        var objToString = ({}).toString,
            p, o;

        function natives(type) {
            return natives['[object ' + type.charAt(0).toUpperCase() + type.slice(1) + ']'];
        }

        for (p in map) {
            if (map.hasOwnProperty(p)) {
                o = map[p];
                if (o !== undefined && o !== null) {
                    natives[objToString.call(o)] = o.constructor.prototype;
                }
            }
        }

        return natives;
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