"use client";

type PerfMetricState = {
  activeChannels: number;
};

type PerfMetricCallback = (state: PerfMetricState) => void;

const state: PerfMetricState = {
  activeChannels: 0
};

const listeners = new Set<PerfMetricCallback>();

const emit = () => {
  listeners.forEach((listener) => listener({ ...state }));
};

export const getPerfMetrics = () => ({ ...state });

export const subscribeToPerfMetrics = (callback: PerfMetricCallback) => {
  listeners.add(callback);
  callback({ ...state });

  return () => {
    listeners.delete(callback);
  };
};

export const trackRealtimeChannel = () => {
  state.activeChannels += 1;
  emit();

  let isReleased = false;

  return () => {
    if (isReleased) {
      return;
    }

    isReleased = true;
    state.activeChannels = Math.max(0, state.activeChannels - 1);
    emit();
  };
};
