/*global module,test,ok*/
(function (mdsol) {
    var BASE_URL = 'http://dlcdkpcs1.ad.mdsol.com/api/Services/';

    function setupMockjax(service, method, delay) {
        $.mockjax({
            url: BASE_URL + service + '.asmx/' + method,
            contentType: 'application/json',
            responseTime: delay || 100,
            response: function (settings) {
                var data = eval('d = ' + settings.data),
                    params = [], values = [], p;

                for (p in data) {
                    params.push('\\"' + p + '\\"');
                    values.push('\\"' + data[p] + '\\"');
                }

                this.responseText = '{"d":"[{\\"params\\":[' + params.join(',') + '],\\"values\\":[' + values.join(',') + ']}]"}';
            }
        });
    }

    module('mdsol.ajax.Method');

    test('statusFlags', function () {
        var toString = Object.prototype.toString;

        ok(toString.call(mdsol.ajax.Method.statusFlags) === '[object Object]', 'exists');
    });

    test('status', function () {
        var obj = mdsol.ajax.Method();

        ok(obj.status instanceof mdsol.BitFlags, 'is an instantiated BitFlags object');
        ok(obj.status.equals('NONE'), 'default value is NONE');
    });

    test('service()', function () {
        var obj = mdsol.ajax.Method('service', 'method', 'params');

        equal(obj.service(), 'service', 'service can be retreived');

        obj.service('changed service');

        equal(obj.service(), 'changed service', 'service can be modified');
    });

    test('method()', function () {
        var obj = mdsol.ajax.Method('service', 'method', 'params');

        equal(obj.method(), 'method', 'method can be retreived');

        obj.method('changed method');

        equal(obj.method(), 'changed method', 'method can be modified');
    });

    test('params()', function () {
        var obj = mdsol.ajax.Method('service', 'method', 'params'),
            objArray;

        deepEqual(obj.params(), ['params'], 'Initialzed with single parameter');

        objArray = mdsol.ajax.Method('service', 'method', ['param 1', 'param 2']);
        deepEqual(objArray.params(), ['param 1', 'param 2'], 'Initialzed with multiple parameters as array');

        obj.params(null);
        deepEqual(obj.params(), [], 'Null');

        obj.params('changed params');
        deepEqual(obj.params(), ['changed params'], 'Set single parameter as non-array');

        obj.params('changed params', 'another');
        deepEqual(obj.params(), ['changed params', 'another'], 'Set multiple parameters as non-array');

        obj.params(['changed params']);
        deepEqual(obj.params(), ['changed params'], 'Set single parameter as array');

        obj.params(['changed params', 'another']);
        deepEqual(obj.params(), ['changed params', 'another'], 'Set multiple parameters as array');
    });

    test('callback()', function () {
        var func = function () { },
            obj = mdsol.ajax.Method();
        
        obj.callback(func);
        ok(obj.callback() === func, 'Function');

        obj.callback('');
        ok(obj.callback() === null, 'String');

        obj.callback({});
        ok(obj.callback() === null, 'Object literal');

        obj.callback(null);
        ok(obj.callback() === null, 'Null');
    });

    asyncTest('execute([params, ...])', 9, function () {
        var obj = mdsol.ajax.Method('TestService', 'TestMethod', ['paramNameA', 'paramNameB', 'paramNameC']),
            result = [{ params: ["paramNameA", "paramNameB", "paramNameC"], values: ["1", "2", "3"]}],
            $fixture = $('#qunit-fixture'),
            counter = 0;

        setupMockjax('TestService', 'TestMethod', 1000);

        function methodCallback(success, data, xhrMethod) {
            var visible = $('div', $fixture).first().css('display') !== 'none';

            // Decrement count of outstanding ajax calls
            counter--;

            if (counter) {
                if (counter === 2) {
                    ok(true, 'callback is called');
                    deepEqual(data, result, 'parameters passed as expected');
                    start();
                }

                ok(visible, 'div indicator is still visible');
            } else {
                ok(!visible, 'div indicator is not visible');

                $.mockjaxClear();
            }
        }

        function executeMethod() {
            obj.execute(1, 2, 3);
            counter++;
        }

        mdsol.ajax.container($fixture);
        obj.callback(methodCallback);
        executeMethod();
        executeMethod();
        executeMethod();

        start();

        ok($('div', $fixture).length === 1, 'div indicator is created');
        ok($('div', $fixture).first().css('display') !== 'none', 'div indicator is visible');

        raises(function () { obj.execute(1, 2, 3, 4); }, 'throws exception if too many parameters');
        raises(function () { obj.execute(1, 2); }, 'throws exception if too few parameters');
        stop();
    });

    asyncTest('execute(callback, [params, ...])', 4, function () {
        var obj = mdsol.ajax.Method('TestService', 'TestMethod', ['paramNameA', 'paramNameB', 'paramNameC']),
            result = [{ params: ["paramNameA", "paramNameB", "paramNameC"], values: ["1", "2", "3"]}],
            $fixture = $('#qunit-fixture');

        setupMockjax('TestService', 'TestMethod');

        function defaultCallback(success, data, xhrMethod) {
            ok(false, 'correct callback is called');
            deepEqual(data, result, 'parameters passed as expected');

            start();
        }

        function methodCallback(success, data, xhrMethod) {
            ok(true, 'correct callback is called');
            deepEqual(data, result, 'parameters passed as expected');

            start();
        }

        mdsol.ajax.container($fixture);
        obj.callback(defaultCallback);
        obj.execute(methodCallback, 1, 2, 3);

        raises(function () { obj.execute(methodCallback, 1, 2, 3, 4); }, 'throws exception if too many parameters');
        raises(function () { obj.execute(methodCallback, 1, 2); }, 'throws exception if too few parameters');

        $.mockjaxClear();
    });

    test('dispose()', function () {
        // TODO: Write tests for dispose()

        ok(true, 'true');
    });

} (window.mdsol));