/*global module,test,ok*/
(function (mdsol) {

    module('mdsol.data.RemoteData');
    
    test('template', function () {
        var obj = mdsol.data.RemoteData();

        ok(typeof obj.template === 'function', 'exists');
    });
    
    test('methods', function() {
        var obj = mdsol.data.RemoteData();

        ok(typeof obj.methods === 'function', 'exists');
    });
    
    test('load', function() {
        var obj = mdsol.data.RemoteData();

        ok(typeof obj.load === 'function', 'exists');
    });
    
    test('save', function() {
        var obj = mdsol.data.RemoteData();

        ok(typeof obj.save === 'function', 'exists');
    });
    
    test('getMethod', function() {
        var obj = mdsol.data.RemoteData();

        ok(typeof obj.getMethod === 'function', 'exists');
    });
    
    test('dispose', function() {
        var obj = mdsol.data.RemoteData();

        ok(typeof obj.dispose === 'function', 'exists');
    });

} (window.mdsol));