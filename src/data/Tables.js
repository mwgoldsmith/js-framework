/*global merge,toArray,makeArray*/
define([
    '../core',
    '../ajax/RequestMethod',
    '../ajax/UpsertMethod',
    './RemoteData'
], function (mdsol) {
    mdsol.data.tables = (function () {
        var SERVICE = 'Tables',
            TEMPLATE = {
                id: 0,
                product_id: 0,
                name: '',
                friendly_name: '',
                comments: '',
                mainstream: 'Y',
                active: 'Y'
            },
            _request = mdsol.ajax.RequestMethod,
            _minFields = [
                'id', 
                'name', 
                'friendly_name',
                'active'],
            _usageFields = [
                'client_id',
                'client_name',
                'client_abbreviation',
                'site_id',
                'product_id',
                'environment_display',
                'environment_order',
                'table_id',
                'table_name', 
                'rows'],
            _methods = {
                getTablesBySiteId: _request(SERVICE, 'GetTablesBySiteId', 'site_id')
                    .fields(_minFields),
                getTablesByProductId: _request(SERVICE, 'GetTablesByProductId', 'product_id')
                    .fields(_minFields),
                getTableUsage: _request(SERVICE, 'GetTableUsage')
                    .params('site_id', 'environment_display', 'table_id')
                    .fields(_usageFields),
                upsertTables: mdsol.ajax.UpsertMethod(SERVICE, 'UpsertTables')
            };

        return mdsol.data.RemoteData(TEMPLATE, _methods, 'getTablesBySiteId', 'upsertTables');
    } ());
});