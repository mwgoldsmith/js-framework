/*global module,test,ok*/
(function (mdsol) {
    module('mdsol.ajax');

    test('contentTypeEnum', function () {
        ok(typeof mdsol.ajax.contentTypeEnum === 'object', 'exists');

        // TODO: Create tests
    });
    
    test('get', function () {
        ok(typeof mdsol.ajax.get === 'function', 'exists');

        // TODO: Create tests
    });

    test('post', function () {
        ok(typeof mdsol.ajax.post === 'function', 'exists');

        // TODO: Create tests
    });

} (window.mdsol));