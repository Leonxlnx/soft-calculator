import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider } from './src/theme/ThemeContext';
import { SoundProvider } from './src/theme/SoundContext';
import { Calculator } from './src/screens/Calculator';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <SoundProvider>
          <Calculator />
        </SoundProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
