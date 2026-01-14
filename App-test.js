import React from 'react';
import { View, Text } from 'react-native';
import { SearchProvider, useSearch } from './src/providers/SearchProvider';

function TestComponent() {
  try {
    const { searchQuery } = useSearch();
    return <Text>Search Query: {searchQuery}</Text>;
  } catch (error) {
    return <Text>Error: {error.message}</Text>;
  }
}

export default function AppTest() {
  return (
    <SearchProvider>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <TestComponent />
      </View>
    </SearchProvider>
  );
}
