define([
    '../core',
    '../var/keys',
    '../core/Class',
    '../ajax/RequestMethod',
    '../ajax/UpsertMethod',
    './DataTable'
], function (mdsol, keys) {
    mdsol.data.dialogs = (function () {
        var SERVICE = 'Dialogs',
            TEMPLATE = {
                id: 0,
                name: '',
                display: '',
                product_id: null,
                dropdown_accessable: 'N',
                req_product: 'N',
                req_client: 'N',
                req_environment: 'N',
                admin_only: 'N',
                active: 'Y'
            },
            _request = mdsol.ajax.RequestMethod,
            _methods = {
                getDialogs: _request(SERVICE, 'GetDialogs')
                    .fields(keys(TEMPLATE)),
                getDialogsByProductId: _request(SERVICE, 'GetDialogsByProductId', 'product_id')
                    .fields(keys(TEMPLATE)),
                upsertDialogs: mdsol.ajax.UpsertMethod(SERVICE, 'UpsertDialogs')
            },
            dialogs = mdsol.data.DataTable(TEMPLATE, _methods, 'getDialogs', 'upsertDialogs');

        return mdsol.Class.implement('subscribable', dialogs);
    } ());
});