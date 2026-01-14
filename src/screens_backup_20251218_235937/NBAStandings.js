import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import nbaService from '../services/nba-service';

const NBAStandings = () => {
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConference, setSelectedConference] = useState('East');

  useEffect(() => {
    loadStandings();
  }, []);

  const loadStandings = async () => {
    try {
      const response = await nbaService.getStandings();
      setStandings(response.standings || []);
    } catch (error) {
      console.error('Error loading standings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStandings = standings.filter(
    team => team.conference === selectedConference
  );

  const renderTeam = ({ item, index }) => (
    <View style={styles.teamRow}>
      <View style={styles.rankCell}>
        <Text style={styles.rankText}>{index + 1}</Text>
      </View>
      <View style={styles.teamCell}>
        <Text style={styles.teamName}>{item.name}</Text>
        <Text style={styles.teamCity}>{item.city}</Text>
      </View>
      <View style={styles.statsCell}>
        <Text style={styles.statsText}>{item.wins}-{item.losses}</Text>
      </View>
      <View style={styles.statsCell}>
        <Text style={styles.statsText}>{item.win_percentage || '0.0'}%</Text>
      </View>
      <View style={styles.statsCell}>
        <Text style={styles.statsText}>{item.games_played}</Text>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>NBA Standings</Text>
      </View>

      <View style={styles.conferenceSelector}>
        <TouchableOpacity
          style={[
            styles.conferenceButton,
            selectedConference === 'East' && styles.conferenceButtonActive
          ]}
          onPress={() => setSelectedConference('East')}
        >
          <Text style={[
            styles.conferenceButtonText,
            selectedConference === 'East' && styles.conferenceButtonTextActive
          ]}>
            Eastern Conference
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.conferenceButton,
            selectedConference === 'West' && styles.conferenceButtonActive
          ]}
          onPress={() => setSelectedConference('West')}
        >
          <Text style={[
            styles.conferenceButtonText,
            selectedConference === 'West' && styles.conferenceButtonTextActive
          ]}>
            Western Conference
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tableHeader}>
        <View style={styles.rankHeader}><Text style={styles.headerText}>#</Text></View>
        <View style={styles.teamHeader}><Text style={styles.headerText}>Team</Text></View>
        <View style={styles.statsHeader}><Text style={styles.headerText}>Record</Text></View>
        <View style={styles.statsHeader}><Text style={styles.headerText}>PCT</Text></View>
        <View style={styles.statsHeader}><Text style={styles.headerText}>GP</Text></View>
      </View>

      {loading ? (
        <Text style={styles.loadingText}>Loading standings...</Text>
      ) : (
        <FlatList
          data={filteredStandings}
          renderItem={renderTeam}
          keyExtractor={(item) => item.name}
          scrollEnabled={false}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#1a237e',
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  conferenceSelector: {
    flexDirection: 'row',
    backgroundColor: 'white',
    margin: 10,
    borderRadius: 8,
    overflow: 'hidden',
  },
  conferenceButton: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
  },
  conferenceButtonActive: {
    backgroundColor: '#1a237e',
  },
  conferenceButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  conferenceButtonTextActive: {
    color: 'white',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#333',
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginHorizontal: 10,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  rankHeader: {
    width: 40,
    alignItems: 'center',
  },
  teamHeader: {
    flex: 1,
    alignItems: 'flex-start',
    paddingLeft: 10,
  },
  statsHeader: {
    width: 60,
    alignItems: 'center',
  },
  headerText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  teamRow: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  rankCell: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  teamCell: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: 10,
  },
  teamName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  teamCity: {
    fontSize: 12,
    color: '#666',
  },
  statsCell: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsText: {
    fontSize: 14,
    color: '#333',
  },
  loadingText: {
    textAlign: 'center',
    padding: 20,
    color: '#666',
  },
});

export default NBAStandings;
