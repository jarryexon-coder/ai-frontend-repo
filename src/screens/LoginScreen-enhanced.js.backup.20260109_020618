import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  ActivityIndicator
} from 'react-native';
import { useAuth } from '../contexts/AuthContext'; // Using your existing AuthContext

export default function LoginScreen({ navigation }) {
  const { login, register, loading: authLoading } = useAuth(); // Using your existing auth functions
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [localLoading, setLocalLoading] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLocalLoading(true);
    try {
      if (isLogin) {
        await login(email, password); // Your existing login function
      } else {
        await register(email, password, promoCode); // Updated register with promo
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Authentication failed');
    } finally {
      setLocalLoading(false);
    }
  };

  const handleInfluencerPromo = () => {
    Alert.alert(
      '🎁 Influencer Promo Codes',
      'Enter an influencer promo code during signup to get special discounts!\n\nPopular codes:\n• NBAGURU20 - 20% off\n• BALLISLIFE15 - 15% off\n• HOOPS10 - 10% off',
      [
        {
          text: 'Got it!',
          style: 'default'
        }
      ]
    );
  };

  const loading = authLoading || localLoading;

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>🏀</Text>
          </View>
          <Text style={styles.title}>NBA Fantasy Pro</Text>
          <Text style={styles.subtitle}>
            {isLogin ? 'Sign in to your account' : 'Create your account'}
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
              placeholderTextColor="#9ca3af"
            />
          </View>

          {!isLogin && (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Confirm Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  editable={!loading}
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.promoLabelContainer}>
                  <Text style={styles.label}>Promo Code (Optional)</Text>
                  <TouchableOpacity onPress={handleInfluencerPromo}>
                    <Text style={styles.promoHelp}>What's this?</Text>
                  </TouchableOpacity>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Enter influencer promo code"
                  value={promoCode}
                  onChangeText={setPromoCode}
                  autoCapitalize="characters"
                  editable={!loading}
                  placeholderTextColor="#9ca3af"
                />
                {promoCode && (
                  <Text style={styles.promoHint}>
                    {promoCode.includes('20') ? '🎉 20% discount applied!' :
                     promoCode.includes('15') ? '🎁 15% discount applied!' :
                     promoCode.includes('10') ? '✨ 10% discount applied!' :
                     'Validating promo code...'}
                  </Text>
                )}
              </View>
            </>
          )}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleAuth}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.buttonText}>
                {isLogin ? 'Sign In' : 'Create Account'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => setIsLogin(!isLogin)}
            disabled={loading}
          >
            <Text style={styles.switchText}>
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <Text style={styles.switchTextBold}>
                {isLogin ? 'Sign up' : 'Sign in'}
              </Text>
            </Text>
          </TouchableOpacity>

          {!isLogin && (
            <TouchableOpacity 
              style={styles.influencerButton}
              onPress={handleInfluencerPromo}
              disabled={loading}
            >
              <Text style={styles.influencerButtonText}>
                🎬 Learn about Influencer Promo Codes
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.features}>
          <Text style={styles.featuresTitle}>With NBA Fantasy Pro, you get:</Text>
          <View style={styles.featureRow}>
            <Text style={styles.featureIcon}>📊</Text>
            <Text style={styles.featureText}>Advanced Player Analytics</Text>
          </View>
          <View style={styles.featureRow}>
            <Text style={styles.featureIcon}>🤖</Text>
            <Text style={styles.featureText}>AI-Powered Predictions</Text>
          </View>
          <View style={styles.featureRow}>
            <Text style={styles.featureIcon}>⚡</Text>
            <Text style={styles.featureText}>Real-time Game Updates</Text>
          </View>
          <View style={styles.featureRow}>
            <Text style={styles.featureIcon}>🎁</Text>
            <Text style={styles.featureText}>Exclusive Promo Rewards</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By continuing, you agree to our{' '}
            <Text style={styles.footerLink}>Terms of Service</Text> and{' '}
            <Text style={styles.footerLink}>Privacy Policy</Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  logo: {
    fontSize: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  form: {
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  promoLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  promoHelp: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '600',
  },
  input: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#f9fafb',
    color: '#1f2937',
  },
  promoHint: {
    fontSize: 12,
    color: '#10b981',
    marginTop: 6,
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#4f46e5',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: '#a5b4fc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  switchButton: {
    marginTop: 24,
    alignItems: 'center',
  },
  switchText: {
    color: '#6b7280',
    fontSize: 14,
  },
  switchTextBold: {
    fontWeight: '600',
    color: '#4f46e5',
  },
  influencerButton: {
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  influencerButtonText: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '500',
  },
  features: {
    backgroundColor: '#f8fafc',
    padding: 24,
    borderRadius: 16,
    marginBottom: 24,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  featureText: {
    fontSize: 14,
    color: '#4b5563',
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  footerText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 16,
  },
  footerLink: {
    color: '#4f46e5',
    fontWeight: '600',
  },
});
