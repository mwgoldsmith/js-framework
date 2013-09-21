/*global module,test,raises,ok,deepEqual*/
(function (mdsol) {
    function getTestObj() {
        return {
            A: 1,
            B: 2,
            C: 3,
            D: 4
        };
    }

    function createTestEnum(defValue) {
        var obj = getTestObj();

        if (arguments.length) {
            return mdsol.Enum(obj, defValue);
        }

        return mdsol.Enum(obj);
    }

    module('mdsol.Enum');

    test('requires a valid enum object passed to constructor', function () {
        var obj = {
            A: 1,
            B: 2,
            C: function () { },
            D: 4
        };

        raises(function () { mdsol.Enum(); }, 'throws exception if no enum object is provided');
        raises(function () { mdsol.Enum('string'); }, 'throws exception if non-object is provided');
        raises(function () { mdsol.Enum(null); }, 'throws exception if null is provided');
        raises(function () { mdsol.Enum({}); }, 'throws exception if empty enum object is provided');
        raises(function () { mdsol.Enum(obj); }, 'throws exception if enum object with invalid data types is provided');
    });

    test('current enum value has default value of null', function () {
        var e = createTestEnum();

        strictEqual(e.value(), null, 'value is null if it has not been set');
    });

    test('constructor can initialize current value by enum name / value() returns the current enum value', function () {
        var e = createTestEnum('B');

        strictEqual(e.value(), 2, 'created with an initial value by name');
    });

    test('constructor can initialize current value by enum value / value() returns the current enum value', function () {
        var e = createTestEnum(2);

        strictEqual(e.value(), 2, 'created with an initial value by value');
    });

    test('constructor does not permit an invalid enum name or value to initizialize the current enum value', function () {
        raises(function () { createTestEnum(10); }, 'throws exception if invalid enum value provided');
        raises(function () { createTestEnum('Z'); }, 'throws exception if invalid enum name is provided');
        raises(function () { createTestEnum({}); }, 'throws exception if invalid data type is provided');
    });

    test('valueOf() returns enum object', function () {
        var e = createTestEnum(),
            obj = getTestObj(),
            result = e.valueOf();
        
        deepEqual(result, obj, 'original enum object can be retreived');
    });

    test('toString() returns name of current enum value', function () {
        var e = createTestEnum(1);

        strictEqual(e.toString(), 'A', 'name of current enum value can be retreived');
    });

    test('value() can set the current enum value by a given enum name', function () {
        var e = createTestEnum();

        e.value('A');

        strictEqual(e.value(), 1, 'current enum value can be set by name');
    });

    test('value() can set the current enum value by a given enum value', function () {
        var e = createTestEnum();

        e.value(1);

        strictEqual(e.value(), 1, 'current enum value can be set by value');
    });

    test('value() can set the current enum value to null', function () {
        var e = createTestEnum();

        e.value(null);

        strictEqual(e.value(), null, 'current enum value can be set to null');
    });

    test('value() does not permit an invalid enum name or value to be set', function () {
        var e = createTestEnum();

        raises(function () { e.value(0); }, 'throws exception when trying to set invalid enum value');
        raises(function () { e.value('FIFTH'); }, 'throws exception when trying to set invalid enum name');
    });

    test('test() can detect if the current enum value is the same as the passed parameter', function () {
        var e = createTestEnum(2);

        ok(e.test(2), 'can detect match by value');
        ok(!e.test(1), 'can detect non-match by value');
        ok(e.test('B'), 'can detect match by name');
        ok(!e.test('A'), 'can detect non-match by name');
        raises(function () { e.test(10); }, 'throws exception when trying to match invalid value');
        raises(function () { e.test('ELEVENTEEN'); }, 'throws exception when trying to match invalid name ');
    });

} (window.mdsol));