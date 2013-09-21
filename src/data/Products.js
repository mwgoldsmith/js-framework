/*global merge,toArray,makeArray*/
define([
    '../core',
    '../var/keys',
    '../ajax/RequestMethod',
    '../ajax/UpsertMethod',
    './RemoteData'
], function (mdsol, keys) {
    mdsol.data.products = (function () {
        var SERVICE = 'Products',
            TEMPLATE = {
                id: 0,
                name: '',
                internal_client_id: null,
                enabled: 'Y',
                active: 'Y'
            },
            _methods = {
                getProducts: mdsol.ajax.RequestMethod(SERVICE, 'GetProducts')
                    .fields(keys(TEMPLATE)),
                upsertProducts: mdsol.ajax.UpsertMethod(SERVICE, 'UpsertProducts')
            };

        return mdsol.data.RemoteData(TEMPLATE, _methods, 'getProducts', 'upsertProducts');
    } ());
});
