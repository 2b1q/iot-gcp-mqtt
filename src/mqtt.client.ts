import { Token } from "./auth";
import { MqttClient, connect, IClientOptions } from "mqtt";
import { IProject, projects } from "./config";

interface IConnectionOpts extends IClientOptions {
    secureProtocol: string;
}

export class IotClient {
    private mqttClient: MqttClient;
    public mqttClientId: string;
    private connectionArgs: IConnectionOpts;
    private topic: string;
    private subscribtion: string;
    public connected: boolean = false;

    constructor(projectId: string, deviceId: string) {
        //@ts-ignore
        const project: IProject = projects[projectId] || {};
        const { region, registryId, mqttBridgeHostname, mqttBridgePort, devices, subscribtion } = project;
        if (!region) {
            throw new Error(`Wrong projectId: "${projectId}"`);
        }
        // The MQTT topic that this device will publish data to. The MQTT topic name is
        // required to be in the format below. The topic name must end in 'state' to
        // publish state and 'events' to publish telemetry. Note that this is not the
        // same as the device registry's Cloud Pub/Sub topic.
        this.topic = `/devices/${deviceId}/events`;
        this.subscribtion = subscribtion;

        const device = devices.find(({ id }) => id === deviceId);
        if (!device) {
            throw new Error(`deviceId: "${deviceId}" not exist in config`);
        }

        this.mqttClientId = `projects/${projectId}/locations/${region}/registries/${registryId}/devices/${deviceId}`;

        const token = new Token(projectId, device.privateKeyFile);

        this.connectionArgs = {
            host: mqttBridgeHostname,
            port: mqttBridgePort,
            clientId: this.mqttClientId,
            username: '2b1q',
            password: token.sign(),
            protocol: 'mqtts',
            secureProtocol: 'TLSv1_2_method',
        }

        console.log(`Connecting to MQTT. ClientId: ${this.mqttClientId}`);
        this.mqttClient = connect(this.connectionArgs);
        this.mqttClient.on('connect', () => {
            this.connected = true;
        })
    }

    getClient(): MqttClient {
        if (this.mqttClient) {
            return this.mqttClient;
        }
        console.log(`Reconnecting to MQTT`);
        this.connected = true;

        this.mqttClient = connect(this.connectionArgs);
        return this.mqttClient;
    }

    getTopic(): string {
        return this.topic;
    }

    getSubscription(): string {
        return this.subscribtion;
    }

    publish(msg: string): void {
        console.log('Publishing message:', msg);
        this.mqttClient.publish(this.topic, msg, { qos: 1 }, err => {
            if (err) {
                console.error(err);
            }
        })
    }
}
