import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  FlatList,
} from 'react-native';
import apiService from '../../services/apiService';

const InfluencerDashboard = () => {
  const [influencerId, setInfluencerId] = useState('1');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [commissionRate, setCommissionRate] = useState('15');
  const [influencers, setInfluencers] = useState([]);

  useEffect(() => {
    loadInfluencers();
    loadAnalytics();
  }, [influencerId]);

  const loadInfluencers = async () => {
    try {
      const response = await apiService.getInfluencers();
      setInfluencers(response.influencers || []);
    } catch (error) {
      console.error('Error loading influencers:', error);
    }
  };

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const response = await apiService.getInfluencerAnalytics(influencerId);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error loading analytics:', error);
      Alert.alert('Error', 'Failed to load influencer analytics. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCode = async () => {
    if (!newCode.trim() && !analytics?.username) {
      Alert.alert('Error', 'Please enter a code or use suggested one');
      return;
    }

    const codeToUse = newCode.trim() || `${analytics?.username}-${Date.now().toString().slice(-6)}`;
    
    Alert.alert(
      'Code Generated',
      `Your referral code: ${codeToUse}\nCommission rate: ${commissionRate}%`,
      [{ text: 'OK', onPress: () => setNewCode('') }]
    );
  };

  const renderInfluencerItem = ({ item, index }) => (
    <TouchableOpacity 
      key={item.id || index}
      style={[
        styles.influencerCard,
        item.id === parseInt(influencerId) && styles.selectedCard
      ]}
      onPress={() => setInfluencerId(item.id.toString())}
    >
      <Text style={styles.influencerName}>{item.name}</Text>
      <Text style={styles.influencerUsername}>{item.username}</Text>
      <View style={styles.statsRow}>
        <Text style={styles.stat}>👥 {item.followers}</Text>
        <Text style={styles.stat}>🎯 {item.specialty}</Text>
        <Text style={styles.stat}>📈 {item.success_rate}</Text>
      </View>
      {item.verified && <Text style={styles.verifiedBadge}>✓ Verified</Text>}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>👑 Influencer Dashboard</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Influencer</Text>
        <FlatList
          data={influencers}
          renderItem={renderInfluencerItem}
          keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.influencerList}
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading analytics...</Text>
        </View>
      ) : analytics && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Analytics for {analytics.name}</Text>
          
          <View style={styles.analyticsGrid}>
            <View style={styles.analyticCard}>
              <Text style={styles.analyticValue}>{analytics.followers_growth}</Text>
              <Text style={styles.analyticLabel}>Followers Growth</Text>
            </View>
            <View style={styles.analyticCard}>
              <Text style={styles.analyticValue}>{analytics.engagement_rate}</Text>
              <Text style={styles.analyticLabel}>Engagement Rate</Text>
            </View>
            <View style={styles.analyticCard}>
              <Text style={styles.analyticValue}>{analytics.total_referrals}</Text>
              <Text style={styles.analyticLabel}>Total Referrals</Text>
            </View>
            <View style={styles.analyticCard}>
              <Text style={styles.analyticValue}>{analytics.commission_earned}</Text>
              <Text style={styles.analyticLabel}>Commission Earned</Text>
            </View>
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Generate Referral Code</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Enter custom code (optional)"
          value={newCode}
          onChangeText={setNewCode}
          placeholderTextColor="#999"
        />
        
        <View style={styles.commissionRow}>
          <Text style={styles.commissionLabel}>Commission Rate:</Text>
          <TextInput
            style={styles.commissionInput}
            value={commissionRate}
            onChangeText={setCommissionRate}
            keyboardType="numeric"
            maxLength={3}
          />
          <Text style={styles.percentSymbol}>%</Text>
        </View>

        <TouchableOpacity 
          style={styles.generateButton}
          onPress={handleGenerateCode}
          disabled={loading}
        >
          <Text style={styles.generateButtonText}>Generate Referral Code</Text>
        </TouchableOpacity>

        <Text style={styles.suggestion}>
          Suggested: {analytics?.username ? `${analytics.username}-REF` : 'Enter a code above'}
        </Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>💰 How It Works:</Text>
        <Text style={styles.infoText}>1. Share your referral code with followers</Text>
        <Text style={styles.infoText}>2. Earn commission on their bets</Text>
        <Text style={styles.infoText}>3. Track your performance in real-time</Text>
        <Text style={styles.infoText}>4. Higher engagement = Higher commission</Text>
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1e3a8a',
    textAlign: 'center',
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
    color: '#333',
  },
  influencerList: {
    paddingVertical: 10,
  },
  influencerCard: {
    backgroundColor: '#f8fafc',
    padding: 15,
    borderRadius: 8,
    marginRight: 10,
    width: 180,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  selectedCard: {
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6',
    borderWidth: 2,
  },
  influencerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 5,
  },
  influencerUsername: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  stat: {
    fontSize: 12,
    color: '#4b5563',
    marginBottom: 5,
  },
  verifiedBadge: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 5,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  analyticCard: {
    backgroundColor: '#f0f9ff',
    padding: 15,
    borderRadius: 8,
    width: '48%',
    marginBottom: 10,
    alignItems: 'center',
  },
  analyticValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0369a1',
    marginBottom: 5,
  },
  analyticLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  commissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  commissionLabel: {
    fontSize: 16,
    color: '#4b5563',
    marginRight: 10,
  },
  commissionInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    width: 60,
    textAlign: 'center',
    fontSize: 16,
    backgroundColor: '#fff',
  },
  percentSymbol: {
    fontSize: 16,
    color: '#4b5563',
    marginLeft: 5,
  },
  generateButton: {
    backgroundColor: '#8b5cf6',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  generateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  suggestion: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  infoBox: {
    backgroundColor: '#f3e8ff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 30,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#6d28d9',
  },
  infoText: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 5,
  },
});

export default InfluencerDashboard;
