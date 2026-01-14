// src/navigation/NavigationHelper.js - UPDATED FOR NEW SCREEN NAMES
import { useNavigation } from '@react-navigation/native';

export const useAppNavigation = () => {
  const navigation = useNavigation();
  
  return {
    // Navigate to specific screens
    goToLogin: () => navigation.navigate('Login'),
    goToMainTabs: () => navigation.navigate('MainTabs'),
    goToPremium: () => navigation.navigate('Premium'),
    goToBetting: () => navigation.navigate('Betting'),
    goToSearch: () => navigation.navigate('SearchScreen'),
    goToTeamSelection: () => navigation.navigate('TeamSelectionScreen'),
    
    // Navigate within All Access category
    goToHome: () => navigation.navigate('Home'),
    goToLiveGames: () => navigation.navigate('AllAccess', { screen: 'LiveGames' }),
    goToNFL: () => navigation.navigate('AllAccess', { screen: 'NFLAnalytics' }),
    goToNewsDesk: () => navigation.navigate('AllAccess', { screen: 'NewsDesk' }),
    
    // Navigate within Elite Insights category
    goToNHL: () => navigation.navigate('EliteInsights', { screen: 'NHLTrends' }),
    goToPlayerDashboard: () => navigation.navigate('EliteInsights', { screen: 'PlayerDashboard' }),
    goToMatchAnalytics: (params) => navigation.navigate('EliteInsights', { 
      screen: 'MatchAnalytics',
      params 
    }),
    goToFantasyHub: () => navigation.navigate('EliteInsights', { screen: 'FantasyHub' }),
    
    // Navigate within Success Metrics category
    goToPredictionsOutcome: () => navigation.navigate('SuccessMetrics', { screen: 'PredictionsOutcome' }),
    goToParlayArchitect: () => navigation.navigate('SuccessMetrics', { screen: 'ParlayArchitect' }),
    goToExpertSelections: () => navigation.navigate('SuccessMetrics', { screen: 'ExpertSelections' }),
    goToSportsWire: () => navigation.navigate('SuccessMetrics', { screen: 'SportsWire' }),
    goToPlayerMetrics: () => navigation.navigate('SuccessMetrics', { screen: 'PlayerMetrics' }),
    goToAdvancedAnalytics: (params) => navigation.navigate('SuccessMetrics', { 
      screen: 'AdvancedAnalytics',
      params 
    }),
    
    // Navigate within Subscription category
    goToSubscription: () => navigation.navigate('Subscription'),
    goToPremiumAccessPaywall: () => navigation.navigate('Subscription', { 
      screen: 'PremiumAccessPaywall' 
    }),
    
    // Navigate to Settings (if exists)
    goToSettings: () => navigation.navigate('Settings'),
    
    // Direct tab navigation functions
    goToAllAccess: () => navigation.navigate('AllAccess'),
    goToEliteInsights: () => navigation.navigate('EliteInsights'),
    goToSuccessMetrics: () => navigation.navigate('SuccessMetrics'),
    goToSubscriptionTab: () => navigation.navigate('Subscription'),

    // ====== ALIASES FOR BACKWARD COMPATIBILITY ======
    // Success Metrics aliases
    goToPlayerStats: () => navigation.navigate('SuccessMetrics', { screen: 'PlayerMetrics' }),
    goToDailyPicks: () => navigation.navigate('SuccessMetrics', { screen: 'ExpertSelections' }),
    goToSportsNewsHub: () => navigation.navigate('SuccessMetrics', { screen: 'SportsWire' }),
    goToPredictions: () => navigation.navigate('SuccessMetrics', { screen: 'PredictionsOutcome' }),

    // Elite Insights aliases
    goToFantasy: () => navigation.navigate('EliteInsights', { screen: 'FantasyHub' }),
    
    // Common navigation actions
    goBack: () => navigation.goBack(),
    resetToHome: () => navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    }),
    navigate: (name, params) => navigation.navigate(name, params),
    push: (name, params) => navigation.push(name, params),
    replace: (name, params) => navigation.replace(name, params),
  };
};

