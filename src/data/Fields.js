define([
    '../core',
    '../var/keys',
    '../core/Class',
    '../ajax/RequestMethod',
    '../ajax/UpsertMethod',
    './DataTable'
], function (mdsol, keys) {
    mdsol.data.fields = (function () {
        var SERVICE = 'Fields',
            TEMPLATE = {
                id: 0,
                table_id: 0,
                name: '',
                datatype_id: 0,
                key_type: null,
                nullable: 'N',
                default_value: null,
                comments: null,
                deprecated: 'N',
                mainstream: 'Y',
                active: 'Y'
            },
            _request = mdsol.ajax.RequestMethod,
            _keyFields = [
                'id',
                'table_id', 
                'name',
                'key_type', 
                'active',
                'pk', 
                'fk'
            ],
            _maxFields = keys(TEMPLATE).concat('datatype_name'),
            _methods = {
                getKeyFieldsByTableIt: _request(SERVICE, 'GetKeyFieldsByTableId')
                    .params('site_id', 'table_ids')
                    .fields(_keyFields),
                getFieldsByTableId: _request('Fields', 'GetFieldsByTableId')
                    .params('site_id', 'table_ids')
                    .fields(_maxFields),
                getAllKeysByTableId: _request('ForeignKeys', 'GetAllKeysByTableId')
                    .params('site_id', 'table_id')
                    .fields(_maxFields),
                upsertFields: mdsol.ajax.UpsertMethod(SERVICE, 'UpsertFields')
            },
            fields = mdsol.data.DataTable(TEMPLATE, _methods, 'getKeyFieldsByTableId', 'upsertFields');

        return mdsol.Class.implement('subscribable', fields);
    } ());
});
