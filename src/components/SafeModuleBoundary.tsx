'use client';

import React, { Component, type ReactNode } from 'react';

interface Props {
  fallback: ReactNode;
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * SafeModuleBoundary isolates rendering failures within stadium telemetry views
 * (e.g., SVG Maps, Recharts widgets) so that critical user services like the
 * AI Copilot chat continue running even during a partial rendering crash.
 */
export class SafeModuleBoundary extends Component<Props, State> {
  public state: State = { hasError: false };

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[SafeModuleBoundary] Caught component-level crash:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}
