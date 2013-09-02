(function(){

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
  
test('requires a valid enum object passed to constructor', function() {
	var obj = {
		A: 1,
		B: 2,
		C: function () { },
		D: 4
	};
	
	raises(function () { var e = mdsol.Enum(); }, 'throws exception if no enum object is provided');
	raises(function () { var e = mdsol.Enum('string'); }, 'throws exception if non-object is provided');
	raises(function () { var e = mdsol.Enum(null); }, 'throws exception if null is provided');
	raises(function () { var e = mdsol.Enum({}); }, 'throws exception if empty enum object is provided');
	raises(function () { var e = mdsol.Enum(obj); }, 'throws exception if enum object with invalid data types is provided');
}); 

test('current enum value has default value of null', function() {
	var e = createTestEnum();

	deepEqual(e.value(), null, 'value is null if it has not been set');
}); 

test('constructor can initialize current value by enum name / value() returns the current enum value', function() {
	var e = createTestEnum('B');

	deepEqual(e.value(), 2, 'created with an initial value by name');
}); 

test('constructor can initialize current value by enum value / value() returns the current enum value', function() {
	var e = createTestEnum(2);
	
	deepEqual(e.value(), 2, 'created with an initial value by value');
});

test('constructor does not permit an invalid enum name or value to initizialize the current enum value', function() {
	raises(function () { var e = createTestEnum(10); }, 'throws exception if invalid enum value provided');
	raises(function () { var e = createTestEnum('Z'); }, 'throws exception if invalid enum name is provided');
	raises(function () { var e = createTestEnum({}); }, 'throws exception if invalid data type is provided');
}); 

test('valueOf() returns enum object', function() {
	var e = createTestEnum(),
	    obj = getTestObj();
	
	deepEqual(e.valueOf(), obj, 'original enum object can be retreived');
});

test('toString() returns name of current enum value', function() {
	var e = createTestEnum(1);
	
	deepEqual(e.toString(), 'A', 'name of current enum value can be retreived');
});

test('value() can set the current enum value by a given enum name', function() {
	var e = createTestEnum();
	
	e.value('A');
	
	deepEqual(e.value(), 1, 'current enum value can be set by name');
});

test('value() can set the current enum value by a given enum value', function() {
	var e = createTestEnum();
	
	e.value(1);
	
	deepEqual(e.value(), 1, 'current enum value can be set by value');
});

test('value() can set the current enum value to null', function() {
	var e = createTestEnum();
	
	e.value(null);
	
	deepEqual(e.value(), null, 'current enum value can be set to null');
});

test('value() does not permit an invalid enum name or value to be set', function() {
	var e = createTestEnum();
	
	raises(function() { return e.value(0); }, 'throws exception when trying to set invalid enum value');
	raises(function() { return e.value('FIFTH'); }, 'throws exception when trying to set invalid enum name');
});

test('test() can detect if the current enum value is the same as the passed parameter', function() {
	var e = createTestEnum(2);

	deepEqual(e.test(2), true, 'can detect match by value');
	deepEqual(e.test(1), false, 'can detect non-match by value');
	deepEqual(e.test('B'), true, 'can detect match by name');
	deepEqual(e.test('A'), false, 'can detect non-match by name');
	raises(function() { return e.test(10); }, 'throws exception when trying to match invalid value');
	raises(function() { return e.test('ELEVENTEEN'); }, 'throws exception when trying to match invalid name ');
});

}());