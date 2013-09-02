(function(){

function getTestConstructor() {
 	function TestConstructor(args) {
		var _private = args;
		
		this.propShared = 'this:TestConstructor';
		this.objPropA = 1;
		this.objPropB = '1';
		this.objGetPrivate = function() { return _private; };
	};
	
	return TestConstructor;
}
function getTestConstructorWithBase() {
 	function TestConstructorWithBase(args) {
		var _private = args;
		
		this.propShared = 'this:TestConstructorWithBase';
		this.objPropA = 1;
		this.objPropB = '1';
		this.objGetPrivate = function() { return _private; };
		this.objSetPrivate = function(funcArgs) { _private = funcArgs; };
		this.sharedGetPrivate = function() { return  mdsol.Class.base.call(this); };
		this.sharedSetPrivate = function() { return  mdsol.Class.base.apply(this, arguments); };
		
        return mdsol.Class(this).base(args);
	};
	
	return TestConstructorWithBase;
}

function getTestBaseConstructor() {
	function BaseTestConstructor(args) {
		var _private = args;
		
		this.propShared = 'this:BaseTestConstructor';
		this.basePropA = 3;
		this.basePropB = 'C';
		this.basePropArgs = args;
		this.baseGetPrivate = function() { return _private; };
		this.baseSetPrivate = function(funcArgs) { _private = funcArgs; };
		this.sharedGetPrivate = function() { return _private; };
		this.sharedSetPrivate = function(funcArgs) { _private = funcArgs; };
	};
	
	return BaseTestConstructor;
}

module('mdsol.Class');
  
test('requires a valid constructor object', function() {
	raises(function () { var Constructor = mdsol.Class(); }, 'throws exception if no constructor object is provided');
	raises(function () { var Constructor = mdsol.Class('string'); }, 'throws exception if non-object data type is provided');
	raises(function () { var Constructor = mdsol.Class(null); }, 'throws exception if null is provided');
	raises(function () { var Constructor = mdsol.Class({}); }, 'throws exception if empty object object is provided');
}); 

test('valueOf returns the constructor of the "class" built', function() {
	var testConstructor = getTestConstructor(),
	    result = mdsol.Class(testConstructor).valueOf();
	
	deepEqual(result, testConstructor, 'constructor can be retreived');
}); 

test('can be provided an optional object literal to extend the constructor prototype', function() {
	var TestConstructor = getTestConstructor(),
		ExpectedConstructor = getTestConstructor(),
		testProto = {
			protoPropA: 2,
			protoPropB: '3',
			protoPropC: []
		},
		expectedProto = {
			protoPropA: 2,
			protoPropB: '3',
			protoPropC: [],
			protoPropD: function() { }
		};
	
	TestConstructor.prototype.protoPropD = function() { };
	
	var result = mdsol.Class(TestConstructor, testProto).valueOf();
	
	propEqual(result.prototype, expectedProto, 'prototype can be extended');
	notPropEqual(result.prototype, testProto, 'existing prototype properties are not removed');
	propEqual(TestConstructor, ExpectedConstructor, 'constructor is not altered');
}); 

test('optional extension to prototype must be valid', function() {
	var TestConstructor = getTestConstructor();
	
	function ConstructorFunction () {
		this.property = 1;
	};
	
	raises(function () { var Constructor = mdsol.Class(TestConstructor, 'string'); }, 'throws exception if no constructor object is provided');
	raises(function () { var Constructor = mdsol.Class(TestConstructor, ConstructorFunction); }, 'throws exception constructor function is provided');
	raises(function () { var Constructor = mdsol.Class(TestConstructor, null); }, 'throws exception if null is provided');
}); 

test('constructor can inherit from a base constructor', function() {
	var baseProto = {
		propShared: 'proto:BaseTestConstructor',
		protoBasePropA: 4,
		protoBasePropB: 'D',
		protoBaseGetPropShared: function() { return this.propShared; }
	}, testProto = {
		propShared: 'proto:TestConstructor',
		protoPropA: 2,
		protoPropB: 'B'
	};
	
	var BaseTestConstructor = getTestBaseConstructor(),
	    NewBaseConstructor = mdsol.Class(BaseTestConstructor, baseProto).valueOf(),
	    TestConstructor = getTestConstructor(),
		NewConstructor = mdsol.Class(TestConstructor, testProto).inherits(NewBaseConstructor).valueOf();
		
	var result = new NewConstructor();

	strictEqual(result.protoBasePropA, 4, 'inherited property can created');
	
	var protoChainResult;
	protoChainResult = result.propShared === 'this:TestConstructor';
	result = Object.getPrototypeOf(result);
	protoChainResult = protoChainResult && result.propShared === 'proto:TestConstructor';
	result = Object.getPrototypeOf(result); 
	protoChainResult = protoChainResult && result.propShared === 'proto:BaseTestConstructor';
	
	equal(protoChainResult, true, 'prototype chain of child and parent are created correctly');
});

test('base constructer can be invoked from child object', function() {
	var baseProto = {
		propShared: 'proto:BaseTestConstructor',
		protoBasePropA: 4,
		protoBasePropB: 'D',
		protoBaseGetPropShared: function() { return this.propShared; }
	}, testProto = {
		propShared: 'proto:TestConstructor',
		protoPropA: 2,
		protoPropB: 'B'
	};
	
	var BaseTestConstructor = getTestBaseConstructor(),
	    NewBaseConstructor = mdsol.Class(BaseTestConstructor, baseProto).valueOf(),
	    TestConstructor = getTestConstructorWithBase(),
		NewConstructor = mdsol.Class(TestConstructor, testProto).inherits(NewBaseConstructor).valueOf();
		
	var result = new NewConstructor('arg');
	
	strictEqual(result.basePropA, 3, 'base constructor is called');
	strictEqual(result.propShared, 'this:BaseTestConstructor', 'this of base constructor is in context of parent object');
	strictEqual(result.basePropArgs, 'arg', 'arguments are passed to base constructor');
});

test('multiple instances can be created', function() {
	var baseProto = {
		propShared: 'proto:BaseTestConstructor',
		protoBasePropA: 4,
		protoBasePropB: 'D',
		protoBaseGetPropShared: function() { return this.propShared; }
	}, testProto = {
		propShared: 'proto:TestConstructor',
		protoPropA: 2,
		protoPropB: 'B'
	};
	
	var BaseTestConstructor = getTestBaseConstructor(),
	    NewBaseConstructor = mdsol.Class(BaseTestConstructor, baseProto).valueOf(),
	    TestConstructor = getTestConstructorWithBase(),
		NewConstructor = mdsol.Class(TestConstructor, testProto).inherits(NewBaseConstructor).valueOf();
		
	var resultA = new NewConstructor('argA'),
		resultB = new NewConstructor('argB'),
		result;
	
	result = resultA.baseGetPrivate() === 'argA' && resultB.baseGetPrivate() === 'argB';
	resultA.baseSetPrivate('newA');
	resultB.baseSetPrivate('newB');
	result = result && resultA.baseGetPrivate() === 'newA' && resultB.baseGetPrivate() === 'newB';
	
	equal(result, true, 'multiple instances maintain sepatate private variables');
	
	resultA.propShared = 'changed';
	strictEqual(resultA.protoBaseGetPropShared(), 'changed', 'this of base prototype method is in context of parent object');
});

/*
test('constructor does not permit an invalid flag name or value to initizialize the current flag value', function() {
	raises(function () { var e = createTestFlags(0x40); }, 'throws exception if invalid flag value provided');
	raises(function () { var e = createTestFlags('Z'); }, 'throws exception if invalid flag name is provided');
	raises(function () { var e = createTestFlags({}); }, 'throws exception if invalid data type is provided');
}); 

test('valueOf() returns flag object', function() {
	var bitFlags = createTestFlags(),
	    obj = getTestObj();
	
	deepEqual(bitFlags.valueOf(), obj, 'original flag object can be retreived');
});

test('toString() returns names of current bit flag values', function() {
	var bitFlags = createTestFlags(['A', 'C', 'E']);
	
	deepEqual(bitFlags.toString(), 'A,C,E', 'names of current bit flag values can be retreived');
});

test('value() can set the current flag value by given flag names', function() {
	var bitFlags = createTestFlags();
	
	bitFlags.value('A', 'C', 'D');
	
	deepEqual(bitFlags.value(), 0x01 | 0x04 | 0x08, 'current flag value can be set by names');
});

test('value() can set the current flag value by given flag values', function() {
	var bitFlags = createTestFlags(),
	    v = 0x01 | 0x04 | 0x08;
	
	bitFlags.value(0x01, 0x04, 0x08);
	
	deepEqual(bitFlags.value(), v, 'current flag value can be set by values');
});

test('value() can set the current value to 0', function() {
	var bitFlags = createTestFlags();
	
	bitFlags.value(0);
	
	deepEqual(bitFlags.value(), 0, 'current flag value can be set to 0');
});

test('value() does not permit an invalid flag name or value to be set', function() {
	var bitFlags = createTestFlags();
	
	raises(function() { return bitFlags.value(0x80); }, 'throws exception when passed an invalid value');
	raises(function() { return bitFlags.value('R'); }, 'throws exception when passed an invalid name');
});

test('test() can detect if every passed parameter is a flag set in the current flag value', function() {
	var bitFlags = createTestFlags(['A', 'B', 'C']);

	deepEqual(bitFlags.test(0x01, 0x02, 0x04), true, 'can detect match by value');
	deepEqual(bitFlags.test(0x01, 0x02, 0x10), false, 'can detect non-match by value');
	deepEqual(bitFlags.test('A', 'B', 'C'), true, 'can detect match by name');
	deepEqual(bitFlags.test('A', 'B', 'E'), false, 'can detect non-match by name');
	raises(function() { return bitFlags.test(0x80); }, 'throws exception when passed an invalid value');
	raises(function() { return bitFlags.test('Q'); }, 'throws exception when passed an invalid name ');
});

test('testAny() can detect if any one of the passed parameters is a flag set in the current flag value', function() {
	var bitFlags = createTestFlags(['A', 'B', 'C']);

	deepEqual(bitFlags.testAny(0x08, 0x02, 0x10), true, 'can detect match by value');
	deepEqual(bitFlags.testAny(0x08, 0x10, 0x20), false, 'can detect non-match by value');
	deepEqual(bitFlags.testAny('D', 'E', 'A'), true, 'can detect match by name');
	deepEqual(bitFlags.testAny('D', 'E'), false, 'can detect non-match by name');
	raises(function() { return bitFlags.testAny(0x01, 0x80, 0x02); }, 'throws exception when passed an invalid value');
	raises(function() { return bitFlags.testAny('A', 'Q', 'B'); }, 'throws exception when passed an invalid name ');
});

test('equals() can detect if all of the passed parameters are flags equal to the current flag value', function() {
	var bitFlags = createTestFlags(['A', 'B', 'C']);

	deepEqual(bitFlags.equals(0x04, 0x02, 0x01), true, 'can detect match by value');
	deepEqual(bitFlags.equals(0x10, 0x01, 0x02), false, 'can detect non-match by value');
	deepEqual(bitFlags.equals('B', 'A', 'C'), true, 'can detect match by name');
	deepEqual(bitFlags.equals('D', 'A', 'C'), false, 'can detect non-match by name');
	raises(function() { return bitFlags.equals(0x01, 0x80, 0x02); }, 'throws exception when passed an invalid value');
	raises(function() { return bitFlags.equals('A', 'Q', 'B'); }, 'throws exception when passed an invalid name ');
});

*/
}());