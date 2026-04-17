// @ts-nocheck
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<Props, State> {
  override state: State = {
    hasError: false
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: any) {
    console.error('Uncaught error:', error, errorInfo);
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
          <div className="max-w-md w-full bg-white rounded-[40px] p-10 shadow-xl border border-red-50 text-center space-y-6">
            <div className="w-20 h-20 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center mx-auto">
              <span className="text-4xl">⚠️</span>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">Une erreur est survenue</h2>
              <p className="text-gray-500">
                {this.state.error?.message?.startsWith('{') 
                  ? "Désolé, une erreur de base de données est survenue. Veuillez vérifier vos permissions."
                  : "Désolé, quelque chose s'est mal passé. Veuillez recharger la page."}
              </p>
            </div>
            <button
              className="bg-gray-900 text-white px-8 py-3 rounded-2xl font-bold hover:bg-blue-600 transition-colors w-full"
              onClick={() => window.location.reload()}
            >
              Recharger la page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
