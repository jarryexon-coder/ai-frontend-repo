import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

console.log('HomeScreen module loading...');

export default function HomeScreen() {
  console.log('HomeScreen component rendering...');
  
  const [loaded, setLoaded] = useState(false);
  
  useEffect(() => {
    console.log('HomeScreen useEffect running');
    const timer = setTimeout(() => {
      console.log('HomeScreen setting loaded to true');
      setLoaded(true);
    }, 1000);
    
    return () => {
      console.log('HomeScreen cleanup');
      clearTimeout(timer);
    };
  }, []);
  
  if (!loaded) {
    console.log('HomeScreen rendering loading state');
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Loading HomeScreen...</Text>
      </View>
    );
  }
  
  console.log('HomeScreen rendering content');
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home Screen Content</Text>
      <Text style={styles.text}>If you see this, HomeScreen is working!</Text>
      <View style={styles.box} />
      <View style={styles.box} />
      <View style={styles.box} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3b82f6', // BLUE - should be visible!
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
  text: {
    fontSize: 18,
    color: 'white',
    marginBottom: 40,
    textAlign: 'center',
  },
  box: {
    width: 100,
    height: 100,
    backgroundColor: 'white',
    marginBottom: 20,
    borderRadius: 10,
  },
});
