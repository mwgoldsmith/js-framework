define([
    '../core',
    '../var/keys',
    '../core/Class',
    '../ajax/RequestMethod',
    '../ajax/UpsertMethod',
    './DataTable'
], function (mdsol, keys) {
    mdsol.data.services = (function () {
        var SERVICE = 'Services',
            TEMPLATE = {
                id: 0,
                name: '',
                table_id: 0,
                description: null,
                file_location: null,
                mainstream: 'Y',
                active: 'Y'
            },
            _request = mdsol.ajax.RequestMethod, 
            _maxFields = keys(TEMPLATE).concat('data_object'),
            _minFields = [
                'id',
                'name',
                'data_object'
            ],
            _serviceSitesFields = [
                'id',
                'site_id',
                'client_id',
                'client_name',
                'environment_code', 
                'environment_order',
                'active'
            ],
            _methods = {
                getServicesBySiteId: _request(SERVICE, 'GetServicesBySiteId', 'site_id')
                    .fields(_maxFields),
                getByDataObject: _request(SERVICE, 'GetServicesByDataObject')
                    .params('site_id', 'table_id')
                    .fields(_minFields),
                getServiceSites: _request(SERVICE, 'GetServiceSites')
                    .params('product_id', 'environment_code', 'environment_order')
                    .fields(_serviceSitesFields),
                upsertServices: mdsol.ajax.UpsertMethod(SERVICE, 'UpsertServices')
            },
            services = mdsol.data.DataTable(TEMPLATE, _methods, 'getServicesBySiteId', 'upsertServices');

        return mdsol.Class.implement('subscribable', services);
    } ());
});