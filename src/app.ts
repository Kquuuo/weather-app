import { WeatherData } from './types';
import { config } from './config.js';

class WeatherApp {
  private readonly API_KEY: string;
  private readonly API_URL: string = 'https://api.openweathermap.org/data/2.5/weather';

  // DOM Elements
  private cityInput!: HTMLInputElement;
  private searchBtn!: HTMLButtonElement;
  private weatherContainer!: HTMLElement;
  private loadingSpinner!: HTMLElement;
  private errorContainer!: HTMLElement;
  private errorMessage!: HTMLElement;
  private background!: HTMLElement;

  // Weather data elements
  private cityName!: HTMLElement;
  private country!: HTMLElement;
  private temperature!: HTMLElement;
  private description!: HTMLElement;
  private feelsLike!: HTMLElement;
  private tempRange!: HTMLElement;
  private weatherIcon!: HTMLElement;
  private humidity!: HTMLElement;
  private windSpeed!: HTMLElement;
  private pressure!: HTMLElement;
  private visibility!: HTMLElement;

  private readonly weatherIcons: Record<string, string> = {
    Clear: '☀️',
    Clouds: '☁️',
    Rain: '🌧️',
    Drizzle: '🌦️',
    Thunderstorm: '⛈️',
    Snow: '❄️',
    Mist: '🌫️',
    Smoke: '🌫️',
    Haze: '🌫️',
    Dust: '🌫️',
    Fog: '🌫️',
    Sand: '🌫️',
    Ash: '🌫️',
    Squall: '💨',
    Tornado: '🌪️'
  };

  private readonly backgroundClasses: Record<string, string> = {
    Clear: 'bg-clear',
    Clouds: 'bg-clouds',
    Rain: 'bg-rain',
    Drizzle: 'bg-rain',
    Thunderstorm: 'bg-thunderstorm',
    Snow: 'bg-snow',
    Mist: 'bg-mist',
    Smoke: 'bg-mist',
    Haze: 'bg-mist',
    Dust: 'bg-mist',
    Fog: 'bg-mist',
    Sand: 'bg-mist',
    Ash: 'bg-mist',
    Squall: 'bg-clouds',
    Tornado: 'bg-thunderstorm'
  };

  constructor() {
    this.API_KEY = config.API_KEY;
    this.initializeElements();
    this.attachEventListeners();
  }

  private initializeElements(): void {
    this.cityInput = this.getElement<HTMLInputElement>('cityInput');
    this.searchBtn = this.getElement<HTMLButtonElement>('searchBtn');
    this.weatherContainer = this.getElement('weatherContainer');
    this.loadingSpinner = this.getElement('loadingSpinner');
    this.errorContainer = this.getElement('errorContainer');
    this.errorMessage = this.getElement('errorMessage');
    this.background = this.getElement('background');

    this.cityName = this.getElement('cityName');
    this.country = this.getElement('country');
    this.temperature = this.getElement('temperature');
    this.description = this.getElement('description');
    this.feelsLike = this.getElement('feelsLike');
    this.tempRange = this.getElement('tempRange');
    this.weatherIcon = this.getElement('weatherIcon');
    this.humidity = this.getElement('humidity');
    this.windSpeed = this.getElement('windSpeed');
    this.pressure = this.getElement('pressure');
    this.visibility = this.getElement('visibility');
  }

  private getElement<T extends HTMLElement>(id: string): T {
    const element = document.getElementById(id);
    if (!element) {
      throw new Error(`Element with id "${id}" not found`);
    }
    return element as T;
  }

  private attachEventListeners(): void {
    this.searchBtn.addEventListener('click', () => this.handleSearch());
    this.cityInput.addEventListener('keypress', (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        this.handleSearch();
      }
    });
  }

  private handleSearch(): void {
    const city = this.cityInput.value.trim();
    if (city) {
      this.fetchWeather(city);
    }
  }

  private showError(message: string): void {
    this.errorMessage.textContent = message;
    this.errorContainer.classList.remove('hidden');
    setTimeout(() => {
      this.errorContainer.classList.add('hidden');
    }, 5000);
  }

  private showLoading(): void {
    this.loadingSpinner.classList.remove('hidden');
    this.weatherContainer.classList.add('hidden');
  }

  private hideLoading(): void {
    this.loadingSpinner.classList.add('hidden');
  }

  private updateBackground(weatherCondition: string): void {
    Object.values(this.backgroundClasses).forEach(cls => {
      this.background.classList.remove(cls);
    });

    const bgClass = this.backgroundClasses[weatherCondition] || 'bg-clear';
    this.background.classList.add(bgClass);
  }

  private displayWeather(data: WeatherData): void {
    // Add null check for weather array
    const weatherInfo = data.weather[0];
    if (!weatherInfo) {
        this.showError('Invalid weather data received');
        return;
    }

    this.cityName.textContent = data.name;
    this.country.textContent = data.sys.country;
    this.temperature.textContent = `${Math.round(data.main.temp)}°`;
    this.description.textContent = weatherInfo.description;  // Use weatherInfo
    this.feelsLike.textContent = `${Math.round(data.main.feels_like)}°`;
    this.tempRange.textContent = `${Math.round(data.main.temp_max)}° / ${Math.round(data.main.temp_min)}°`;

    const condition = weatherInfo.main;  // Use weatherInfo
    this.weatherIcon.textContent = this.weatherIcons[condition] || '☀️';

    this.humidity.textContent = `${data.main.humidity}%`;
    this.windSpeed.textContent = `${Math.round(data.wind.speed * 3.6)} km/h`;
    this.pressure.textContent = `${data.main.pressure} hPa`;
    this.visibility.textContent = `${(data.visibility / 1000).toFixed(1)} km`;

    this.updateBackground(condition);

    this.hideLoading();
    this.weatherContainer.classList.remove('hidden');
    }

  private async fetchWeather(city: string): Promise<void> {
    if (!this.API_KEY) {
      this.showError('Please add your OpenWeatherMap API key to use this app.');
      return;
    }

    if (!city) {
      this.showError('Please enter a city name');
      return;
    }

    this.showLoading();

    try {
      const response = await fetch(
        `${this.API_URL}?q=${encodeURIComponent(city)}&units=metric&appid=${this.API_KEY}`
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('City not found. Please check the spelling and try again.');
        } else if (response.status === 401) {
          throw new Error('Invalid API key. Please check your OpenWeatherMap API key.');
        } else {
          throw new Error('Failed to fetch weather data. Please try again.');
        }
      }

      const data: WeatherData = await response.json();
      this.displayWeather(data);
    } catch (error) {
      this.hideLoading();
      if (error instanceof Error) {
        this.showError(error.message);
      } else {
        this.showError('An unexpected error occurred');
      }
    }
  }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new WeatherApp();
});