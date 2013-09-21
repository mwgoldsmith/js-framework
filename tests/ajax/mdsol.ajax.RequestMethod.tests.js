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

    module('mdsol.ajax.RequestMethod');

    test('audit', function () {
        var obj = mdsol.ajax.RequestMethod('service', 'method', 'params');

        ok(!obj.audit(), 'default of false');

        obj.audit(true);
        ok(obj.audit() === true, 'Boolean');

        obj.audit('');
        ok(obj.audit() === false, 'falsy value');

        obj.audit(1);
        ok(obj.audit() === true, 'truthy value');
    });

    test('fields', function () {
        var obj = mdsol.ajax.RequestMethod('service', 'method', 'params');

        obj.fields(null);
        deepEqual(obj.fields(), [], 'Null');

        obj.fields('first');
        deepEqual(obj.fields(), ['first'], 'Set single field as non-array');

        obj.fields('first', 'second');
        deepEqual(obj.fields(), ['first', 'second'], 'Set multiple fields as array');

        obj.fields(['first']);
        deepEqual(obj.fields(), ['first'], 'Set single field as array');

        obj.fields(['first', 'second']);
        deepEqual(obj.fields(), ['first', 'second'], 'Set multiple fields as array');
    });

    test('params', function () {
        var obj = mdsol.ajax.RequestMethod('service', 'method', 'params');

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

    asyncTest('execute(callback, [params, ...])', 4, function () {
        var obj = mdsol.ajax.RequestMethod('TestService', 'TestMethod', ['paramNameA', 'paramNameB', 'paramNameC']),
            result = [{ params: ['paramNameA', 'paramNameB', 'paramNameC', 'audit_info', 'field_filter'], values: ['1', '2', '3', 'n', '']}],
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

    test('dispose', function () {
        ok(typeof mdsol.ajax.RequestMethod === 'function', 'exists');

        // TODO: Create tests
    });

} (window.mdsol));