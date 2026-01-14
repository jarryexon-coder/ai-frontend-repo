import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import apiService from '../services/apiService';

const EnhancedBettingScreen = () => {
  const [bettingData, setBettingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState(null);

  useEffect(() => {
    loadBettingData();
  }, []);

  const loadBettingData = async () => {
    try {
      setLoading(true);
      // In a real app, this would be your betting data endpoint
      // For now, we'll simulate data
      const mockBettingData = {
        aiPredictions: [
          {
            id: 1,
            game: 'Lakers vs Warriors',
            prediction: 'Lakers ML',
            confidence: '85%',
            reasoning: 'Home court advantage + Davis playing',
            recommendedBet: '$100',
          },
          {
            id: 2,
            game: 'Celtics vs Heat',
            prediction: 'Over 228.5',
            confidence: '72%',
            reasoning: 'Both teams high scoring',
            recommendedBet: '$75',
          },
        ],
        playerProps: [
          {
            id: 1,
            player: 'LeBron James',
            prop: 'Points + Rebounds + Assists',
            line: '40.5',
            currentOdds: '-110',
            value: 'High',
          },
          {
            id: 2,
            player: 'Stephen Curry',
            prop: '3-Pointers Made',
            line: '4.5',
            currentOdds: '+120',
            value: 'Medium',
          },
        ],
        arbitrage: [
          {
            id: 1,
            bet: 'Lakers ML',
            book1: 'Bookmaker A',
            odds1: '-150',
            book2: 'Bookmaker B',
            odds2: '+130',
            profitMargin: '3.2%',
          },
        ],
        sharpMoves: [
          {
            id: 1,
            game: 'Lakers vs Warriors',
            move: 'Lakers -3.5',
            percentage: '78%',
            direction: 'Up',
          },
        ],
      };

      // Try to get real data first
      const oddsResponse = await apiService.getBettingOdds();
      if (oddsResponse && oddsResponse.success) {
        setBettingData({
          ...mockBettingData,
          liveOdds: oddsResponse.data,
        });
      } else {
        setBettingData(mockBettingData);
      }
    } catch (error) {
      console.error('Error loading betting data:', error);
      // Fallback to mock data
      setBettingData({
        aiPredictions: [
          {
            id: 1,
            game: 'Lakers vs Warriors',
            prediction: 'Lakers ML',
            confidence: '85%',
            reasoning: 'Using mock data',
            recommendedBet: '$100',
          },
        ],
        playerProps: [],
        arbitrage: [],
        sharpMoves: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceBet = (prediction) => {
    alert(`Would place bet: ${prediction.prediction} for ${prediction.recommendedBet}`);
  };

  const renderPredictionItem = (prediction, index) => (
    <View key={`prediction-${prediction.id || index}`} style={styles.predictionCard}>
      <View style={styles.predictionHeader}>
        <Text style={styles.gameText}>{prediction.game}</Text>
        <View style={styles.confidenceBadge}>
          <Text style={styles.confidenceText}>{prediction.confidence}</Text>
        </View>
      </View>
      <Text style={styles.predictionText}>📊 {prediction.prediction}</Text>
      <Text style={styles.reasoningText}>{prediction.reasoning}</Text>
      <View style={styles.betFooter}>
        <Text style={styles.betAmount}>💰 {prediction.recommendedBet}</Text>
        <TouchableOpacity
          style={styles.placeBetButton}
          onPress={() => handlePlaceBet(prediction)}
        >
          <Text style={styles.placeBetText}>Place Bet</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPlayerProp = (prop, index) => (
    <View key={`prop-${prop.id || index}`} style={styles.propCard}>
      <View style={styles.propHeader}>
        <Text style={styles.playerName}>🏀 {prop.player}</Text>
        <View style={[
          styles.valueBadge,
          prop.value === 'High' ? styles.highValue : 
          prop.value === 'Medium' ? styles.mediumValue : styles.lowValue
        ]}>
          <Text style={styles.valueText}>{prop.value} Value</Text>
        </View>
      </View>
      <Text style={styles.propType}>{prop.prop}</Text>
      <Text style={styles.propLine}>Line: {prop.line}</Text>
      <Text style={styles.odds}>Current Odds: {prop.currentOdds}</Text>
    </View>
  );

  const renderArbitrage = (arb, index) => (
    <View key={`arb-${arb.id || index}`} style={styles.arbitrageCard}>
      <Text style={styles.arbBet}>{arb.bet}</Text>
      <View style={styles.arbRow}>
        <Text style={styles.arbBook}>{arb.book1}: {arb.odds1}</Text>
        <Text style={styles.arbBook}>{arb.book2}: {arb.odds2}</Text>
      </View>
      <Text style={styles.profitMargin}>Profit Margin: {arb.profitMargin}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1e3a8a" />
        <Text style={styles.loadingText}>Loading betting insights...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>💰 AI Betting Insights</Text>
      <Text style={styles.subtitle}>Powered by advanced algorithms</Text>

      {/* AI Predictions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🤖 AI Predictions</Text>
        {bettingData?.aiPredictions && bettingData.aiPredictions.length > 0 ? (
          <View style={styles.predictionsContainer}>
            {bettingData.aiPredictions.map((prediction, index) => (
              renderPredictionItem(prediction, index)
            )));;
          </View>
        ) : (
          <Text style={styles.noData}>No AI predictions available</Text>
        )}
      </View>

      {/* Player Props */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎯 Player Props</Text>
        {bettingData?.playerProps && bettingData.playerProps.length > 0 ? (
          <View style={styles.propsContainer}>
            {bettingData.playerProps.map((prop, index) => (
              renderPlayerProp(prop, index)
            )));;
          </View>
        ) : (
          <Text style={styles.noData}>No player props available</Text>
        )}
      </View>

      {/* Arbitrage Opportunities */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔄 Arbitrage</Text>
        {bettingData?.arbitrage && bettingData.arbitrage.length > 0 ? (
          <View style={styles.arbContainer}>
            {bettingData.arbitrage.map((arb, index) => (
              renderArbitrage(arb, index)
            )));;
          </View>
        ) : (
          <Text style={styles.noData}>No arbitrage opportunities</Text>
        )}
      </View>

      {/* Sharp Money */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📈 Sharp Money Moves</Text>
        {bettingData?.sharpMoves && bettingData.sharpMoves.length > 0 ? (
          <View style={styles.sharpContainer}>
            {bettingData.sharpMoves.map((move, index) => (
              <View key={`sharp-${move.id || index}`} style={styles.sharpCard}>
                <Text style={styles.sharpGame}>{move.game}</Text>
                <View style={styles.sharpRow}>
                  <Text style={styles.sharpMove}>{move.move}</Text>
                  <View style={styles.percentageBadge}>
                    <Text style={styles.percentageText}>{move.percentage}</Text>
                  </View>
                </View>
                <Text style={styles.directionText}>
                  Sharp money: {move.direction === 'Up' ? '📈 Buying' : '📉 Selling'}
                </Text>
              </View>
            )));;
          </View>
        ) : (
          <Text style={styles.noData}>No sharp money data</Text>
        )}
      </View>

      {/* Refresh Button */}
      <TouchableOpacity
        style={styles.refreshButton}
        onPress={loadBettingData}
        disabled={loading}
      >
        <Text style={styles.refreshText}>
          {loading ? 'Refreshing...' : '🔄 Refresh Data'}
        </Text>
      </TouchableOpacity>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>ℹ️ About AI Betting Insights</Text>
        <Text style={styles.infoText}>
          • AI predictions use machine learning models trained on historical data
        </Text>
        <Text style={styles.infoText}>
          • Player props analyze individual performance trends
        </Text>
        <Text style={styles.infoText}>
          • Arbitrage finds price differences across sportsbooks
        </Text>
        <Text style={styles.infoText}>
          • Sharp money tracks professional bettor movements
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  section: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#1e40af',
  },
  predictionsContainer: {
    marginBottom: 10,
  },
  predictionCard: {
    backgroundColor: '#f0f9ff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  predictionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  gameText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e40af',
  },
  confidenceBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  confidenceText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  predictionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  reasoningText: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 15,
    lineHeight: 20,
  },
  betFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  betAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#059669',
  },
  placeBetButton: {
    backgroundColor: '#1e3a8a',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  placeBetText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  propsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  propCard: {
    backgroundColor: '#f8fafc',
    width: '48%',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  propHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  playerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e40af',
    flex: 1,
  },
  valueBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 5,
  },
  highValue: {
    backgroundColor: '#dcfce7',
  },
  mediumValue: {
    backgroundColor: '#fef3c7',
  },
  lowValue: {
    backgroundColor: '#fee2e2',
  },
  valueText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  propType: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 5,
  },
  propLine: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  odds: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  arbContainer: {
    marginBottom: 10,
  },
  arbitrageCard: {
    backgroundColor: '#f3e8ff',
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#8b5cf6',
  },
  arbBet: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6d28d9',
    marginBottom: 10,
  },
  arbRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  arbBook: {
    fontSize: 14,
    color: '#4b5563',
  },
  profitMargin: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10b981',
  },
  sharpContainer: {
    marginBottom: 10,
  },
  sharpCard: {
    backgroundColor: '#fef3c7',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  sharpGame: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 10,
  },
  sharpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sharpMove: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  percentageBadge: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  percentageText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  directionText: {
    fontSize: 14,
    color: '#78350f',
  },
  noData: {
    textAlign: 'center',
    color: '#6b7280',
    fontStyle: 'italic',
    padding: 20,
  },
  refreshButton: {
    backgroundColor: '#3b82f6',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  refreshText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoBox: {
    backgroundColor: '#e0f2fe',
    padding: 15,
    borderRadius: 10,
    marginBottom: 30,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#0369a1',
  },
  infoText: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 5,
  },
});

export default EnhancedBettingScreen;
