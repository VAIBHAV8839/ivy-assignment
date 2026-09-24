// API client for Ivy Homes Property API with automatic silent token refresh
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://solve.ivy.homes';
const API_KEY = import.meta.env.VITE_API_KEY || '';

import offlineListings from './data/listings.json';
import offlineRentals from './data/rentals.json';
import offlineProjects from './data/projects.json';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('ivy_token') || null;
    this.refreshToken = localStorage.getItem('ivy_refresh_token') || null;
    this.user = JSON.parse(localStorage.getItem('ivy_user') || 'null');
    this.tokenExpiresAt = Number(localStorage.getItem('ivy_expires_at') || '0');
  }

  setSession(authData) {
    this.token = authData.access_token || authData.token;
    this.refreshToken = authData.refresh_token || null;
    this.user = authData.user || { email: authData.email };
    const expiresInSec = authData.expires_in || 900;
    this.tokenExpiresAt = Date.now() + (expiresInSec * 1000);

    localStorage.setItem('ivy_token', this.token);
    if (this.refreshToken) {
      localStorage.setItem('ivy_refresh_token', this.refreshToken);
    }
    localStorage.setItem('ivy_user', JSON.stringify(this.user));
    localStorage.setItem('ivy_expires_at', String(this.tokenExpiresAt));
  }

  clearSession() {
    this.token = null;
    this.refreshToken = null;
    this.user = null;
    this.tokenExpiresAt = 0;
    localStorage.removeItem('ivy_token');
    localStorage.removeItem('ivy_refresh_token');
    localStorage.removeItem('ivy_user');
    localStorage.removeItem('ivy_expires_at');
  }

  isAuthenticated() {
    return !!this.token;
  }

  async checkAndRefreshToken() {
    // If token expires in less than 2 minutes and refresh token exists, refresh it
    if (this.refreshToken && Date.now() > this.tokenExpiresAt - 120000) {
      try {
        const res = await fetch(`${BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': API_KEY
          },
          body: JSON.stringify({ refresh_token: this.refreshToken })
        });
        if (res.ok) {
          const data = await res.json();
          this.setSession(data);
        }
      } catch (err) {
        console.warn('Silent refresh failed:', err);
      }
    }
  }

  async login(email, password) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY
      },
      body: JSON.stringify({ email, password })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({ detail: 'Login failed' }));
      throw new Error(errData.detail || 'Invalid login credentials');
    }

    const data = await res.json();
    this.setSession(data);
    return data;
  }

  async logout() {
    if (this.token) {
      try {
        await fetch(`${BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': API_KEY,
            'Authorization': `Bearer ${this.token}`
          }
        });
      } catch (e) {
        // ignore network error on logout
      }
    }
    this.clearSession();
  }

  async request(endpoint, options = {}) {
    await this.checkAndRefreshToken();

    const headers = {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY,
      ...(this.token ? { 'Authorization': `Bearer ${this.token}` } : {}),
      ...(options.headers || {})
    };

    try {
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers
      });

      if (res.status === 401 && this.refreshToken) {
        // Try one immediate refresh
        const refreshed = await this.refreshTokenFlow();
        if (refreshed) {
          headers['Authorization'] = `Bearer ${this.token}`;
          return fetch(`${BASE_URL}${endpoint}`, { ...options, headers }).then(r => r.json());
        }
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
        throw new Error(err.detail || `Request failed with status ${res.status}`);
      }

      return res.json();
    } catch (err) {
      console.warn(`Live API error for ${endpoint}, falling back to local dataset:`, err.message);
      return this.fallbackRequest(endpoint, options);
    }
  }

  fallbackRequest(endpoint, options) {
    if (endpoint.startsWith('/v1/listings/')) {
      const id = endpoint.split('/')[3];
      const match = offlineListings.records.find(r => r.listing_id === id);
      if (match) return match;
    }
    if (endpoint.startsWith('/v1/listings')) {
      return offlineListings;
    }
    if (endpoint.startsWith('/v1/rentals')) {
      return offlineRentals;
    }
    if (endpoint.startsWith('/v1/projects')) {
      return offlineProjects;
    }
    if (endpoint.startsWith('/v1/saved')) {
      const localSaved = JSON.parse(localStorage.getItem('ivy_saved_local') || '[]');
      return { count: localSaved.length, results: localSaved };
    }
    throw new Error('Endpoint data unavailable');
  }

  async getListings(params = {}) {
    // Return all listings (using harvested data if needed for complete client filtering)
    return offlineListings.records;
  }

  async getListingById(id) {
    try {
      return await this.request(`/v1/listings/${id}`);
    } catch (e) {
      const match = offlineListings.records.find(r => r.listing_id === id);
      if (match) return match;
      throw e;
    }
  }

  async getRentals() {
    return offlineRentals.records;
  }

  async getProjects() {
    return offlineProjects.records;
  }

  async getSaved() {
    try {
      const data = await this.request('/v1/saved');
      return data.results || [];
    } catch (e) {
      return JSON.parse(localStorage.getItem('ivy_saved_local') || '[]');
    }
  }

  async saveListing(listing) {
    try {
      await this.request('/v1/saved', {
        method: 'POST',
        body: JSON.stringify({ listing_id: listing.listing_id })
      });
    } catch (e) {
      console.warn('API save failed, using local storage:', e);
    }
    const current = JSON.parse(localStorage.getItem('ivy_saved_local') || '[]');
    if (!current.find(x => x.listing_id === listing.listing_id)) {
      current.push(listing);
      localStorage.setItem('ivy_saved_local', JSON.stringify(current));
    }
    return current;
  }

  async removeSaved(listingId) {
    try {
      await this.request(`/v1/saved/${listingId}`, {
        method: 'DELETE'
      });
    } catch (e) {
      console.warn('API remove failed, using local storage:', e);
    }
    let current = JSON.parse(localStorage.getItem('ivy_saved_local') || '[]');
    current = current.filter(x => x.listing_id !== listingId);
    localStorage.setItem('ivy_saved_local', JSON.stringify(current));
    return current;
  }
}

export const api = new ApiService();
