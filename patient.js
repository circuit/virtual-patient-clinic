/*jshint esnext:true*/
'use strict';

class Patient {
    constructor (socket, appointment, emitter) {
        let _self = this;
        this.socket = socket;
        this.appointment = appointment;
        this.emmiter = emitter;
        this.wait = Math.floor(Math.random() * 10) + 1;
        this._status = 'Waiting';
        this._session;

        // Fake the wait time
        this._waitInterval = setInterval(_ => {
            _self.wait > 0 && _self.wait--;
            _self.socket.emit('update', _self.info);
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
