import type { StationItem } from "../station/station-item.interface";

export interface StationListData {
  profileStations?: {
    data: StationItem[];
    response: Record<string, unknown>;
  };
  stationsMapData?: {
    data: StationItem[];
    response: Record<string, unknown>;
  };
}

export interface StationListResponse {
  "routes/$(locale)": {
    data: StationListData;
  };
  "routes/$(locale).profile.$slug": {
    data: StationListData;
  };
}
