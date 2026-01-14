
// Add this inside your App component or useEffect
useEffect(() => {
  LogBox.ignoreLogs([
    'Encountered two children with the same key',
    'You are initializing Firebase Auth for React Native without providing AsyncStorage',
    'ProgressBar: Support for defaultProps will be removed',
    'AsyncStorage has been extracted',
    'Firebase Analytics is not supported in this environment',
    'Failed to fetch this Firebase app\'s measurement ID',
    'IndexedDB unavailable or restricted in this environment',
    'Cookies are not available',
    'INTERNAL ASSERTION FAILED: Expected a class definition',
    'Firebase App named',
    'WARN  @firebase/analytics:'
  ]);
}, []);


// Add this inside your App component or useEffect
useEffect(() => {
  LogBox.ignoreLogs([
    'Encountered two children with the same key',
    'You are initializing Firebase Auth for React Native without providing AsyncStorage',
    'ProgressBar: Support for defaultProps will be removed',
    'AsyncStorage has been extracted',
    'Firebase Analytics is not supported in this environment',
    'Failed to fetch this Firebase app\'s measurement ID',
    'IndexedDB unavailable or restricted in this environment',
    'Cookies are not available',
    'INTERNAL ASSERTION FAILED: Expected a class definition',
    'Firebase App named',
    'WARN  @firebase/analytics:'
  ]);
}, []);

