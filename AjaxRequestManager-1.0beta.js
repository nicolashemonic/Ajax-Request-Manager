/*
* Author: Nicolas Hemonic - France
* Class to manage a queue of calling sequence.
* @param queue: {Object} for one call or [Array] of objects for calling sequence.
* { url: [string], data: [data], callback: [function], dataCallback: [data], errorCallback: [function] }
* @param params: {Object} override default $.ajax options.
* { type: [string], dataType: [string] }
*/

/*
* #todo: déporter cette fonction à l'intérieur pour limiter sa porté
* typeOf recognize array when it is, not an object.
* @param {Var}
* @return return the type of value
*/
var typeOf = function (value) {
    var s = typeof value;
    if (s === 'object') {
        if (value) {
            if (typeof value.length === 'number' &&
                !(value.propertyIsEnumerable('length')) &&
                typeof value.splice === 'function') {
                s = 'array';
            }
        } else {
            s = 'null';
        }
    }
    return s;
};

/* Constructor */
function Get(queue, params) {
    if (arguments.length == 0 || (typeof queue !== 'object' && typeof queue !== 'array')) {
        throw new Error('Get(queue, params): queue must be an object or array and is required');
    }

    if (arguments.length == 2 && typeof params !== 'object') {
        throw new Error('Get(queue, params): params must be an object');
    }

    this.currentQueue = queue;
    this._numberRequests = null;
    this._currentRequest = null;
    this._indexOfRequest = 0;
    this._params = { type: 'post', dataType: 'json', traditional: false };

    if (typeof params === 'object') {
        $.extend(this._params, params);
        // #todo: gérer les paramètres optionnelles
        // $.ajaxSetup(params);
        // attention les options par défaut seront modifiés pour toutes requetes
    }
}

/* Public methods */
Get.prototype.manage = function () {
    if (typeOf(this.currentQueue) === 'array') {
        this._numberRequests = this.currentQueue.length;
        this._currentRequest = this.currentQueue[this._indexOfRequest];
    }
    else {
        this._numberRequests = 1;
        this._currentRequest = this.currentQueue;
    }

    this._call();
};

Get.prototype.remainingRequests = function () {
    return this._numberRequests - this._indexOfRequest;
};

/* Private methods */
Get.prototype._next = function () {
    this._indexOfRequest++;

    if (this._indexOfRequest < this._numberRequests) {

        this._currentRequest = this.currentQueue[this._indexOfRequest];

        this._call();
    }
};

Get.prototype._call = function () {
    var that = this;

    $.ajax({
        url: that._currentRequest.url,
        type: that._params.type,
        dataType: that._params.dataType,
        data: that._currentRequest.data,
        traditional: that._params.traditional,
        success: function (dataServer) {
            if (dataServer.Success) {
                if (typeof that._currentRequest.callback === 'function') {
                    that._currentRequest.callback(dataServer.Data, that._currentRequest.dataCallback);
                }
            }
            else {
                if (typeof that._currentRequest.errorCallback === 'function') {
                    that._currentRequest.errorCallback(dataServer.Message, that._currentRequest.errorDataCallback);
                }
                else {
                    alert(dataServer.Message);
                }
            }

            that._next();
        },
        error: function (jqXHR, textStatus, errorThrown) {
            if (typeof that._currentRequest.errorCallback === 'function') {
                that._currentRequest.errorCallback(errorThrown, that._currentRequest.errorDataCallback);
            }
            else {
                alert(errorThrown);
            }

            that._next();
        }
    });
};