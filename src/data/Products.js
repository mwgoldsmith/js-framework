define([
    '../core',
    '../var/keys',
    '../core/Class',
    '../ajax/RequestMethod',
    '../ajax/UpsertMethod',
    './DataTable'
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
            },
            products = mdsol.data.DataTable(TEMPLATE, _methods, 'getProducts', 'upsertProducts');

        return mdsol.Class.implement('subscribable', products);
    } ());
});
