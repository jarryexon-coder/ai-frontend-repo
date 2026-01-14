# MANUAL FIXES NEEDED

## 1. HTML Elements in React Native
Error: "Text strings must be rendered within a <Text> component"
Location: PlayerStatsScreen (h1 tag found)

Fix needed:
- Replace HTML tags like <h1>, <p>, <div>, <span> with React Native components
- <h1> → <Text style={{fontSize: 24, fontWeight: 'bold'}}>
- <p> → <Text>
- <div> → <View>
- <span> → <Text>

## 2. alert() Calls Need Manual Replacement
Found 80 alert() calls that need replacement with:
1. Import: import { Alert } from 'react-native';
2. Replace: alert('message') → Alert.alert('Title', 'message')

Or use the new showAlert utility:
1. Import: import { showAlert } from '../utils/alertUtils';
2. Replace: alert('message') → showAlert('Alert', 'message')

## 3. React Key Warnings - Specific Files
These files need manual .map() key fixes:

1. DailyPicksAIScreen.js:
   Change: {sports.map((sport) => (
   To: {sports.map((sport, index) => (
   Add: key={sport.id || \`sport-\${index}\`} to first element

2. LiveGamesScreen-enhanced.js:
   Change: {['all', 'NFL', 'NBA', 'NHL', 'MLB'].map((sport) => (
   To: {['all', 'NFL', 'NBA', 'NHL', 'MLB'].map((sport, index) => (
   Add: key={\`filter-\${sport}-\${index}\`}

## 4. HomeScreen Navigation - Already Fixed
✅ The HomeScreen has been restored with proper navigation

## RECOMMENDED APPROACH:

1. First, fix the HTML elements error in PlayerStatsScreen
2. Test the app: npx expo start --clear
3. If working, proceed with manual alert() replacements
4. Finally, fix the React key warnings one by one

## QUICK FIX FOR HTML ELEMENTS:
Run this command to find HTML tags:

grep -r "<h1\|<p\|<div\|<span" src/screens/ | grep -v backup

Then replace them manually with React Native components.
