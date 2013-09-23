define([
    '../core',
    '../var/keys',
    '../core/Class',
    '../ajax/RequestMethod',
    '../ajax/UpsertMethod',
    './DataTable'
], function (mdsol, keys) {
    mdsol.data.keys = (function () {
        var SERVICE = 'ForeignKeys',
            TEMPLATE = {
                id: 0,
                table_id: 0,
                field_id: 0,
                fk_table_id: 0,
                fk_field_id: 0,
                source_method_code: null,
                generic: 'N',
                mainstream: 'Y',
                active: 'Y'
            },
            _request = mdsol.ajax.RequestMethod,
            _minFields = [
                'table_id',
                'field_id',
                'fk_table_id',
                'fk_field_id',
                'generic'
            ],
            _maxFields = keys(TEMPLATE).concat([
               'fk_table_name',
                'fk_field_name',
                'table_name',
                'field_name'
            ]),
            _methods = {
                getAllKeysBySiteId: _request(SERVICE, 'GetAllKeysBySiteId', 'site_id')
                    .fields(_minFields),
                getAllKeysByTableId: _request(SERVICE, 'GetAllKeysByTableId')
                    .params('site_id', 'table_id')
                    .fields(_maxFields),
                upsertKeys: mdsol.ajax.UpsertMethod(SERVICE, 'UpsertKeys')
            },
            foreignKeys = mdsol.data.DataTable(TEMPLATE, _methods, 'getAllKeysBySiteId', 'upsertKeys');

        return mdsol.Class.implement('subscribable', foreignKeys);
    } ());
});