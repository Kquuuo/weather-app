export interface WeatherMain {
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  humidity: number;
  pressure: number;
}

export interface WeatherCondition {
  main: string;
  description: string;
  id: number;
  icon: string;
}

export interface WeatherWind {
  speed: number;
  deg: number;
}

export interface WeatherSys {
  country: string;
  sunrise: number;
  sunset: number;
}

export interface WeatherData {
  main: WeatherMain;
  weather: WeatherCondition[];
  wind: WeatherWind;
  visibility: number;
  sys: WeatherSys;
  name: string;
  dt: number;
}

export interface Config {
  API_KEY: string;
}