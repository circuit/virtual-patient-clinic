/*
    Copyright (c) 2017 Unify Inc.

    Permission is hereby granted, free of charge, to any person obtaining
    a copy of this software and associated documentation files (the "Software"),
    to deal in the Software without restriction, including without limitation
    the rights to use, copy, modify, merge, publish, distribute, sublicense,
    and/or sell copies of the Software, and to permit persons to whom the Software
    is furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
    OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
    IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
    CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
    TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE
    OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

/* jslint node: true */
'use strict';

const PatientState = require('./patientState');

class Patient {
    constructor (socket, appointment, emitter) {
        let _self = this;
        this.socket = socket;
        this.appointment = appointment;
        this.emmiter = emitter;
        this.wait = Math.floor(Math.random() * 10) + 1;
        this._status = PatientState.WAITING;
        this._session;

        // Fake the wait time to count down a minute every 3 sec and stop at 1 min :)
        this._waitInterval = setInterval(_ => {
            _self.wait > 1 && _self.wait--;
            _self.socket.emit('update', _self.info);
            _self.onWaitUpdate && _self.onWaitUpdate(_self.info);
        }, 3 * 1000);

        Object.defineProperty(this, 'info', {
            get: function () {
                return Object.assign({}, this.appointment, {
                    wait: this.wait,
                    status: this._status
                });
            }
        });

        Object.defineProperty(this, 'id', {
            get: function () {
                return this.appointment.id;
            }
        });

        Object.defineProperty(this, 'status', {
            get: function () {
                return this._status;
            },
            set: function (val) {
                this._status = val;
            }
        });

        Object.defineProperty(this, 'session', {
            get: function () {
                return this._session;
            },
            set: function (val) {
                this._session = val;
            }
        });
    }

    redirect (url) {
        // Redirect patient
        url = `${url}&firstName=${this.appointment.firstName}&lastName=${this.appointment.lastName}`;
        this.socket.emit('redirect', {url: url});
    }
}

module.exports = Patient;
