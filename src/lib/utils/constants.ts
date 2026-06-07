export const HASHTAG_LIST = [
  { id: 1, name: "nature" },
  { id: 2, name: "desert" },
  { id: 3, name: "forest" },
  { id: 4, name: "beach" },
  { id: 5, name: "urban" },
  { id: 6, name: "industrial" },
  { id: 7, name: "mountains" },
  { id: 8, name: "horror" },
  { id: 9, name: "fantasy" },
  { id: 10, name: "scifi" },
  { id: 11, name: "romance" },
  { id: 12, name: "action" },
  { id: 13, name: "studentFriendly" },
  { id: 14, name: "quiet" },
  { id: 15, name: "freeParking" },
  { id: 16, name: "hiddenGem" },
  { id: 17, name: "nightShoot" },
  { id: 18, name: "goldenHour" },
  { id: 19, name: "permitFree" },
  { id: 20, name: "indoors" },
];

export const NOISE_LEVELS = [
  { value: "very_quiet", label: "Very Quiet" },
  { value: "quiet", label: "Quiet" },
  { value: "moderate", label: "Moderate" },
  { value: "loud", label: "Loud" },
  { value: "very_loud", label: "Very Loud" },
] as const;

export const CROWD_LEVELS = [
  { value: "empty", label: "Empty" },
  { value: "low", label: "Low" },
  { value: "moderate", label: "Moderate" },
  { value: "busy", label: "Busy" },
  { value: "crowded", label: "Crowded" },
] as const;

export const PERMIT_REQS = [
  { value: "none", label: "No Permit Needed" },
  { value: "unsure", label: "Unsure" },
  { value: "required", label: "Permit Required" },
  { value: "obtained", label: "We Got a Permit" },
] as const;

export const MAPBOX_STYLE = "mapbox://styles/mapbox/dark-v11";

export const DEFAULT_MAP_CENTER = { lng: -118.2437, lat: 34.0522 }; // Los Angeles
export const DEFAULT_MAP_ZOOM = 10;
