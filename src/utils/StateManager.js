/**
 * StateManager - Observable state management
 * Implements observer pattern for state changes
 */

export class StateManager {
  constructor(initialState = {}) {
    this.state = initialState;
    this.observers = [];
  }

  /**
   * Gets current state (immutable copy)
   * @returns {Object} Current state
   */
  getState() {
    return { ...this.state };
  }

  /**
   * Updates state and notifies observers
   * @param {Object|Function} update - New state or updater function
   */
  setState(update) {
    const oldState = { ...this.state };

    if (typeof update === 'function') {
      this.state = { ...this.state, ...update(this.state) };
    } else {
      this.state = { ...this.state, ...update };
    }

    this.notifyObservers(oldState, this.state);
  }

  /**
   * Subscribes to state changes
   * @param {Function} observer - Callback function
   * @returns {Function} Unsubscribe function
   */
  subscribe(observer) {
    if (typeof observer !== 'function') {
      throw new Error('Observer must be a function');
    }

    this.observers.push(observer);

    // Return unsubscribe function
    return () => {
      this.observers = this.observers.filter(obs => obs !== observer);
    };
  }

  /**
   * Notifies all observers of state change
   * @param {Object} oldState - Previous state
   * @param {Object} newState - New state
   */
  notifyObservers(oldState, newState) {
    this.observers.forEach(observer => {
      try {
        observer(newState, oldState);
      } catch (error) {
        console.error('Observer error:', error);
      }
    });
  }

  /**
   * Resets state to initial or provided state
   * @param {Object} newState - State to reset to
   */
  reset(newState = {}) {
    const oldState = { ...this.state };
    this.state = newState;
    this.notifyObservers(oldState, this.state);
  }
}

/**
 * Creates a new state manager instance
 * @param {Object} initialState - Initial state
 * @returns {StateManager} State manager instance
 */
export function createStateManager(initialState = {}) {
  return new StateManager(initialState);
}
