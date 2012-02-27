/**
 * Created by Nicolas Hémonic.
 * Date: 27/02/12
 * Time: 16:33
 * Ajax Request Manager under free licence
 */

/* Constructor */
function AjaxRequest(queue) {
    if (arguments.length !== 1 || (typeof queue !== 'object' && typeof queue !== 'array')) {
        throw new Error('queue must be an object or array of objects and is required');
    }

    this.currentQueue = queue;
    this._numberRequests = null;
    this._currentRequest = null;
    this._indexOfRequest = 0;
}

/* Public methods */
AjaxRequest.prototype.manage = function () {
    if (this._typeOf(this.currentQueue) === 'array') {
        this._numberRequests = this.currentQueue.length;
        this._currentRequest = this.currentQueue[this._indexOfRequest];
    }
    else {
        this._numberRequests = 1;
        this._currentRequest = this.currentQueue;
    }

    this._call();
};

AjaxRequest.prototype.remainingRequests = function () {
    return this._numberRequests - this._indexOfRequest;
};

/* Private methods */
AjaxRequest.prototype._typeOf = function (value) {
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

AjaxRequest.prototype._next = function () {
    this._indexOfRequest++;

    if (this._indexOfRequest < this._numberRequests) {
        this._currentRequest = this.currentQueue[this._indexOfRequest];

        this._call();
    }
};

AjaxRequest.prototype._call = function () {
    var that = this,
        handler = {};

    handler.success = function (dataServer, textStatus, jqXHR) {
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
    };

    handler.error = function (jqXHR, textStatus, errorThrown) {
        if (typeof that._currentRequest.errorCallback === 'function') {
            that._currentRequest.errorCallback(errorThrown, that._currentRequest.errorDataCallback);
        }
        else {
            alert(errorThrown);
        }

        that._next();
    };

    if (typeof this._currentRequest.url !== 'string' || this._currentRequest.url === '') {
        throw new Error('url parameter must be specified');
    }
    else if (typeof jQuery === 'undefined') {
        throw new Error('jQuery must be loaded');
    }
    else {
        jQuery.extend(handler, that._currentRequest);
        jQuery.ajax(handler);
    }
};