import React, { useState } from 'react';
import { RegisterScreen } from './components/RegisterScreen';
import { LoginScreen } from './components/LoginScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { ReportForm } from './components/ReportForm';
import { InsightsScreen } from './components/InsightsScreen';
import { ReportsListScreen } from './components/ReportsListScreen';
import { BottomNavigation } from './components/BottomNavigation';

export type Screen = 'register' | 'login' | 'home' | 'report' | 'insights' | 'profile' | 'reports';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
    setCurrentScreen('home');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentScreen('login');
  };

  const renderScreen = () => {
    if (!isLoggedIn && currentScreen !== 'register') {
      return currentScreen === 'register' ? 
        <RegisterScreen onSwitchToLogin={() => setCurrentScreen('login')} onRegister={handleLogin} /> :
        <LoginScreen onSwitchToRegister={() => setCurrentScreen('register')} onLogin={handleLogin} />;
    }

    switch (currentScreen) {
      case 'register':
        return <RegisterScreen onSwitchToLogin={() => setCurrentScreen('login')} onRegister={handleLogin} />;
      case 'login':
        return <LoginScreen onSwitchToRegister={() => setCurrentScreen('register')} onLogin={handleLogin} />;
      case 'profile':
        return <ProfileScreen onLogout={handleLogout} />;
      case 'report':
        return <ReportForm onNavigateBack={() => setCurrentScreen('home')} />;
      case 'insights':
        return <InsightsScreen />;
      case 'reports':
        return <ReportsListScreen />;
      default:
        return <InsightsScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto">
      <div className="flex-1 overflow-auto">
        {renderScreen()}
      </div>
      {isLoggedIn && (
        <BottomNavigation 
          currentScreen={currentScreen} 
          onNavigate={setCurrentScreen} 
        />
      )}
    </div>
  );
}