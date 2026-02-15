import type { StationDetails } from "../station/station-details.interface";
import type { HistoricalDataPoint } from "../history/historical-data-point.interface";

export interface IndividualStationData {
  details?: StationDetails;
  measurements?: {
    data?: {
      measurements?: {
        hourly?: HistoricalDataPoint[];
        daily?: HistoricalDataPoint[];
      };
    };
  };
}

export interface IndividualStationResponse {
  root: {
    data: IndividualStationData;
  };
  "routes/$": {
    data: IndividualStationData;
  };
}
