import { IQAirClient } from "./iqair-client";
import { IQAirClientConfig } from "./iqair-client.config";

export function createIQAirClient(config?: IQAirClientConfig): IQAirClient {
  return new IQAirClient(config);
}
