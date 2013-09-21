/*global merge,toArray,makeArray*/
define([
    '../core',
    '../var/keys',
    '../ajax/RequestMethod',
    '../ajax/UpsertMethod',
    './RemoteData'
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
            };

        return mdsol.data.RemoteData(TEMPLATE, _methods, 'getClients', 'upsertClients');
    } ());
});