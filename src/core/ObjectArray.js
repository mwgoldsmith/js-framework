define([
    '../core',
    './Class',
    '../var/isArray',
    '../var/push',
    '../var/slice'
], function (mdsol, isArray, push, slice) {
    mdsol.ObjectArray = (function () {
        var ARRAY_METHODS = ['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift', 'slice'],
            _softIndexOf = function (arr, value) {
                /*
                * Return the index of the first match for `value` within the
                * array. Strict comparison is not used.
                */
                var i, len;
                
                for (i = 0, len = arr.length; i < len; i++) {
                    if (arr[i] == value) {
                        return i;
                    }
                }

                return -1;
            },
            _getProperty = function(obj, identifier) {
                var a = identifier.split('.'),
                    item = obj,
                    i, len;

                for (i = 0, len = a.length; i < len && item; i++) {
                    item = a[i] in item ? item[a[i]] : undefined;
                }

                return item;
            },
            _filterItems = function(inclusive, prop/*, varValue*/) {
                var args = slice.call(arguments, 2),
                    exclude = !inclusive,
                    baseArray = this._array,
                    values,
                    v, i;

                values = isArray(args[0]) ? args[0] : toArray(args);

                for (i = baseArray.length; i--;) {
                    v = _getProperty(baseArray[i], prop);

                    if (!!(exclude ^ !(v !== undefined && _softIndexOf(values, v) !== -1))) {
                        baseArray.splice(i, 1);
                    }
                }

                return this;
            },
            _getAll = function(inclusive, prop/*, varValue */) {
                var args = slice.call(arguments, 2),
                    baseArray = this._array,
                    exclude = !inclusive,
                    values,
                    result = [],
                    item, v, i;

                values = isArray(args[0]) ? args[0] : toArray(args);

                for (i = baseArray.length; i--;) {
                    item = baseArray[i];
                    v = _getProperty(item, prop);

                    if (!!(exclude ^ (v !== undefined && _softIndexOf(values, v) !== -1))) {
                        result.push(item);
                    }
                }

                return result;
            },
            _getUnique = function(/* varKey */) {
                var props = slice.call(arguments),
                    baseArray = this._array,
                    item, i, j,
                    exists,
                    result = [];

                for (i = baseArray.length; i--;) {
                    item = baseArray[i];

                    exists = result.some(function (e) {
                        for (j = props.length - 1, exists = false; j >= 0 && !exists; j--) {
                            exists = item[props[j]] === e[props[j]];
                        }

                        return exists;
                    });

                    if (!exists) {
                        result.push(item);
                    }
                }

                return result;
            },
            _value = function (value) {
                if (!arguments.length) {
                    // Returns the collection
                    return this._array;
                } else {
                    // Sets the collection
                    this._array = value;
                }

                return this;
            };

        function contains(key, value) {
            /*
            * Returns true if any objects in the collection match the key:value pair
            */
            var baseArray = this._array,
                i, exists = false;

            // Determine if at least on item with the property/value pair exists
            for (i = baseArray.length - 1; i >= 0 && !exists; i--) {
                exists = baseArray[i][key] == value;
            }

            return exists;
        }

        function filter(/*key, varValues*/) {
            /*
            * Filters the collection to exclude all objects matching the key and 
            * and any of the provided values
            */
            var args = [false];

            push.apply(args, arguments);

            return _filterItems.apply(this, args);
        }

        function get(key, value) {
            /*
            * Returns the first object in the collection which matches the key:value pair
            */
            
            var baseArray = this._array,
                i, item, v;

            for (i = baseArray.length; i--; ) {
                item = baseArray[i];
                v = _getProperty(item, key);

                if (value !== undefined && v == value) {
                    return item;
                }
            }

            return null;
        }

        function getAll(/* key, varValues */) {
            /*
            * Returns all objects in the collection which match the key and any of the 
            * provided values
            */
            
            var args = [true];

            push.apply(args, arguments);

            return _getAll.apply(this, args);
        }

        function getNot(/* key, varValues */) {
            /*
            * Returns all objects in the collection which do not match the key and any
            * of the provided values
            */
            
            var args = [false];

            push.apply(args, arguments);

            return _getAll.apply(this, args);
        }

        function move(srcIndex, dstIndex) {
            /*
            * Moves an item in the collection from one index to another
            */
            
            var baseArray = this._array,
                len = baseArray.length,
                k;

            if (dstIndex >= len) {
                k = dstIndex - len;
                while ((k--) + 1) {
                    baseArray.push(undefined);
                }
            }

            baseArray.splice(dstIndex, 0, baseArray.splice(srcIndex, 1)[0]);

            return this;
        }

        function getUnique(/* varKeys */) {
            return _getUnique.apply(this, arguments);
        }

        function indexOf(key, value) {
            /*
            * Returns the index in the collection of the first match for the key:value pair
            */
            
            var baseArray = this._array,
                i, len, item, v;

            for (i = 0, len = baseArray.length; i < len; i++) {
                item = baseArray[i];
                v = _getProperty(item, key);

                if (v !== undefined && v == value) {
                    return i;
                }
            }

            return -1;
        }

        function unique(/* varKeys */) {
            /*
            * Filters the collection to only contain objects which contain unique values
            * for any of the provided values
            */
            
            this._array = _getUnique.apply(this, arguments);

            return this;
        }
        
        function size(key, value) {
            var baseArray = this._array,
                i, len = 0;

            if (!arguments.length) {
                // Returns length of collection
                return baseArray.length;
            } else {
                // Returns number of objects in the collection matching the key:value pair
                for (i = baseArray.length; i--; ) {
                    if (_getProperty(baseArray[i], key) == value) {
                        len++;
                    }
                }

                return len;
            }
        }

        function pluck(key, uniqueFlag) {
            /*
            * Returns an array of values for each item in the collection matching the key
            * If unique is provided, only unique values will be returned.
            */
            
            var values = [],
                baseArray = this._array,
                i, v;

            for (i = baseArray.length; i--; ) {
                v = _getProperty(baseArray[i], key);

                if (v !== undefined && (!uniqueFlag || _softIndexOf(values, v) === -1)) {
                    values.push(v);
                }
            }

            return values;
        }

        function lastIndexOf(/*key, value*/) {
            /*
            * Returns the index in the collection of the last match for the key:value pair
            */
            
            // TODO: Implement
        }

        function where(/* key, varValues */) {
            /*
            * Filters the collection to only include objects matching the key and 
            * any of the provided values
            */
            
            var args = [true];

            push.apply(args, arguments);

            return _filterItems.apply(this, args);
        }

        function ObjectArray(value) {
            if (!(this instanceof ObjectArray)) {
                return new ObjectArray(value);
            }

            if (value && !isArray(value)) {
                throw new TypeError('Invalid data type for ObjectArray initialization value.');
            }

            // TODO: Consider implementing more robust type-checking
            // We're making a pretty big assumption at this point that every element in
            // `value` (if provided) is an object. On the other hand, to force type
            // checking every time an ObjectArray is created could produce significant 
            // wasteful overhead. Consider having type checking enabled by default and
            // having an optional flag which can disable this.

            this._array = value || [];

            return proxy(this, this._array, null, ARRAY_METHODS);
        }

        return mdsol.Class(ObjectArray, {
            contains: contains,

            filter: filter,

            get: get,

            getAll: getAll,

            getNot: getNot,

            getUnique: getUnique,

            indexOf: indexOf,

            lastIndexOf: lastIndexOf,

            move: move,

            pluck: pluck,

            size: size,

            unique: unique,

            value: _value,

            where: where
        }).valueOf();
    } ());
});