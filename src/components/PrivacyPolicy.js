// src/components/PrivacyPolicy.js
// Complete Privacy Policy for NBA Fantasy Pro with Third-Party Links
import React from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  Linking, 
  TouchableOpacity,
  SafeAreaView 
} from 'react-native';

const PrivacyPolicy = ({ navigation }) => {
  // Handle opening external links
  const openLink = (url) => {
    Linking.openURL(url).catch(err => 
      console.error('Failed to open URL:', err)
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Privacy Policy</Text>
          <Text style={styles.subtitle}>NBA Fantasy Pro</Text>
          <Text style={styles.lastUpdated}>Last Updated: January 13, 2024</Text>
        </View>

        {/* Introduction */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Introduction</Text>
          <Text style={styles.paragraph}>
            Welcome to NBA Fantasy Pro. We respect your privacy and are committed to protecting 
            your personal data. This privacy policy explains how we collect, use, disclose, 
            and safeguard your information when you use our mobile application.
          </Text>
          <Text style={styles.paragraph}>
            Please read this privacy policy carefully. By using NBA Fantasy Pro, you consent 
            to the data practices described in this policy.
          </Text>
        </View>

        {/* Information We Collect */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Information We Collect</Text>
          
          <Text style={styles.subSectionTitle}>1.1 Personal Information</Text>
          <Text style={styles.paragraph}>
            When you create an account, we may collect:
            {"\n"}• Email address
            {"\n"}• Username
            {"\n"}• Password (securely hashed)
          </Text>

          <Text style={styles.subSectionTitle}>1.2 Usage Information</Text>
          <Text style={styles.paragraph}>
            We automatically collect information about how you interact with our app:
            {"\n"}• Favorite teams and players
            {"\n"}• Feature usage statistics
            {"\n"}• App performance data
            {"\n"}• Device information (model, OS version)
          </Text>

          <Text style={styles.subSectionTitle}>1.3 Sports Data</Text>
          <Text style={styles.paragraph}>
            To provide real-time sports analytics, we process:
            {"\n"}• NBA game scores and statistics
            {"\n"}• Player performance data
            {"\n"}• Team standings and schedules
            {"\n"}• This data is sourced from third-party sports APIs
          </Text>
        </View>

        {/* How We Use Your Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
          <Text style={styles.paragraph}>
            We use the collected information to:
            {"\n"}• Provide personalized sports analytics and predictions
            {"\n"}• Improve app features and user experience
            {"\n"}• Process in-app purchases and subscriptions
            {"\n"}• Send important app updates and notifications (if you opt-in)
            {"\n"}• Detect and prevent fraudulent activities
            {"\n"}• Comply with legal obligations
          </Text>
        </View>

        {/* Third-Party Services */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Third-Party Services</Text>
          <Text style={styles.paragraph}>
            Our app relies on several third-party services to function properly. Each service 
            has its own privacy policy governing how they handle your information.
          </Text>

          <Text style={styles.subSectionTitle}>3.1 Payment Processing</Text>
          <TouchableOpacity onPress={() => openLink('https://www.revenuecat.com/privacy')}>
            <Text style={styles.link}>
              • RevenueCat - In-app purchase and subscription management
            </Text>
          </TouchableOpacity>

          <Text style={styles.subSectionTitle}>3.2 Analytics & Infrastructure</Text>
          <TouchableOpacity onPress={() => openLink('https://policies.google.com/privacy')}>
            <Text style={styles.link}>
              • Firebase (Google) - Analytics, crash reporting, and cloud services
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => openLink('https://railway.app/legal/privacy')}>
            <Text style={styles.link}>
              • Railway - Application hosting and backend infrastructure
            </Text>
          </TouchableOpacity>

          <Text style={styles.subSectionTitle}>3.3 Sports Data Providers</Text>
          <Text style={styles.paragraph}>
            We source sports data from the following providers. Please review their privacy policies:
          </Text>
          <TouchableOpacity onPress={() => openLink('https://www.balldontlie.io/#privacy')}>
            <Text style={styles.link}>• balldontlie.io - NBA statistics API</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => openLink('https://sportradar.com/terms-of-use/')}>
            <Text style={styles.link}>• Sportradar - Official sports data</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => openLink('https://site.api.espn.com/')}>
            <Text style={styles.link}>• ESPN API - Sports news and scores</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => openLink('https://the-odds-api.com/')}>
            <Text style={styles.link}>• The Odds API - Sports betting odds</Text>
          </TouchableOpacity>

          <Text style={styles.note}>
            Note: We are not responsible for the privacy practices of these third-party services. 
            We encourage you to review their privacy policies to understand how they handle your data.
          </Text>
        </View>

        {/* Data Security */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Data Security</Text>
          <Text style={styles.paragraph}>
            We implement industry-standard security measures to protect your personal 
            information from unauthorized access, alteration, disclosure, or destruction.
          </Text>
          <Text style={styles.paragraph}>
            However, no method of transmission over the Internet or electronic storage 
            is 100% secure. While we strive to use commercially acceptable means to 
            protect your personal information, we cannot guarantee absolute security.
          </Text>
        </View>

        {/* Data Retention */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Data Retention</Text>
          <Text style={styles.paragraph}>
            We retain your personal information only for as long as necessary to:
            {"\n"}• Provide you with our services
            {"\n"}• Comply with legal obligations
            {"\n"}• Resolve disputes
            {"\n"}• Enforce our agreements
          </Text>
          <Text style={styles.paragraph}>
            You can request deletion of your account and associated data at any time 
            by contacting us at privacy@nbafantasypro.com.
          </Text>
        </View>

        {/* Your Rights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Your Rights</Text>
          <Text style={styles.paragraph}>
            Depending on your location, you may have the following rights regarding 
            your personal data:
            {"\n"}• Right to access your personal data
            {"\n"}• Right to correct inaccurate data
            {"\n"}• Right to delete your data
            {"\n"}• Right to restrict processing
            {"\n"}• Right to data portability
            {"\n"}• Right to object to processing
          </Text>
          <Text style={styles.paragraph}>
            To exercise these rights, please contact us using the information below.
          </Text>
        </View>

        {/* Children's Privacy */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Children's Privacy</Text>
          <Text style={styles.paragraph}>
            Our app is not intended for children under 13 years of age. We do not 
            knowingly collect personal information from children under 13. If you are 
            a parent or guardian and believe your child has provided us with personal 
            information, please contact us immediately.
          </Text>
        </View>

        {/* Changes to This Policy */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Changes to This Policy</Text>
          <Text style={styles.paragraph}>
            We may update our privacy policy from time to time. We will notify you of 
            any changes by posting the new privacy policy on this page and updating 
            the "Last Updated" date.
          </Text>
          <Text style={styles.paragraph}>
            You are advised to review this privacy policy periodically for any changes. 
            Changes to this privacy policy are effective when they are posted on this page.
          </Text>
        </View>

        {/* Contact Us */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Contact Us</Text>
          <Text style={styles.paragraph}>
            If you have any questions or concerns about this privacy policy or our 
            data practices, please contact us:
          </Text>
          <Text style={styles.contactInfo}>
            Email: privacy@nbafantasypro.com{"\n"}
            Subject: Privacy Policy Inquiry
          </Text>
          <Text style={styles.paragraph}>
            We aim to respond to all inquiries within 5-7 business days.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            This privacy policy was created specifically for NBA Fantasy Pro 
            and is effective as of the last updated date shown above.
          </Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Back to App</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#3b82f6',
    marginBottom: 10,
    textAlign: 'center',
  },
  lastUpdated: {
    fontSize: 14,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 25,
    backgroundColor: '#1e293b',
    padding: 18,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#cbd5e1',
    marginTop: 12,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 15,
    color: '#cbd5e1',
    lineHeight: 22,
    marginBottom: 12,
  },
  link: {
    fontSize: 15,
    color: '#3b82f6',
    marginBottom: 8,
    paddingVertical: 4,
    textDecorationLine: 'underline',
  },
  note: {
    fontSize: 14,
    color: '#fbbf24',
    fontStyle: 'italic',
    backgroundColor: '#374151',
    padding: 12,
    borderRadius: 8,
    marginTop: 15,
    borderLeftWidth: 3,
    borderLeftColor: '#f59e0b',
  },
  contactInfo: {
    fontSize: 15,
    color: '#10b981',
    backgroundColor: '#064e3b',
    padding: 12,
    borderRadius: 8,
    marginVertical: 10,
    fontFamily: 'monospace',
  },
  footer: {
    marginTop: 20,
    marginBottom: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 25,
    fontStyle: 'italic',
  },
  backButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PrivacyPolicy;
