/**
 * Tests for StateManager
 */

import { describe, test, expect, jest } from '@jest/globals';
import { StateManager, createStateManager } from '../utils/StateManager.js';

describe('StateManager', () => {
  test('creates instance with initial state', () => {
    const initialState = { count: 0 };
    const manager = new StateManager(initialState);

    expect(manager.getState()).toEqual({ count: 0 });
  });

  test('getState returns immutable copy', () => {
    const manager = new StateManager({ count: 0 });
    const state = manager.getState();

    state.count = 999;

    expect(manager.getState().count).toBe(0);
  });

  test('setState updates state with object', () => {
    const manager = new StateManager({ count: 0 });

    manager.setState({ count: 5 });

    expect(manager.getState().count).toBe(5);
  });

  test('setState updates state with function', () => {
    const manager = new StateManager({ count: 0 });

    manager.setState(state => ({ count: state.count + 1 }));

    expect(manager.getState().count).toBe(1);
  });

  test('subscribe receives state changes', () => {
    const manager = new StateManager({ count: 0 });
    const observer = jest.fn();

    manager.subscribe(observer);
    manager.setState({ count: 5 });

    expect(observer).toHaveBeenCalledWith(
      { count: 5 },
      { count: 0 }
    );
  });

  test('multiple observers receive state changes', () => {
    const manager = new StateManager({ count: 0 });
    const observer1 = jest.fn();
    const observer2 = jest.fn();

    manager.subscribe(observer1);
    manager.subscribe(observer2);
    manager.setState({ count: 5 });

    expect(observer1).toHaveBeenCalled();
    expect(observer2).toHaveBeenCalled();
  });

  test('unsubscribe removes observer', () => {
    const manager = new StateManager({ count: 0 });
    const observer = jest.fn();

    const unsubscribe = manager.subscribe(observer);
    unsubscribe();
    manager.setState({ count: 5 });

    expect(observer).not.toHaveBeenCalled();
  });

  test('reset clears state', () => {
    const manager = new StateManager({ count: 5, name: 'test' });

    manager.reset({ count: 0 });

    expect(manager.getState()).toEqual({ count: 0 });
  });

  test('reset notifies observers', () => {
    const manager = new StateManager({ count: 5 });
    const observer = jest.fn();

    manager.subscribe(observer);
    manager.reset({ count: 0 });

    expect(observer).toHaveBeenCalledWith(
      { count: 0 },
      { count: 5 }
    );
  });

  test('observer errors do not break other observers', () => {
    const manager = new StateManager({ count: 0 });
    const errorObserver = jest.fn(() => {
      throw new Error('Observer error');
    });
    const goodObserver = jest.fn();

    manager.subscribe(errorObserver);
    manager.subscribe(goodObserver);

    manager.setState({ count: 5 });

    expect(goodObserver).toHaveBeenCalled();
  });

  test('createStateManager factory function', () => {
    const manager = createStateManager({ count: 0 });

    expect(manager).toBeInstanceOf(StateManager);
    expect(manager.getState()).toEqual({ count: 0 });
  });

  test('throws error for non-function observer', () => {
    const manager = new StateManager();

    expect(() => manager.subscribe('not a function')).toThrow();
  });
});
