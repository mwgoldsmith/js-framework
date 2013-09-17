/*global module,test,raises,ok,equal,deepEqual,propEqual,notPropEqual,strictEqual*/

(function (mdsol) {

    function getTestConstructor() {
        function TestConstructor(args) {
            var _private = args;

            this.propShared = 'this:TestConstructor';
            this.objPropA = 1;
            this.objPropB = '1';
            this.objGetPrivate = function () { return _private; };
        }

        return TestConstructor;
    }

    function getTestPrototype() {
        return {
            propShared: 'proto:TestConstructor',
            protoPropA: 2,
            protoPropB: 'B'
        };
    }

    function getTestConstructorWithBase() {

        function TestConstructorWithBase(args) {
            var _private = args;

            this.propShared = 'this:TestConstructorWithBase';
            this.objPropA = 1;
            this.objPropB = '1';
            this.objGetPrivate = function () { return _private; };
            this.objSetPrivate = function (funcArgs) { _private = funcArgs; };
            this.sharedGetPrivate = function () {
                return mdsol.Class.base(this, 'sharedGetPrivate');
            };

            this.sharedSetPrivate = function () {
                var a = Array.prototype.slice.apply(arguments);
                return mdsol.Class.base.apply(this, [this, 'sharedSetPrivate'].concat(a));
            };

            this.objFailFunc = function () {
                var a = Array.prototype.slice.apply(arguments);
                return mdsol.Class.base.apply(this, [this, 'sharedSetPrivate'].concat(a));
            };

            return mdsol.Class(this).base(args);
        }

        return TestConstructorWithBase;
    }

    function getBasePrototype() {
        return {
            propShared: 'proto:BaseTestConstructor',
            protoBasePropA: 4,
            protoBasePropB: 'D',
            protoBaseGetPropShared: function () { return this.propShared; }
        };
    }

    function getTestBaseConstructor() {
        function BaseTestConstructor(args) {
            var _private = args;

            this.propShared = 'this:BaseTestConstructor';
            this.basePropA = 3;
            this.basePropB = 'C';
            this.basePropArgs = args;
            this.baseGetPrivate = function () { return _private; };
            this.baseSetPrivate = function (funcArgs) { _private = funcArgs; };
            this.sharedGetPrivate = function () { return _private; };
            this.sharedSetPrivate = function (funcArgs) { _private = funcArgs; };
        }

        return BaseTestConstructor;
    }

    module('mdsol.Class');

    test('requires a valid constructor object', function () {
        raises(function () { mdsol.Class(); }, 'throws exception if no constructor object is provided');
        raises(function () { mdsol.Class('string'); }, 'throws exception if non-object data type is provided');
        raises(function () { mdsol.Class(null); }, 'throws exception if null is provided');
        raises(function () { mdsol.Class({}); }, 'throws exception if object literal is provided');
    });

    test('valueOf returns the constructor of the "class" built', function () {
        var testConstructor = getTestConstructor(),
            result = mdsol.Class(testConstructor).valueOf();

        deepEqual(result, testConstructor, 'constructor can be retreived');
    });

    test('can be provided an optional object literal to extend the constructor prototype', function () {
        var TestConstructor = getTestConstructor(),
            testProto = getTestPrototype(),
            ExpectedConstructor = getTestConstructor(),
            expectedProto = getTestPrototype(),
            result;

        expectedProto.protoPropD = function () { };

        TestConstructor.prototype.protoPropD = function () { };

        result = mdsol.Class(TestConstructor, testProto).valueOf();

        propEqual(result.prototype, expectedProto, 'prototype can be extended');
        notPropEqual(result.prototype, testProto, 'existing prototype properties are not removed');
        propEqual(TestConstructor, ExpectedConstructor, 'constructor is not altered');
    });

    test('optional extension to prototype must be valid', function () {
        var TestConstructor = getTestConstructor();

        function ConstructorFunction() {
            this.property = 1;
        }

        raises(function () { mdsol.Class(TestConstructor, 'string'); }, 
            'throws exception if no constructor object is provided');
        raises(function () { mdsol.Class(TestConstructor, ConstructorFunction); }, 
            'throws exception constructor function is provided');
        raises(function () { mdsol.Class(TestConstructor, null); }, 
            'throws exception if null is provided');
    });

    test('constructor can inherit from a base constructor', function () {
        var BaseTestConstructor = getTestBaseConstructor(),
            baseProto = getBasePrototype(),
            NewBaseConstructor = mdsol.Class(BaseTestConstructor, baseProto).valueOf(),
            TestConstructor = getTestConstructor(),
            testProto = getTestPrototype(),
            NewConstructor = mdsol.Class(TestConstructor, testProto).inherits(NewBaseConstructor).valueOf(),
            result,
            protoChainResult;

        raises(function () { mdsol.Class(TestConstructor, testProto).inherits('string').valueOf(); },
            'throws exception if invalid data type provided');
        raises(function () { mdsol.Class(TestConstructor, testProto).inherits(null).valueOf(); },
            'throws exception if invalid null provided');
        raises(function () { mdsol.Class(TestConstructor, testProto).inherits({}).valueOf(); }, 
            'throws exception if object literal provided');

        result = new NewConstructor();

        strictEqual(result.protoBasePropA, 4, 'inherited property can be created');
        ok(result instanceof BaseTestConstructor, 'instanceof can detect constructor');
        ok(result instanceof TestConstructor, 'instanceof can detect base constructor');

        protoChainResult = result.propShared === 'this:TestConstructor';
        result = Object.getPrototypeOf(result);
        protoChainResult = protoChainResult && result.propShared === 'proto:TestConstructor';
        result = Object.getPrototypeOf(result);
        protoChainResult = protoChainResult && result.propShared === 'proto:BaseTestConstructor';

        ok(protoChainResult, 'prototype chain of child and parent are created correctly');
    });

    test('base constructer can be invoked from child object', function () {
        var baseProto = {
            propShared: 'proto:BaseTestConstructor',
            protoBasePropA: 4,
            protoBasePropB: 'D',
            protoBaseGetPropShared: function () { return this.propShared; }
        }, testProto = {
            propShared: 'proto:TestConstructor',
            protoPropA: 2,
            protoPropB: 'B'
        },
            BaseTestConstructor = getTestBaseConstructor(),
            NewBaseConstructor = mdsol.Class(BaseTestConstructor, baseProto).valueOf(),
            TestConstructor = getTestConstructorWithBase(),
            NewConstructor = mdsol.Class(TestConstructor, testProto).inherits(NewBaseConstructor).valueOf(),
            result;

        result = new NewConstructor('arg');

        strictEqual(result.basePropA, 3, 'base constructor is called');
        equal(result.propShared, 'this:BaseTestConstructor', 'this of base constructor is in context of parent object');
        equal(result.basePropArgs, 'arg', 'arguments are passed to base constructor');
    });

    test('multiple instances can be created', function () {
        var BaseTestConstructor = getTestBaseConstructor(),
            baseProto = getBasePrototype(),
            NewBaseConstructor = mdsol.Class(BaseTestConstructor, baseProto).valueOf(),
            TestConstructor = getTestConstructorWithBase(),
            testProto = getTestPrototype(),
            NewConstructor = mdsol.Class(TestConstructor, testProto).inherits(NewBaseConstructor).valueOf(),
            resultA = new NewConstructor('argA'),
            resultB = new NewConstructor('argB'),
            success;

        success = resultA.baseGetPrivate() === 'argA' && resultB.baseGetPrivate() === 'argB';
        resultA.baseSetPrivate('newA');
        resultB.baseSetPrivate('newB');
        success = success && resultA.baseGetPrivate() === 'newA' && resultB.baseGetPrivate() === 'newB';

        ok(success, 'multiple instances maintain sepatate private variables');

        resultA.propShared = 'changed';
        equal(resultA.protoBaseGetPropShared(), 'changed', 'this of base prototype method is in context of parent object');
    });

    test('child object can invoke base object object methods', function () {
        var BaseTestConstructor = getTestBaseConstructor(),
            baseProto = getBasePrototype(),
            NewBaseConstructor = mdsol.Class(BaseTestConstructor, baseProto).valueOf(),
            TestConstructor = getTestConstructorWithBase(),
            testProto = getTestPrototype(),
            NewConstructor = mdsol.Class(TestConstructor, testProto).inherits(NewBaseConstructor).valueOf(),
            result = new NewConstructor('arg'),
            success;

        result.objSetPrivate('object');
        result.sharedSetPrivate('base');

        success = result.baseGetPrivate() === 'base' &&
        result.sharedGetPrivate() === 'base' &&
        result.objGetPrivate() === 'object';

        ok(success, 'method call can call base object method of same name.');
        raises(function () { result.objFailFunc('base'); }, 'throws exception if attempt to call base method of different name');
    });

} (window.mdsol));