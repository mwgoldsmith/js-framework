define([
    '../core',
    '../core/Class',
    '../ajax/RequestMethod',
    '../ajax/UpsertMethod',
    './DataTable'
], function (mdsol) {
    mdsol.data.serviceProperties = (function () {
        var SERVICE = 'ServiceProperties',
            TEMPLATE = {
                id: 0,
                service_id: 0,
                field_id: 0,
                site_id: 0,
                exposed: 'N',
                custom: 'N',
                active: 'Y'
            },
            _request = mdsol.ajax.RequestMethod,
            _maxFields = [
                'id',
                'service_id',
                'field_id',
                'exposed',
                'custom',
                'active',
                'client_id',
                'client_name',
                'table_id',
                'table_name',
                'field_name',
                'service_name'
            ],
            _methods = {
                getServicesPropertiesBySiteId: _request(SERVICE, 'GetServicesPropertiesBySiteId', 'site_id')
                    .fields(_maxFields),
                getServicesPropertiesByTableId: _request(SERVICE, 'GetServicesPropertiesByTableId', 'table_id')
                    .fields(_maxFields),
                upsertServiceProperties: mdsol.ajax.UpsertMethod(SERVICE, 'UpsertServiceProperties')
            },
            serviceProperties = mdsol.data.DataTable(TEMPLATE, _methods, 'getServicesPropertiesBySiteId', 'upsertServiceProperties');

        return mdsol.Class.implement('subscribable', serviceProperties);
    } ());
});