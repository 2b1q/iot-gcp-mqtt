export interface Device {
  deviceId: string;
  deviceName: string;
}

export interface Message {
  device: Device;
  timeStamp: number;
  payload: MQ135Telemetry | C2H5OHTelemetry | AirTelemetry;
}

export interface Telemetry {
  rawData: string;
  sensorName: string;
}

/**
 * Ammonia, nitrogen oxide,
 * alcohols, aromatic
 * compounds, sulfide and smoke
 */
export interface MQ135Telemetry extends Telemetry {
  value: number;
  ammonia: boolean;
  nitrogenOxide: boolean;
  smoke: boolean;
  sulfide: boolean;
  alcohol: boolean;
}

export interface C2H5OHTelemetry extends Telemetry {
  ppm: number;
}

export interface AirTelemetry extends Telemetry {
  humidity: number;
  temperature: number;
  type: TempType;
}

enum TempType {
  "C" = "Celcius",
  "F" = "Farenheit",
}
