// In your BettingScreen.js, add these imports
import OddsComparisonTable from '../components/OddsComparisonTable';
import SharpMoneyTracker from '../components/SharpMoneyTracker';
import QuickActions from '../components/QuickActions';
import BetSlip from '../components/BetSlip';
import BankrollManager from '../components/BankrollManager';
import PlayerPropBuilder from '../components/PlayerPropBuilder';
import BettingAnalytics from '../components/BettingAnalytics';
import MatchupAnalyzer from '../components/MatchupAnalyzer';

// Then in your return statement, organize them like this:
return (
  <ScrollView 
    style={styles.container}
    refreshControl={
      <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
    }
  >
    <View style={styles.header}>
      <Text style={styles.headerTitle}>🎯 Betting Insights</Text>
      <Text style={styles.lastUpdated}>
        Updated: {bettingData?.lastUpdated}
      </Text>
    </View>

    {/* Quick Actions - Always visible */}
    <QuickActions navigation={navigation} />

    {/* Core Betting Components */}
    <OddsComparisonTable game="Lakers vs Warriors" />
    <SharpMoneyTracker />
    <MatchupAnalyzer />

    {/* Advanced Tools */}
    <PlayerPropBuilder />
    <BankrollManager />

    {/* Analytics & Tracking */}
    <BettingAnalytics />

    {/* Bet Slip - Usually at bottom */}
    <BetSlip />

    {/* Loading State */}
    {loading && (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#007AFF" />
        <Text style={styles.updatingText}>Updating data...</Text>
      </View>
    )}
  </ScrollView>
);
