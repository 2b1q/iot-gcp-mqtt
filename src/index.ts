import { IotClient } from './mqtt.client'

const deviceId = 'Nodejs';
const projectId = 'iot-mqtt-290604';

const iot = new IotClient(projectId, deviceId);

const mqttClient = iot.getClient();

mqttClient
    .on('connect', () => {
        console.log('Connected to MQTT');

        // Subscribe to the /devices/{device-id}/config topic to receive config updates.
        // Config updates are recommended to use QoS 1 (at least once delivery)
        mqttClient.subscribe(`/devices/${deviceId}/config`, { qos: 1 });

        // Subscribe to the /devices/{device-id}/commands/# topic to receive all
        // commands or to the /devices/{device-id}/commands/<subfolder> to just receive
        // messages published to a specific commands folder; we recommend you use
        // QoS 0 (at most once delivery)
        mqttClient.subscribe(`/devices/${deviceId}/commands/#`, { qos: 0 });

        iot.publish('test message')
    })
    .on('error', err => {
        mqttClient.connected = false;
        console.error(err);
    })
    .on('close', () => {
        console.log('MQTT connection closed');
        mqttClient.connected = false;
    })
    .on('message', (topic, message) => {
        let messageStr = 'Message received: ';
        if (topic === `/devices/${deviceId}/config`) {
            messageStr = 'Config message received: ';
        } else if (topic.startsWith(`/devices/${deviceId}/commands`)) {
            messageStr = 'Command message received: ';
        }

        messageStr += Buffer.from(message).toString('ascii');
        console.log(messageStr);
    });

