import { API_URL } from '../config/api';

// Default polling interval in milliseconds
const DEFAULT_POLL_INTERVAL = 15000;

class ModelEventService {
  constructor() {
    this.listeners = [];
    this.isPolling = false;
    this.lastEventTime = null;
    this.pollInterval = DEFAULT_POLL_INTERVAL;
  }

  // Start polling for events
  startPolling(customInterval = null) {
    if (customInterval) {
      this.pollInterval = customInterval;
    }
    
    if (!this.isPolling) {
      this.isPolling = true;
      this.poll();
      console.log('Model event polling started');
    }
  }

  // Stop polling for events
  stopPolling() {
    this.isPolling = false;
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    console.log('Model event polling stopped');
  }

  // Add an event listener
  addEventListener(callback) {
    this.listeners.push(callback);
    
    // Start polling automatically when first listener is added
    if (this.listeners.length === 1) {
      this.startPolling();
    }
    
    // Return a function to remove this listener
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
      
      // Stop polling if no listeners remain
      if (this.listeners.length === 0) {
        this.stopPolling();
      }
    };
  }

  // Poll for events
  async poll() {
    if (!this.isPolling) return;
    
    try {
      // Build URL with since parameter if we have a last event time
      let url = `${API_URL}/model/events`;
      if (this.lastEventTime) {
        url += `?since=${encodeURIComponent(this.lastEventTime)}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      
      const data = await response.json();
      
      // Process any events
      if (data.events && data.events.length > 0) {
        // Update the last event time
        const latestEvent = data.events[data.events.length - 1];
        this.lastEventTime = latestEvent.timestamp;
        
        // Notify all listeners
        data.events.forEach(event => {
          this.listeners.forEach(callback => callback(event));
        });
        
        console.log(`Processed ${data.events.length} model events`);
      }
    } catch (error) {
      console.error('Error polling for model events:', error);
    } finally {
      // Schedule next poll if still active
      if (this.isPolling) {
        this.timeoutId = setTimeout(() => this.poll(), this.pollInterval);
      }
    }
  }
}

// Create and export a singleton instance
export const modelEventService = new ModelEventService();