// Screen names constants (updated with new names)
export const SCREENS = {
  // Main stacks
  LOGIN: 'Login',
  MAIN_TABS: 'MainTabs',
  
  // Tab categories
  HOME: 'Home',
  ALL_ACCESS: 'AllAccess',
  ELITE_INSIGHTS: 'EliteInsights',
  SUCCESS_METRICS: 'SuccessMetrics',
  SUBSCRIPTION: 'Subscription',
  SETTINGS: 'Settings',
  
  // Individual screens by category
  
  // All Access Stack screens
  NEWS_DESK: 'NewsDesk',           // EditorUpdatesScreen → News Desk
  LIVE_GAMES: 'LiveGames',          // LiveGamesScreen-enhanced
  NFL_ANALYTICS: 'NFLAnalytics',    // NFLScreen-enhanced
  
  // Elite Insights Stack screens
  NHL_TRENDS: 'NHLTrends',          // NHLScreen-enhanced
  MATCH_ANALYTICS: 'MatchAnalytics', // GameDetailsScreen → Match Analytics
  FANTASY_HUB: 'FantasyHub',        // FantasyScreen-enhanced-v2 → Fantasy Hub
  PLAYER_DASHBOARD: 'PlayerDashboard', // PlayerProfileScreen-enhanced → Player Dashboard
  
  // Success Metrics Stack screens
  PLAYER_METRICS: 'PlayerMetrics',  // PlayerStatsScreen-enhanced → Player Metrics
  PARLAY_ARCHITECT: 'ParlayArchitect', // ParlayBuilderScreen → Parlay Architect
  EXPERT_SELECTIONS: 'ExpertSelections', // DailyPicksScreen-enhanced → Expert Selections
  SPORTS_WIRE: 'SportsWire',        // SportsNewsHub-enhanced → Sports Wire
  PREDICTIONS_OUTCOME: 'PredictionsOutcome', // PredictionsScreen → Predictions Outcome
  ADVANCED_ANALYTICS: 'AdvancedAnalytics', // AnalyticsScreen-enhanced.js → Advanced Analytics
  
  // Subscription Stack screens
  SUBSCRIPTION_MAIN: 'SubscriptionMain',
  PREMIUM_ACCESS_PAYWALL: 'PremiumAccessPaywall',
  
  // Other screens
  SEARCH: 'SearchScreen',
  TEAM_SELECTION: 'TeamSelectionScreen',
  BETTING: 'Betting',
  PREMIUM: 'Premium',
};

// Navigation paths for deep linking (updated)
export const NAVIGATION_PATHS = {
  HOME: '/',
  ALL_ACCESS: '/all-access',
  ELITE_INSIGHTS: '/elite-insights',
  SUCCESS_METRICS: '/success-metrics',
  SUBSCRIPTION: '/subscription',
  
  // All Access paths
  LIVE_GAMES: '/all-access/live-games',
  NEWS_DESK: '/all-access/news-desk',  // Updated from MARKET_MOVES
  NFL_ANALYTICS: '/all-access/nfl-analytics',
  
  // Elite Insights paths
  NHL_TRENDS: '/elite-insights/nhl-trends',
  MATCH_ANALYTICS: '/elite-insights/match-analytics',
  FANTASY_HUB: '/elite-insights/fantasy-hub',  // Updated from FANTASY_TOOLS
  PLAYER_DASHBOARD: '/elite-insights/player-dashboard',
  
  // Success Metrics paths
  PLAYER_METRICS: '/success-metrics/player-metrics',
  PARLAY_ARCHITECT: '/success-metrics/parlay-architect',
  EXPERT_SELECTIONS: '/success-metrics/expert-selections',
  SPORTS_WIRE: '/success-metrics/sports-wire',
  PREDICTIONS_OUTCOME: '/success-metrics/predictions-outcome',  // Updated from PREDICTIONS
  ADVANCED_ANALYTICS: '/success-metrics/advanced-analytics',  // Updated from ANALYTICS
  ADVANCED_ANALYTICS_SECRET_PHRASES: '/success-metrics/advanced-analytics?tab=secretPhrases',
  
  // Subscription paths
  SUBSCRIPTION_MAIN: '/subscription',
  PREMIUM_ACCESS: '/subscription/premium-access',
};

// Helper function to get the correct navigation path
export const getNavigationPath = (tabName, screenName) => {
  const paths = {
    'Home': {
      'Home': '/',
    },
    'AllAccess': {
      'NewsDesk': '/all-access/news-desk',
      'LiveGames': '/all-access/live-games',
      'NFLAnalytics': '/all-access/nfl-analytics',
    },
    'EliteInsights': {
      'NHLTrends': '/elite-insights/nhl-trends',
      'MatchAnalytics': '/elite-insights/match-analytics',
      'FantasyHub': '/elite-insights/fantasy-hub',
      'PlayerDashboard': '/elite-insights/player-dashboard',
    },
    'SuccessMetrics': {
      'PlayerMetrics': '/success-metrics/player-metrics',
      'ParlayArchitect': '/success-metrics/parlay-architect',
      'ExpertSelections': '/success-metrics/expert-selections',
      'SportsWire': '/success-metrics/sports-wire',
      'PredictionsOutcome': '/success-metrics/predictions-outcome',
      'AdvancedAnalytics': '/success-metrics/advanced-analytics',
    },
    'Subscription': {
      'SubscriptionMain': '/subscription',
      'PremiumAccessPaywall': '/subscription/premium-access',
    },
  };
  
  return paths[tabName]?.[screenName] || '/';
};

// Helper to navigate to Advanced Analytics with Secret Phrases tab open
export const navigateToAdvancedAnalyticsWithSecretPhrases = (navigation) => {
  navigation.navigate('SuccessMetrics', { 
    screen: 'AdvancedAnalytics',
    params: { openSecretPhrasesTab: true }
  });
};

// Helper to get current screen info
export const useCurrentScreen = () => {
  const navigation = useNavigation();
  
  return {
    getCurrentTab: () => {
      const state = navigation.getState();
      if (state) {
        return state.routes[state.index]?.name;
      }
      return null;
    },
    getCurrentScreen: () => {
      const state = navigation.getState();
      if (state) {
        const currentTab = state.routes[state.index];
        if (currentTab?.state) {
          const tabState = currentTab.state;
          return tabState.routes[tabState.index]?.name;
        }
        return currentTab?.name;
      }
      return null;
    },
  };
};
