define([
	'./toString'
], function () {
    return (function (isArray) {
        return typeof isArray === 'function'
            ? isArray
            : function(obj) {
                return toString.call(obj) === '[object Array]';
            };
    } ([].constructor.isArray));
});