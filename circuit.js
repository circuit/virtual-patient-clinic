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

const Circuit = require('circuit-node-sdk');
const config = require('./config.json');

let client;
let emitter;
let appointmentNr = 1000;

//Circuit.setLogger(console);
//Circuit.logger.setLevel(Circuit.Enums.LogLevel.Debug);

/**
 * Initialize
 * @param {Object} events Event emitter
 */
function init (events) {
    emitter = events;
    client = new Circuit.Client(config.user);
    client.logon()
    .then(setupListeners)
    .catch(console.error);
}

/**
 * Create a conversation between the patient and doctor
 * @param {Object} patient
 */
function createConversation(patient) {
    let convPromise = client.createGroupConversation([patient.info.doctor.userId, client.loggedOnUser.userId], `Appt. ${appointmentNr++}`);
    let detailsPromise = convPromise.then(conv => {
        return client.getConversationDetails(conv.convId);
    });
    return Promise.all([convPromise, detailsPromise])
    .then(([conversation, details]) => {
        return {
            convId: conversation.convId,
            callId: conversation.rtcSessionId,
            url: details.link
        }
    });
}

/**
 * Setup the listeners for call state events
 */
function setupListeners() {
    client.addEventListener('callStatus', evt => {
        let call = evt.call;
        if (evt.reason === 'callStateChanged' && call.state === 'Started') {
            emitter.emit('conf-started', call.callId);
        }
    });
    client.addEventListener('callEnded', evt => {
        emitter.emit('conf-ended', evt.call.callId);
    });
}

module.exports = {
    init,
    createConversation
}
