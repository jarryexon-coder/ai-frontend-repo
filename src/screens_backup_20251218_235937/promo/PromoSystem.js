import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  FlatList,
} from 'react-native';
import apiService from '../../services/apiService';

const PromoSystem = () => {
  const [userId, setUserId] = useState('1');
  const [promoCode, setPromoCode] = useState('');
  const [validationResult, setValidationResult] = useState(null);
  const [applicationResult, setApplicationResult] = useState(null);
  const [publicPromos, setPublicPromos] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPublicPromos();
  }, []);

  const loadPublicPromos = async () => {
    try {
      const result = await apiService.getPromos();
      setPublicPromos(result.promos || []);
    } catch (error) {
      Alert.alert('Error', `Failed to load public promo codes: ${error.message}`);
    }
  };

  const handleValidate = async () => {
    if (!promoCode.trim()) {
      Alert.alert('Error', 'Please enter a promo code');
      return;
    }

    setLoading(true);
    try {
      // In a real app, you would call validation endpoint
      // For now, simulate validation
      setValidationResult({
        valid: true,
        code: promoCode,
        message: 'Valid promo code!',
        discount: '10%',
        minPurchase: '$20'
      });
    } catch (error) {
      Alert.alert('Validation Error', error.message || 'Failed to validate code');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!promoCode.trim()) {
      Alert.alert('Error', 'Please enter a promo code');
      return;
    }

    setLoading(true);
    try {
      // In a real app, you would call apply endpoint
      // For now, simulate application
      setApplicationResult({
        success: true,
        message: `Promo code "${promoCode}" applied successfully!`,
        discountApplied: '$10.00'
      });
      Alert.alert('Success', 'Promo code applied successfully!');
    } catch (error) {
      Alert.alert('Application Error', error.message || 'Failed to apply code');
    } finally {
      setLoading(false);
    }
  };

  const renderPromoItem = ({ item, index }) => (
    <View key={item.id || index} style={styles.promoCard}>
      <Text style={styles.promoName}>{item.name}</Text>
      <Text style={styles.promoDescription}>{item.description}</Text>
      <View style={styles.promoFooter}>
        <Text style={styles.promoCode}>Code: <Text style={styles.codeHighlight}>{item.code}</Text></Text>
        <Text style={styles.promoExpiry}>Expires: {item.expiration}</Text>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🎁 Promo Code System</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Apply Promo Code</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter promo code"
          value={promoCode}
          onChangeText={setPromoCode}
          placeholderTextColor="#999"
        />
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.button, styles.validateButton]} 
            onPress={handleValidate}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Validate</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.button, styles.applyButton]} 
            onPress={handleApply}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Apply</Text>
          </TouchableOpacity>
        </View>

        {validationResult && (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Validation Result:</Text>
            <Text style={styles.resultText}>{validationResult.message}</Text>
            {validationResult.discount && (
              <Text style={styles.resultText}>Discount: {validationResult.discount}</Text>
            )}
          </View>
        )}

        {applicationResult && (
          <View style={[styles.resultCard, styles.successCard]}>
            <Text style={styles.resultTitle}>Application Result:</Text>
            <Text style={styles.resultText}>{applicationResult.message}</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Available Promo Codes</Text>
        {publicPromos.length > 0 ? (
          <FlatList
            data={publicPromos}
            renderItem={renderPromoItem}
            keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
            scrollEnabled={false}
            contentContainerStyle={styles.listContainer}
          />
        ) : (
          <Text style={styles.noPromos}>Loading promo codes...</Text>
        )}
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>💡 How to Use:</Text>
        <Text style={styles.infoText}>1. Enter a promo code in the field above</Text>
        <Text style={styles.infoText}>2. Click "Validate" to check if it's valid</Text>
        <Text style={styles.infoText}>3. Click "Apply" to use the code</Text>
        <Text style={styles.infoText}>4. Available codes are listed below</Text>
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
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  validateButton: {
    backgroundColor: '#3b82f6',
  },
  applyButton: {
    backgroundColor: '#10b981',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultCard: {
    backgroundColor: '#fef3c7',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  successCard: {
    backgroundColor: '#d1fae5',
    borderLeftColor: '#10b981',
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#92400e',
  },
  resultText: {
    fontSize: 14,
    color: '#4b5563',
  },
  listContainer: {
    marginTop: 10,
  },
  promoCard: {
    backgroundColor: '#f8fafc',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  promoName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 5,
  },
  promoDescription: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 10,
  },
  promoFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  promoCode: {
    fontSize: 14,
    color: '#6b7280',
  },
  codeHighlight: {
    color: '#1e40af',
    fontWeight: 'bold',
  },
  promoExpiry: {
    fontSize: 12,
    color: '#ef4444',
    fontStyle: 'italic',
  },
  noPromos: {
    textAlign: 'center',
    color: '#6b7280',
    fontStyle: 'italic',
    padding: 20,
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

export default PromoSystem;
