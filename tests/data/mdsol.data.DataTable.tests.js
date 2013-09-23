/*global module,test,ok*/
(function (mdsol) {

    module('mdsol.data.DataTable');
    
    test('template', function () {
        var obj = mdsol.data.DataTable();

        ok(typeof obj.template === 'function', 'exists');
    });
    
    test('apiMethods', function() {
        var obj = mdsol.data.DataTable();

        ok(typeof obj.apiMethods === 'function', 'exists');
    });
    
    test('load', function() {
        var obj = mdsol.data.DataTable();

        ok(typeof obj.load === 'function', 'exists');
    });
    
    test('save', function() {
        var obj = mdsol.data.DataTable();

        ok(typeof obj.save === 'function', 'exists');
    });
    
    test('apiGetMethod', function() {
        var obj = mdsol.data.DataTable();

        ok(typeof obj.apiGetMethod === 'function', 'exists');
    });
    
    test('dispose', function() {
        var obj = mdsol.data.DataTable();

        ok(typeof obj.dispose === 'function', 'exists');
    });

} (window.mdsol));