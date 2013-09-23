define([
    '../core',
    '../var/keys',
    '../core/Class',
    '../ajax/RequestMethod',
    '../ajax/UpsertMethod',
    './DataTable'
], function (mdsol, keys) {
    mdsol.data.clients = (function () {
        var SERVICE = 'Clients',
            TEMPLATE = {
                id: 0,
                name: '',
                abbreviation: null,
                internal: 'N',
                active: 'Y'
            },
            _methods = {
                getClients: mdsol.ajax.RequestMethod(SERVICE, 'GetClients')
                    .fields(keys(TEMPLATE)),
                upsertClients: mdsol.ajax.UpsertMethod(SERVICE, 'UpsertClients')
            },
            clients = mdsol.data.DataTable(TEMPLATE, _methods, 'getClients', 'upsertClients');

        return mdsol.Class.implement('subscribable', clients);
    } ());
});