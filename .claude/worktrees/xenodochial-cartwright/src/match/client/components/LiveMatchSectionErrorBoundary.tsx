'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = {
  children: ReactNode;
  /** Reset boundary when the match changes */
  resetKey: string;
  fallbackTitle?: string;
  /** `dark`: texto claro sobre header/subheader oscuro. `light`: tarjeta clara (tabs, contenido). */
  tone?: 'light' | 'dark';
};

type State = { hasError: boolean; lastResetKey: string };

export default class LiveMatchSectionErrorBoundary extends Component<
  Props,
  State
> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, lastResetKey: props.resetKey };
  }

  static getDerivedStateFromError(): Partial<State> {
    return { hasError: true };
  }

  static getDerivedStateFromProps(
    props: Props,
    state: State,
  ): Partial<State> | null {
    if (props.resetKey !== state.lastResetKey) {
      return { hasError: false, lastResetKey: props.resetKey };
    }
    return null;
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[LiveMatchSectionErrorBoundary]', error.message, {
      componentStack: info.componentStack,
    });
  }

  render() {
    if (this.state.hasError) {
      const tone = this.props.tone ?? 'light';
      const wrapClass =
        tone === 'dark'
          ? 'px-2 py-4 text-center'
          : 'rounded-lg border border-black/10 bg-white/90 px-4 py-6 text-center';
      const textClass =
        tone === 'dark'
          ? 'font-barlow text-sm text-white/90 md:text-base'
          : 'font-barlow text-sm text-black/70 md:text-base';
      return (
        <div className={wrapClass}>
          <p className={textClass}>
            {this.props.fallbackTitle ??
              'Esta sección no está disponible en este momento. Actualiza la página en unos segundos.'}
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
