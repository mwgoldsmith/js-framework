(function(){

function getTestObj() {
	return {
		A: 0x01,
		B: 0x02,
		C: 0x04,
		D: 0x08,
		E: 0x10 | 0x20
	};
}

function createTestFlags(defValue) {
	var obj = getTestObj();
	
	if (arguments.length) {
		return mdsol.BitFlags(obj, defValue);
	}
	
	return mdsol.BitFlags(obj);
}

module('mdsol.BitFlags');
  
test('requires a valid flags object passed to constructor', function() {
	var obj = {
		A: 1,
		B: 2,
		C: function () { },
		D: 8
	};
	
	raises(function () { var bitFlags = mdsol.BitFlags(); }, 'throws exception if no flags object is provided');
	raises(function () { var bitFlags = mdsol.BitFlags('string'); }, 'throws exception if non-object is provided');
	raises(function () { var bitFlags = mdsol.BitFlags(null); }, 'throws exception if null is provided');
	raises(function () { var bitFlags = mdsol.BitFlags({}); }, 'throws exception if empty flags object is provided');
	raises(function () { var bitFlags = mdsol.BitFlags(obj); }, 'throws exception if flags object with invalid data types is provided');
}); 

test('current flags value has default value of 0', function() {
	var bitFlags = createTestFlags();

	deepEqual(bitFlags.value(), 0, 'value is 0 if it has not been set');
}); 

test('value can be initialized via constructor by flag name / value() returns the current flag value', function() {
	var bitFlags = createTestFlags('B');

	deepEqual(bitFlags.value(), 0x02, 'created with an initial value by name');
}); 

test('value can be initialized via constructor by flag value / value() returns the current flag value', function() {
	var bitFlags = createTestFlags(0x02);
	
	deepEqual(bitFlags.value(), 0x02, 'created with an initial value by value');
});

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


}());