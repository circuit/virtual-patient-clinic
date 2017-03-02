/* jslint node: true */
'use strict';

const Circuit = require('circuit');
const config = require('./config.json');
const vpcUserId = 'e3a7cad8-0c9d-4f2e-b028-f080590c6d21';

let client;
let emitter;

function init (events) {
    emitter = events;
    client = new Circuit.Client(config.user);
    client.logon()
    .then(setupListeners)
    .catch(console.error);
}

function createConversation (patient) {
    let conversation;
    return client.createGroupConversation([patient.info.doctor.userId, vpcUserId], `Appt. ${patient.id}`)
    .then(conv => {
        conversation = conv;
        return client.getConversationDetails(conv.convId);
    })
    .then(details => {
        return {
            convId: conversation.convId,
            callId: conversation.rtcSessionId,
            url: details.link
        }
    })
}

function setupListeners() {
    client.addEventListener('callStatus', evt => {
        let call = evt.call;
        if (evt.reason === 'callStateChanged' && call.state === 'Started') {
            emitter.emit('conf-started', call.callId);
        }
    });
}

module.exports = {
    init,
    createConversation
}
