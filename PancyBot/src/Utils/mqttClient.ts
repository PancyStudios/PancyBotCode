import { MqttCommunicator } from './Handlers/MMQT';

export const mqttBot = new MqttCommunicator(`${process.env.enviroment == 'prod' ? 'pancybot' : 'pancybot_canary'}`);
