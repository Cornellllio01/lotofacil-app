import React from 'react';
import { StatusBar, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import GeneratorScreen from './screens/GeneratorScreen';
import ResultsScreen from './screens/ResultsScreen';
import StatsScreen from './screens/StatsScreen';

const Tab = createBottomTabNavigator();

const TabIcon = ({ name, color, size }) => {
  const icons = {
    'Gerador': '🎲',
    'Resultados': '📊',
    'Estatísticas': '📈',
  };
  return <Text style={{ fontSize: size, color }}>{icons[name] || '❓'}</Text>;
};

export default function App() {
  const [sharedLastResult, setSharedLastResult] = React.useState('');

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ color, size }) => (
              <TabIcon name={route.name} color={color} size={Number(size)} />
            ),
            tabBarActiveTintColor: '#ff9100',
            tabBarInactiveTintColor: '#7b2cbf',
            tabBarStyle: {
              backgroundColor: '#1d0c2e',
              borderTopColor: '#3c096c',
              height: 75,
            },
            tabBarLabelStyle: {
              fontSize: 11,
              fontWeight: '600',
              marginBottom: 12,
            },
            tabBarIconStyle: {
              marginTop: 2,
            },
          })}
        >
          <Tab.Screen
            name="Gerador"
            options={{ headerShown: false }}
          >
            {(props) => (
              <GeneratorScreen
                {...props}
                lastResult={sharedLastResult}
                setLastResult={setSharedLastResult}
              />
            )}
          </Tab.Screen>
          <Tab.Screen
            name="Resultados"
            options={{ headerShown: false }}
          >
            {(props) => (
              <ResultsScreen
                {...props}
                setSharedLastResult={setSharedLastResult}
              />
            )}
          </Tab.Screen>
          <Tab.Screen
            name="Estatísticas"
            component={StatsScreen}
            options={{ headerShown: false }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}