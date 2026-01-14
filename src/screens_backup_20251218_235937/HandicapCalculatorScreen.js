import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TextInput, TouchableOpacity, Switch,
  Alert, Dimensions, Slider
} from 'react-native';
import { VictoryBar, VictoryChart, VictoryAxis, VictoryTheme } from 'victory-native';

const { width } = Dimensions.get('window');

const HandicapCalculatorScreen = () => {
  // Calculator inputs
  const [inputs, setInputs] = useState({
    homeTeam: 'Lakers',
    awayTeam: 'Warriors',
    homeRating: 85,
    awayRating: 82,
    homeInjuries: 1,
    awayInjuries: 2,
    homeRest: 2,
    awayRest: 1,
    venue: 'home', // home, away, neutral
    weather: 'normal', // normal, poor, extreme
  });

  const [advancedMode, setAdvancedMode] = useState(false);
  const [results, setResults] = useState(null);

  // Calculate handicaps
  const calculateHandicap = () => {
    const {
      homeRating, awayRating, homeInjuries, awayInjuries,
      homeRest, awayRest, venue, weather
    } = inputs;

    // Base rating difference
    let ratingDiff = homeRating - awayRating;
    
    // Injury adjustment (-3 points per key injury)
    const injuryAdj = (awayInjuries - homeInjuries) * 3;
    
    // Rest advantage (+2 points per day rest advantage)
    const restAdj = (homeRest - awayRest) * 2;
    
    // Home court advantage (+3 points)
    const venueAdj = venue === 'home' ? 3 : venue === 'away' ? -3 : 0;
    
    // Weather adjustment
    const weatherAdj = weather === 'poor' ? -2 : weather === 'extreme' ? -4 : 0;
    
    // Total adjustment
    const totalAdjustment = injuryAdj + restAdj + venueAdj + weatherAdj;
    
    // Final spread calculation
    const rawSpread = ratingDiff + totalAdjustment;
    const adjustedSpread = Math.round(rawSpread * 2) / 2; // Round to nearest 0.5
    
    // Win probability calculation
    const winProbability = 50 + (rawSpread * 2);
    const cappedProbability = Math.max(10, Math.min(90, winProbability));
    
    // Confidence score (0-100)
    const confidenceScore = Math.min(100, 60 + Math.abs(rawSpread) * 3);
    
    // Recommended bets
    const recommendedBets = [];
    if (adjustedSpread > 3) {
      recommendedBets.push(`Home team -${adjustedSpread} points`);
    } else if (adjustedSpread < -3) {
      recommendedBets.push(`Away team +${Math.abs(adjustedSpread)} points`);
    }
    
    if (Math.abs(adjustedSpread) < 5) {
      recommendedBets.push('Bet the Under if total < 220');
    }
    
    if (homeInjuries > awayInjuries + 1) {
      recommendedBets.push('Consider away team moneyline');
    }

    setResults({
      spread: adjustedSpread,
      winProbability: cappedProbability.toFixed(1),
      confidence: confidenceScore.toFixed(0),
      moneyline: calculateMoneyline(cappedProbability),
      total: calculateTotal(homeRating, awayRating),
      recommendedBets,
      factors: [
        { name: 'Rating Difference', value: ratingDiff, impact: ratingDiff * 2 },
        { name: 'Injuries', value: injuryAdj, impact: injuryAdj },
        { name: 'Rest Advantage', value: restAdj, impact: restAdj },
        { name: 'Venue', value: venueAdj, impact: venueAdj },
        { name: 'Weather', value: weatherAdj, impact: weatherAdj },
      ]
    });
  };

  const calculateMoneyline = (probability) => {
    const impliedOdds = 100 / probability;
    if (probability >= 50) {
      const americanOdds = -((impliedOdds - 1) * 100);
      return Math.round(americanOdds / 5) * 5; // Round to nearest 5
    } else {
      const americanOdds = ((1 - impliedOdds) * 100);
      return '+' + (Math.round(americanOdds / 5) * 5);
    }
  };

  const calculateTotal = (homeRating, awayRating) => {
    const baseTotal = 210;
    const offensiveRating = (homeRating + awayRating) / 2;
    const paceFactor = (offensiveRating - 80) * 1.5;
    return Math.round(baseTotal + paceFactor);
  };

  const resetCalculator = () => {
    setInputs({
      homeTeam: 'Lakers',
      awayTeam: 'Warriors',
      homeRating: 85,
      awayRating: 82,
      homeInjuries: 1,
      awayInjuries: 2,
      homeRest: 2,
      awayRest: 1,
      venue: 'home',
      weather: 'normal',
    });
    setResults(null);
  };

  const saveCalculation = () => {
    Alert.alert(
      'Save Calculation',
      'Calculation saved to your history!',
      [{ text: 'OK' }]
    );
    // Here you would call ApiService to save to backend
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🧮 Handicap Calculator</Text>

      {/* Calculator Mode Toggle */}
      <View style={styles.modeToggle}>
        <Text style={styles.modeText}>Basic Mode</Text>
        <Switch
          value={advancedMode}
          onValueChange={setAdvancedMode}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={advancedMode ? '#007AFF' : '#f4f3f4'}
        />
        <Text style={styles.modeText}>Advanced Mode</Text>
      </View>

      {/* Team Inputs */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Teams</Text>
        <View style={styles.teamInputs}>
          <View style={styles.teamInput}>
            <Text style={styles.inputLabel}>Home Team</Text>
            <TextInput
              style={styles.textInput}
              value={inputs.homeTeam}
              onChangeText={(text) => setInputs({...inputs, homeTeam: text})}
              placeholder="Home team name"
            />
          </View>
          <View style={styles.teamInput}>
            <Text style={styles.inputLabel}>Away Team</Text>
            <TextInput
              style={styles.textInput}
              value={inputs.awayTeam}
              onChangeText={(text) => setInputs({...inputs, awayTeam: text})}
              placeholder="Away team name"
            />
          </View>
        </View>
      </View>

      {/* Team Ratings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Team Ratings (1-100)</Text>
        
        <View style={styles.sliderContainer}>
          <Text style={styles.sliderLabel}>
            {inputs.homeTeam}: {inputs.homeRating}
          </Text>
          <Slider
            style={styles.slider}
            minimumValue={50}
            maximumValue={100}
            step={1}
            value={inputs.homeRating}
            onValueChange={(value) => setInputs({...inputs, homeRating: value})}
            minimumTrackTintColor="#007AFF"
            maximumTrackTintColor="#ddd"
          />
        </View>

        <View style={styles.sliderContainer}>
          <Text style={styles.sliderLabel}>
            {inputs.awayTeam}: {inputs.awayRating}
          </Text>
          <Slider
            style={styles.slider}
            minimumValue={50}
            maximumValue={100}
            step={1}
            value={inputs.awayRating}
            onValueChange={(value) => setInputs({...inputs, awayRating: value})}
            minimumTrackTintColor="#FF3B30"
            maximumTrackTintColor="#ddd"
          />
        </View>
      </View>

      {/* Advanced Factors */}
      {advancedMode && (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Injuries</Text>
            <View style={styles.factorRow}>
              <View style={styles.factorInput}>
                <Text style={styles.factorLabel}>Home Injuries</Text>
                <View style={styles.counter}>
                  <TouchableOpacity
                    style={styles.counterButton}
                    onPress={() => setInputs({...inputs, homeInjuries: Math.max(0, inputs.homeInjuries - 1)})}
                  >
                    <Text style={styles.counterText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.counterValue}>{inputs.homeInjuries}</Text>
                  <TouchableOpacity
                    style={styles.counterButton}
                    onPress={() => setInputs({...inputs, homeInjuries: inputs.homeInjuries + 1})}
                  >
                    <Text style={styles.counterText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.factorInput}>
                <Text style={styles.factorLabel}>Away Injuries</Text>
                <View style={styles.counter}>
                  <TouchableOpacity
                    style={styles.counterButton}
                    onPress={() => setInputs({...inputs, awayInjuries: Math.max(0, inputs.awayInjuries - 1)})}
                  >
                    <Text style={styles.counterText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.counterValue}>{inputs.awayInjuries}</Text>
                  <TouchableOpacity
                    style={styles.counterButton}
                    onPress={() => setInputs({...inputs, awayInjuries: inputs.awayInjuries + 1})}
                  >
                    <Text style={styles.counterText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Days Rest</Text>
            <View style={styles.factorRow}>
              <View style={styles.factorInput}>
                <Text style={styles.factorLabel}>Home Rest</Text>
                <TextInput
                  style={styles.numberInput}
                  value={inputs.homeRest.toString()}
                  keyboardType="numeric"
                  onChangeText={(text) => setInputs({...inputs, homeRest: parseInt(text) || 0})}
                />
              </View>
              <View style={styles.factorInput}>
                <Text style={styles.factorLabel}>Away Rest</Text>
                <TextInput
                  style={styles.numberInput}
                  value={inputs.awayRest.toString()}
                  keyboardType="numeric"
                  onChangeText={(text) => setInputs({...inputs, awayRest: parseInt(text) || 0})}
                />
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Venue & Conditions</Text>
            <View style={styles.factorRow}>
              <View style={styles.factorInput}>
                <Text style={styles.factorLabel}>Venue</Text>
                <View style={styles.picker}>
                  {['home', 'away', 'neutral'].map(option => (
                    <TouchableOpacity
                      key={option}
                      style={[
                        styles.pickerOption,
                        inputs.venue === option && styles.pickerOptionActive
                      ]}
                      onPress={() => setInputs({...inputs, venue: option})}
                    >
                      <Text style={styles.pickerText}>{option}</Text>
                    </TouchableOpacity>
                  )));;
                </View>
              </View>
              <View style={styles.factorInput}>
                <Text style={styles.factorLabel}>Weather</Text>
                <View style={styles.picker}>
                  {['normal', 'poor', 'extreme'].map(option => (
                    <TouchableOpacity
                      key={option}
                      style={[
                        styles.pickerOption,
                        inputs.weather === option && styles.pickerOptionActive
                      ]}
                      onPress={() => setInputs({...inputs, weather: option})}
                    >
                      <Text style={styles.pickerText}>{option}</Text>
                    </TouchableOpacity>
                  )));;
                </View>
              </View>
            </View>
          </View>
        </>
      )}

      {/* Calculate Button */}
      <TouchableOpacity 
        style={styles.calculateButton}
        onPress={calculateHandicap}
      >
        <Text style={styles.calculateButtonText}>Calculate Handicap</Text>
      </TouchableOpacity>

      {/* Results */}
      {results && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>📈 Calculation Results</Text>
          
          <View style={styles.resultCard}>
            <Text style={styles.matchup}>
              {inputs.homeTeam} vs {inputs.awayTeam}
            </Text>
            
            {/* Key Metrics */}
            <View style={styles.metricsGrid}>
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>Spread</Text>
                <Text style={styles.metricValue}>
                  {results.spread > 0 ? `${inputs.homeTeam} -${results.spread}` : `${inputs.awayTeam} +${Math.abs(results.spread)}`}
                </Text>
              </View>
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>Win Probability</Text>
                <Text style={styles.metricValue}>{results.winProbability}%</Text>
              </View>
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>Moneyline</Text>
                <Text style={styles.metricValue}>{results.moneyline}</Text>
              </View>
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>Total Points</Text>
                <Text style={styles.metricValue}>{results.total}</Text>
              </View>
            </View>

            {/* Confidence Bar */}
            <View style={styles.confidenceContainer}>
              <Text style={styles.confidenceLabel}>
                Confidence: {results.confidence}%
              </Text>
              <View style={styles.confidenceBar}>
                <View 
                  style={[
                    styles.confidenceFill, 
                    { width: `${results.confidence}%` }
                  ]} 
                />
              </View>
            </View>

            {/* Factor Impact Chart */}
            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>Factor Impact</Text>
              <VictoryChart
                width={width - 60}
                height={200}
                domainPadding={20}
                theme={VictoryTheme.material}
              >
                <VictoryAxis
                  tickFormat={results.factors.map(f => f.name)}
                  style={{
                    tickLabels: { fontSize: 10, angle: -45, textAnchor: 'end' }
                  }}
                />
                <VictoryAxis dependentAxis />
                <VictoryBar
                  data={results.factors}
                  x="name"
                  y="impact"
                  style={{
                    data: { 
                      fill: ({ datum }) => datum.impact > 0 ? '#4CAF50' : '#F44336',
                      width: 20
                    }
                  }}
                />
              </VictoryChart>
            </View>

            {/* Recommended Bets */}
            <View style={styles.recommendations}>
              <Text style={styles.recommendationsTitle}>Recommended Bets</Text>
              {results.recommendedBets.map((bet, index) => (
                <View key={index} style={styles.recommendationItem}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.recommendationText}>{bet}</Text>
                </View>
              )));;
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={saveCalculation}
              >
                <Text style={styles.saveButtonText}>Save Calculation</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.resetButton}
                onPress={resetCalculator}
              >
                <Text style={styles.resetButtonText}>New Calculation</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#1a1a1a',
  },
  modeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  modeText: {
    fontSize: 16,
    color: '#666',
    marginHorizontal: 10,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  teamInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  teamInput: {
    flex: 1,
    marginHorizontal: 5,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  sliderContainer: {
    marginBottom: 20,
  },
  sliderLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  factorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  factorInput: {
    flex: 1,
    marginHorizontal: 5,
  },
  factorLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 8,
  },
  counterButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  counterValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  numberInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlign: 'center',
  },
  picker: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  pickerOption: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  pickerOptionActive: {
    backgroundColor: '#007AFF',
  },
  pickerText: {
    fontSize: 14,
    color: '#666',
  },
  calculateButton: {
    backgroundColor: '#007AFF',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  calculateButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultsContainer: {
    marginTop: 10,
  },
  resultsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  resultCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  matchup: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metric: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  confidenceContainer: {
    marginBottom: 20,
  },
  confidenceLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  confidenceBar: {
    height: 10,
    backgroundColor: '#e9ecef',
    borderRadius: 5,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 5,
  },
  chartContainer: {
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  recommendations: {
    marginBottom: 20,
  },
  recommendationsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bullet: {
    fontSize: 16,
    color: '#007AFF',
    marginRight: 8,
    marginTop: 2,
  },
  recommendationText: {
    fontSize: 14,
    color: '#555',
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    padding: 14,
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resetButton: {
    flex: 1,
    backgroundColor: '#6c757d',
    padding: 14,
    borderRadius: 8,
    marginLeft: 8,
    alignItems: 'center',
  },
  resetButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HandicapCalculatorScreen;
