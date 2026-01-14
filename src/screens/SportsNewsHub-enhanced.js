import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
  Share,
  TextInput,
  FlatList,
  Modal,
  SafeAreaView,
  Platform
} from 'react-native';
import ProgressBar from 'react-native-animated-progress';
import CircularProgress from '../components/CircularProgress';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logAnalyticsEvent, logScreenView } from '../services/firebase';

// Import services and hooks
import apiService from '../services/api';  // No curly braces!
import { useSportsData } from '../hooks/useSportsData';
import { useAnalytics } from '../hooks/useAnalytics';
import SearchBar from '../components/SearchBar';
import { useSearch } from '../providers/SearchProvider';
import useDailyLocks from '../hooks/useDailyLocks';

// Import navigation helper
import { useAppNavigation } from '../navigation/NavigationHelper';

const { width } = Dimensions.get('window');

// Analytics Box Component for Sports News Hub
const AnalyticsBox = () => {
  const [analyticsEvents, setAnalyticsEvents] = useState([]);
  const [showAnalyticsBox, setShowAnalyticsBox] = useState(false);

  useEffect(() => {
    loadAnalyticsEvents();
    // Set up interval to refresh analytics every 10 seconds
    const interval = setInterval(loadAnalyticsEvents, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadAnalyticsEvents = async () => {
    try {
      const eventsString = await AsyncStorage.getItem('analytics_events');
      if (eventsString) {
        const events = JSON.parse(eventsString);
        // Get only the 10 most recent sports news related events
        const sportsNewsEvents = events.filter(event => 
          event.event.includes('sports_news') || 
          event.event.includes('article') ||
          event.event.includes('news') ||
          event.event.includes('trending') ||
          event.event.includes('bookmark')
        ).slice(-10).reverse();
        setAnalyticsEvents(sportsNewsEvents);
      }
    } catch (error) {
      console.error('Failed to load analytics events', error);
    }
  };

  const clearAnalyticsEvents = async () => {
    try {
      await AsyncStorage.removeItem('analytics_events');
      setAnalyticsEvents([]);
      Alert.alert('Analytics Cleared', 'All analytics events have been cleared.');
    } catch (error) {
      console.error('Failed to clear analytics events', error);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!showAnalyticsBox) {
    return (
      <TouchableOpacity 
        style={analyticsStyles.floatingButton}
        onPress={() => {
          setShowAnalyticsBox(true);
          logAnalyticsEvent('analytics_box_opened', {
            screen: 'sports_news_hub', 
            event_count: analyticsEvents.length 
          });
        }}
      >
        <LinearGradient
          colors={['#3b82f6', '#1d4ed8']}
          style={analyticsStyles.floatingButtonGradient}
        >
          <Ionicons name="analytics" size={20} color="white" />
          <Text style={analyticsStyles.floatingButtonText}>Analytics</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <View style={analyticsStyles.container}>
      <LinearGradient
        colors={['#1e293b', '#0f172a']}
        style={analyticsStyles.gradient}
      >
        <View style={analyticsStyles.header}>
          <View style={analyticsStyles.headerLeft}>
            <Ionicons name="analytics" size={24} color="#3b82f6" />
            <Text style={analyticsStyles.title}>Sports News Analytics</Text>
          </View>
          <View style={analyticsStyles.headerRight}>
            <TouchableOpacity 
              style={analyticsStyles.iconButton}
              onPress={() => {
                clearAnalyticsEvents();
                logAnalyticsEvent('analytics_cleared', { screen: 'sports_news_hub' });
              }}
            >
              <Ionicons name="trash-outline" size={20} color="#ef4444" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={analyticsStyles.iconButton}
              onPress={() => setShowAnalyticsBox(false)}
            >
              <Ionicons name="close" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={analyticsStyles.statsContainer}>
          <View style={analyticsStyles.statItem}>
            <Text style={analyticsStyles.statValue}>{analyticsEvents.length}</Text>
            <Text style={analyticsStyles.statLabel}>Total Events</Text>
          </View>
          <View style={analyticsStyles.statItem}>
            <Text style={analyticsStyles.statValue}>
              {analyticsEvents.filter(e => e.event.includes('article')).length}
            </Text>
            <Text style={analyticsStyles.statLabel}>Articles</Text>
          </View>
          <View style={analyticsStyles.statItem}>
            <Text style={analyticsStyles.statValue}>
              {analyticsEvents.filter(e => e.event.includes('bookmark')).length}
            </Text>
            <Text style={analyticsStyles.statLabel}>Bookmarks</Text>
          </View>
        </View>

        <View style={analyticsStyles.eventsContainer}>
          <Text style={analyticsStyles.eventsTitle}>Recent Sports News Events</Text>
          <ScrollView style={analyticsStyles.eventsList}>
            {analyticsEvents.length === 0 ? (
              <View style={analyticsStyles.emptyEvents}>
                <Ionicons name="newspaper-outline" size={40} color="#475569" />
                <Text style={analyticsStyles.emptyText}>No sports news analytics recorded</Text>
                <Text style={analyticsStyles.emptySubtext}>Read articles to see events</Text>
              </View>
            ) : (
              analyticsEvents.map((event, index) => (
                <View key={index} style={analyticsStyles.eventItem}>
                  <View style={analyticsStyles.eventHeader}>
                    <View style={[
                      analyticsStyles.eventTypeBadge,
                      event.event.includes('error') ? analyticsStyles.errorBadge :
                      event.event.includes('share') ? analyticsStyles.shareBadge :
                      event.event.includes('bookmark') ? analyticsStyles.bookmarkBadge :
                      analyticsStyles.infoBadge
                    ]}>
                      <Ionicons 
                        name={
                          event.event.includes('error') ? 'warning' :
                          event.event.includes('share') ? 'share-social' :
                          event.event.includes('bookmark') ? 'bookmark' :
                          'newspaper'
                        } 
                        size={12} 
                        color="white" 
                      />
                      <Text style={analyticsStyles.eventTypeText}>
                        {event.event.split('_').slice(-1)[0]}
                      </Text>
                    </View>
                    <Text style={analyticsStyles.eventTime}>{formatTimestamp(event.timestamp)}</Text>
                  </View>
                  <Text style={analyticsStyles.eventName}>{event.event}</Text>
                  {Object.keys(event.params).length > 0 && (
                    <View style={analyticsStyles.eventParamsContainer}>
                      <Text style={analyticsStyles.eventParams}>
                        {JSON.stringify(event.params, null, 2)}
                      </Text>
                    </View>
                  )}
                </View>
              ))
            )}
          </ScrollView>
        </View>

        <TouchableOpacity 
          style={analyticsStyles.refreshButton}
          onPress={loadAnalyticsEvents}
        >
          <Ionicons name="refresh" size={16} color="white" />
          <Text style={analyticsStyles.refreshButtonText}>Refresh Analytics</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
};

// Analytics Box Styles
const analyticsStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: width * 0.9,
    maxWidth: 400,
    height: 400,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
    backgroundColor: '#1e293b', // FIX: Added solid background color
  },
  gradient: {
    flex: 1,
    padding: 16,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    backgroundColor: '#3b82f6', // FIX: Added solid background color
  },
  floatingButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
  },
  floatingButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
  iconButton: {
    padding: 4,
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 4,
  },
  eventsContainer: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  eventsTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  eventsList: {
    flex: 1,
  },
  emptyEvents: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
  },
  emptySubtext: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  eventItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6',
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  eventTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  infoBadge: {
    backgroundColor: '#3b82f6',
  },
  bookmarkBadge: {
    backgroundColor: '#f59e0b',
  },
  shareBadge: {
    backgroundColor: '#10b981',
  },
  errorBadge: {
    backgroundColor: '#ef4444',
  },
  eventTypeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  eventTime: {
    color: '#94a3b8',
    fontSize: 10,
  },
  eventName: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  eventParamsContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 4,
    padding: 6,
    marginTop: 4,
  },
  eventParams: {
    color: '#cbd5e1',
    fontSize: 10,
  },
  refreshButton: {
    backgroundColor: '#0ea5e9',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});

// ENHANCED: Comprehensive list of beat writers from all major teams
const TEAM_BEAT_WRITERS = {
  // NBA Teams (30 teams)
  'Atlanta Hawks': ['Chris Kirschner', 'Sarah K. Spencer', 'Lauren L. Williams'],
  'Boston Celtics': ['Jared Weiss', 'Jay King', 'Brian Robb'],
  'Brooklyn Nets': ['Alex Schiffer', 'Kristian Winfield', 'Brian Lewis'],
  'Charlotte Hornets': ['Rod Boone', 'James Plowright', 'Steve Reed'],
  'Chicago Bulls': ['K.C. Johnson', 'Rob Schaefer', 'Darnell Mayberry'],
  'Cleveland Cavaliers': ['Chris Fedor', 'Evan Dammarell', 'Kelsey Russo'],
  'Dallas Mavericks': ['Brad Townsend', 'Callie Caplan', 'Eddie Sefko'],
  'Denver Nuggets': ['Mike Singer', 'Harrison Wind', 'Bennett Durando'],
  'Detroit Pistons': ['Omari Sankofa II', 'James L. Edwards III', 'Rod Beard'],
  'Golden State Warriors': ['Anthony Slater', 'Connor Letourneau', 'Marcus Thompson II'],
  'Houston Rockets': ['Jonathan Feigen', 'Kelly Iko', 'Salman Ali'],
  'Indiana Pacers': ['Scott Agness', 'James Boyd', 'Tony East'],
  'LA Clippers': ['Andrew Greif', 'Law Murray', 'Mirjam Swanson'],
  'Los Angeles Lakers': ['Jovan Buha', 'Kyle Goon', 'Dan Woike'],
  'Memphis Grizzlies': ['Drew Hill', 'Damichael Cole', 'Evan Barnes'],
  'Miami Heat': ['Anthony Chiang', 'Ira Winderman', 'Barry Jackson'],
  'Milwaukee Bucks': ['Eric Nehm', 'Jim Owczarski', 'Lori Nickel'],
  'Minnesota Timberwolves': ['Jon Krawczynski', 'Chris Hine', 'Dane Moore'],
  'New Orleans Pelicans': ['Christian Clark', 'Will Guillory', 'Jim Eichenhofer'],
  'New York Knicks': ['Fred Katz', 'Steve Popper', 'Ian Begley'],
  'Oklahoma City Thunder': ['Joe Mussatto', 'Clemente Almanza', 'Andrew Schlecht'],
  'Orlando Magic': ['Khobi Price', 'Jason Beede', 'Josh Robbins'],
  'Philadelphia 76ers': ['Keith Pompey', 'Kyle Neubeck', 'Gina Mizell'],
  'Phoenix Suns': ['Duane Rankin', 'Gerald Bourguet', 'Kellan Olson'],
  'Portland Trail Blazers': ['Aaron Fentress', 'Sean Highkin', 'Casey Holdahl'],
  'Sacramento Kings': ['James Ham', 'Jason Anderson', 'Sean Cunningham'],
  'San Antonio Spurs': ['Tom Orsborn', 'Jeff McDonald', 'Mike Finger'],
  'Toronto Raptors': ['Josh Lewenberg', 'Michael Grange', 'Doug Smith'],
  'Utah Jazz': ['Andy Larsen', 'Sarah Todd', 'Eric Walden'],
  'Washington Wizards': ['Josh Robbins', 'Ava Wallace', 'Neil Dalal'],
  
  // NFL Teams (32 teams)
  'Arizona Cardinals': ['Bob McManaman', 'Tyler Drake', 'John Gambadoro'],
  'Atlanta Falcons': ['Tori McElhaney', 'Michael Rothstein', 'Scott Bair'],
  'Baltimore Ravens': ['Jeff Zrebiec', 'Jonas Shaffer', 'Bo Smolka'],
  'Buffalo Bills': ['Matt Parrino', 'Ryan Talbot', 'Sal Capaccio'],
  'Carolina Panthers': ['Joe Person', 'Mike Kaye', 'Ellis L. Williams'],
  'Chicago Bears': ['Adam Jahns', 'Kevin Fishbain', 'Brad Biggs'],
  'Cincinnati Bengals': ['Paul Dehner Jr.', 'Jay Morrison', 'Charlie Goldsmith'],
  'Cleveland Browns': ['Mary Kay Cabot', 'Jake Trotter', 'Scott Petrak'],
  'Dallas Cowboys': ['David Moore', 'Calvin Watkins', 'Jon Machota'],
  'Denver Broncos': ['Parker Gabriel', 'Ryan O\'Halloran', 'Benjamin Allbright'],
  'Detroit Lions': ['Dave Birkett', 'Justin Rogers', 'John Maakaron'],
  'Green Bay Packers': ['Matt Schneidman', 'Ryan Wood', 'Wes Hodkiewicz'],
  'Houston Texans': ['Aaron Wilson', 'Jonathan M. Alexander', 'Brooke Pryor'],
  'Indianapolis Colts': ['Joel A. Erickson', 'Nate Atkins', 'JJ Stankevitz'],
  'Jacksonville Jaguars': ['John Shipley', 'Demetrius Harvey', 'Mike DiRocco'],
  'Kansas City Chiefs': ['Nate Taylor', 'Herbie Teope', 'Adam Teicher'],
  'Las Vegas Raiders': ['Tashan Reed', 'Vincent Bonsignore', 'Hondo Carpenter'],
  'Los Angeles Chargers': ['Daniel Popper', 'Gilbert Manzano', 'Jeff Miller'],
  'Los Angeles Rams': ['Jourdan Rodrigue', 'Gary Klein', 'Stu Jackson'],
  'Miami Dolphins': ['Daniel Oyefusi', 'Barry Jackson', 'Marcel Louis-Jacques'],
  'Minnesota Vikings': ['Ben Goessling', 'Andrew Krammer', 'Chad Graff'],
  'New England Patriots': ['Andrew Callahan', 'Karen Guregian', 'Mark Daniels'],
  'New Orleans Saints': ['Jeff Duncan', 'Rod Walker', 'Mike Triplett'],
  'New York Giants': ['Art Stapleton', 'Pat Leonard', 'Dan Duggan'],
  'New York Jets': ['Connor Hughes', 'Rich Cimini', 'Brian Costello'],
  'Philadelphia Eagles': ['Jeff McLane', 'Zach Berman', 'Eliot Shorr-Parks'],
  'Pittsburgh Steelers': ['Ray Fittipaldo', 'Brian Batko', 'Mark Kaboly'],
  'San Francisco 49ers': ['David Lombardi', 'Matt Barrows', 'Jennifer Lee Chan'],
  'Seattle Seahawks': ['Michael-Shawn Dugar', 'Brady Henderson', 'Gregg Bell'],
  'Tampa Bay Buccaneers': ['Greg Auman', 'Rick Stroud', 'Scott Smith'],
  'Tennessee Titans': ['John Glennon', 'Buck Reising', 'Paul Kuharsky'],
  'Washington Commanders': ['John Keim', 'Nicki Jhabvala', 'Ben Standig'],
  
  // MLB Teams (30 teams)
  'Arizona Diamondbacks': ['Nick Piecoro', 'Jesse Friedman', 'Theo Mackie'],
  'Atlanta Braves': ['Justin Toscano', 'Mark Bowman', 'David O\'Brien'],
  'Baltimore Orioles': ['Nathan Ruiz', 'Andy Kostka', 'Jon Meoli'],
  'Boston Red Sox': ['Gabrielle Starr', 'Jen McCaffrey', 'Chris Cotillo'],
  'Chicago Cubs': ['Maddie Lee', 'Patrick Mooney', 'Bruce Levine'],
  'Chicago White Sox': ['Daryl Van Schouwen', 'James Fegan', 'Scott Merkin'],
  'Cincinnati Reds': ['Charlie Goldsmith', 'Bobby Nightengale', 'Mark Sheldon'],
  'Cleveland Guardians': ['Paul Hoynes', 'Joe Noga', 'Mandy Bell'],
  'Colorado Rockies': ['Patrick Saunders', 'Kyle Newman', 'Thomas Harding'],
  'Detroit Tigers': ['Evan Petzold', 'Cody Stavenhagen', 'Chris McCosky'],
  'Houston Astros': ['Chandler Rome', 'Brian McTaggart', 'Michael Schwab'],
  'Kansas City Royals': ['Anne Rogers', 'Jaylon Thompson', 'Lynn Worthy'],
  'Los Angeles Angels': ['Sam Blum', 'Jeff Fletcher', 'Rhett Bollinger'],
  'Los Angeles Dodgers': ['Jack Harris', 'Mike DiGiovanna', 'Fabian Ardaya'],
  'Miami Marlins': ['Jordan McPherson', 'Craig Mish', 'Christina De Nicola'],
  'Milwaukee Brewers': ['Todd Rosiak', 'Curt Hogg', 'Adam McCalvy'],
  'Minnesota Twins': ['Betsy Helfand', 'Aaron Gleeman', 'Bobby Nightengale'],
  'New York Mets': ['Tim Healey', 'Anthony DiComo', 'Mike Puma'],
  'New York Yankees': ['Bryan Hoch', 'Chris Kirschner', 'Gary Phillips'],
  'Oakland Athletics': ['Matt Kawahara', 'Martín Gallegos', 'Casey Pratt'],
  'Philadelphia Phillies': ['Scott Lauber', 'Alex Coffey', 'Matt Gelb'],
  'Pittsburgh Pirates': ['Jason Mackey', 'Rob Biertempfel', 'Kevin Gorman'],
  'San Diego Padres': ['Kevin Acee', 'Jeff Sanders', 'Dennis Lin'],
  'San Francisco Giants': ['Susan Slusser', 'John Shea', 'Alex Pavlovic'],
  'Seattle Mariners': ['Ryan Divish', 'Daniel Kramer', 'Shannon Drayer'],
  'St. Louis Cardinals': ['Derrick Goold', 'Katie Woo', 'Ben Frederickson'],
  'Tampa Bay Rays': ['Marc Topkin', 'Kristie Ackert', 'Juan Toribio'],
  'Texas Rangers': ['Evan Grant', 'Kennedi Landry', 'Stefan Stevenson'],
  'Toronto Blue Jays': ['Keegan Matheson', 'Kaitlyn McGrath', 'Mike Wilner'],
  'Washington Nationals': ['Andrew Golden', 'Bobby Blanco', 'Mark Zuckerman'],
  
  // NHL Teams (32 teams)
  'Anaheim Ducks': ['Elliott Teaford', 'Adam Brady', 'Eric Stephens'],
  'Arizona Coyotes': ['Jenna Ortiz', 'Craig Morgan', 'Richard Morin'],
  'Boston Bruins': ['Conor Ryan', 'Steve Conroy', 'Matt Porter'],
  'Buffalo Sabres': ['Lance Lysowski', 'Mike Harrington', 'Bill Hoppe'],
  'Calgary Flames': ['Wes Gilbertson', 'Danny Austin', 'Eric Francis'],
  'Carolina Hurricanes': ['Luke DeCock', 'Chip Alexander', 'Sara Civian'],
  'Chicago Blackhawks': ['Ben Pope', 'Phil Thompson', 'Charlie Roumeliotis'],
  'Colorado Avalanche': ['Kyle Fredrickson', 'Bennett Durando', 'Corey Masisak'],
  'Columbus Blue Jackets': ['Brian Hedger', 'Jeff Svoboda', 'Aaron Portzline'],
  'Dallas Stars': ['Matthew DeFranks', 'Lia Assimakopoulos', 'Mike Heika'],
  'Detroit Red Wings': ['Ansar Khan', 'Helene St. James', 'Max Bultman'],
  'Edmonton Oilers': ['Daniel Nugent-Bowman', 'Jim Matheson', 'Kurt Leavins'],
  'Florida Panthers': ['David Wilson', 'George Richards', 'Colby Guy'],
  'Los Angeles Kings': ['Dennis Bernstein', 'John Hoven', 'Lisa Dillman'],
  'Minnesota Wild': ['Sarah McLellan', 'Michael Russo', 'Joe Smith'],
  'Montreal Canadiens': ['Arpon Basu', 'Marc Antoine Godin', 'Stu Cowan'],
  'Nashville Predators': ['Paul Skrbina', 'Gentry Estes', 'Alex Daugherty'],
  'New Jersey Devils': ['Ryan Novozinsky', 'James Nichols', 'Corey Masisak'],
  'New York Islanders': ['Ethan Sears', 'Andrew Gross', 'Stefen Rosner'],
  'New York Rangers': ['Mollie Walker', 'Larry Brooks', 'Vince Z. Mercogliano'],
  'Ottawa Senators': ['Bruce Garrioch', 'Ian Mendes', 'Don Brennan'],
  'Philadelphia Flyers': ['Olivia Reiner', 'Giana Han', 'Sam Carchidi'],
  'Pittsburgh Penguins': ['Seth Rorabaugh', 'Mike DeFabo', 'Rob Rossi'],
  'San Jose Sharks': ['Curtis Pashelka', 'Sheng Peng', 'Corey Masisak'],
  'Seattle Kraken': ['Kate Shefte', 'Geoff Baker', 'Ryan S. Clark'],
  'St. Louis Blues': ['Jim Thomas', 'Matthew DeFranks', 'Jeremy Rutherford'],
  'Tampa Bay Lightning': ['Eduardo A. Encina', 'Mari Faiello', 'Joe Smith'],
  'Toronto Maple Leafs': ['Lance Hornby', 'Terry Koshan', 'David Alter'],
  'Vancouver Canucks': ['Patrick Johnston', 'Thomas Drance', 'Iain MacIntyre'],
  'Vegas Golden Knights': ['David Schoen', 'Steve Carp', 'Jesse Granger'],
  'Washington Capitals': ['Samantha Pell', 'Bailey Johnson', 'Tarik El-Bashir'],
  'Winnipeg Jets': ['Mike McIntyre', 'Jason Bell', 'Scott Billeck'],
};

// Function to get random beat writer for a team
const getRandomBeatWriter = (team) => {
  const writers = TEAM_BEAT_WRITERS[team] || ['Sports Analyst', 'Team Reporter', 'Beat Writer'];
  return writers[Math.floor(Math.random() * writers.length)];
};

// Function to get random team from a sport
const getRandomTeam = (sport) => {
  const teams = {
    'NBA': Object.keys(TEAM_BEAT_WRITERS).slice(0, 30), // First 30 are NBA
    'NFL': Object.keys(TEAM_BEAT_WRITERS).slice(30, 62), // Next 32 are NFL
    'MLB': Object.keys(TEAM_BEAT_WRITERS).slice(62, 92), // Next 30 are MLB
    'NHL': Object.keys(TEAM_BEAT_WRITERS).slice(92) // Rest are NHL
  };
  
  const sportTeams = teams[sport] || Object.values(teams).flat();
  return sportTeams[Math.floor(Math.random() * sportTeams.length)];
};

// Main component
const SportsNewsHub = () => {
  const { logEvent } = useAnalytics();
  const navigation = useAppNavigation();
  const { searchHistory, addToSearchHistory } = useSearch();
  const dailyLocks = useDailyLocks();

  // State variables
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [trendingStories, setTrendingStories] = useState([]);
  const [filteredTrending, setFilteredTrending] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('beat-writers');
  const [searchQuery, setSearchQuery] = useState('');
  const [trendingFilter, setTrendingFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [premiumArticlesUnlocked, setPremiumArticlesUnlocked] = useState(false);
  const [articleSentiment, setArticleSentiment] = useState({});
  const [analyticsMetrics, setAnalyticsMetrics] = useState({
    totalArticles: 0,
    trendingScore: 0,
    engagementRate: 0,
    avgReadingTime: 0,
    sentimentScore: 0,
    hotTopics: []
  });

  const flatListRef = useRef();

  // Navigation functions
  const handleNavigateToAnalytics = () => {
    navigation.goToAnalytics();
    logEvent('sports_news_navigate_analytics', {
      screen_name: 'Sports News Hub'
    });
  };

  const handleNavigateToPredictions = () => {
    navigation.goToPredictions();
    logEvent('sports_news_navigate_predictions', {
      screen_name: 'Sports News Hub'
    });
  };

  const handleNavigateToFantasy = () => {
    navigation.goToFantasy();
    logEvent('sports_news_navigate_fantasy', {
      screen_name: 'Sports News Hub'
    });
  };

  const handleNavigateToPlayerStats = (player) => {
    navigation.goToPlayerStats(player);
    logEvent('sports_news_navigate_player_stats', {
      player_name: player.name,
      screen_name: 'Sports News Hub'
    });
  };

  const handleNavigateToGameDetails = (gameId) => {
    navigation.goToGameDetails(gameId);
    logEvent('sports_news_navigate_game_details', {
      game_id: gameId,
      screen_name: 'Sports News Hub'
    });
  };

  const handleNavigateToDailyPicks = () => {
    navigation.goToDailyPicks();
    logEvent('sports_news_navigate_daily_picks', {
      screen_name: 'Sports News Hub'
    });
  };

  const handleNavigateToParlayBuilder = () => {
    navigation.goToParlayBuilder();
    logEvent('sports_news_navigate_parlay_builder', {
      screen_name: 'Sports News Hub'
    });
  };

  // Daily Locks functionality for premium articles
  const unlockPremiumArticles = async () => {
    if (dailyLocks.hasAccess) {
      // User has paid subscription, unlimited access
      setPremiumArticlesUnlocked(true);
      logEvent('premium_articles_unlocked_premium', { source: 'sports_news' });
      return true;
    } else {
      // Check if user has free daily locks available
      const result = await dailyLocks.useLock();
      
      if (result.success) {
        if (result.unlimited) {
          logEvent('premium_articles_unlocked_premium', { source: 'sports_news' });
        } else {
          logEvent('premium_articles_unlocked_free', { 
            locks_remaining: result.locksRemaining,
            source: 'sports_news'
          });
        }
        setPremiumArticlesUnlocked(true);
        return true;
      } else {
        logEvent('premium_articles_lock_failed', { 
          reason: 'daily_limit_reached',
          source: 'sports_news'
        });
        Alert.alert(
          'Daily Limit Reached',
          `You've used all ${dailyLocks.dailyLimit} free unlocks today. Upgrade for unlimited access.`,
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Upgrade', 
              onPress: () => navigation.navigate('PremiumAccess') 
            }
          ]
        );
        return false;
      }
    }
  };

  // Navigation menu component
  const renderNavigationMenu = () => (
    <View style={styles.navigationMenu}>
      <TouchableOpacity 
        style={styles.navButton}
        onPress={() => handleNavigateToPlayerStats({ name: 'Player Stats' })}
        activeOpacity={0.7}
      >
        <Ionicons name="stats-chart" size={20} color="#3b82f6" />
        <Text style={styles.navButtonText}>Player Stats</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.navButton}
        onPress={() => handleNavigateToAnalytics()}
        activeOpacity={0.7}
      >
        <Ionicons name="analytics" size={20} color="#3b82f6" />
        <Text style={styles.navButtonText}>Analytics</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.navButton}
        onPress={() => handleNavigateToPredictions()}
        activeOpacity={0.7}
      >
        <Ionicons name="trending-up" size={20} color="#3b82f6" />
        <Text style={styles.navButtonText}>AI Predict</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.navButton}
        onPress={() => handleNavigateToFantasy()}
        activeOpacity={0.7}
      >
        <Ionicons name="trophy" size={20} color="#3b82f6" />
        <Text style={styles.navButtonText}>Fantasy</Text>
      </TouchableOpacity>
    </View>
  );

  // Use sports data hook for real-time data
  const { data: sportsData, refreshAllData } = useSportsData({
    autoRefresh: true,
    refreshInterval: 60000
  });
  
  const categories = [
    { id: 'beat-writers', name: 'Beat Writers', icon: 'newspaper', color: '#3b82f6' },
    { id: 'injuries', name: 'Injury News', icon: 'medical', color: '#ef4444' },
    { id: 'rosters', name: 'Rosters', icon: 'people', color: '#8b5cf6' },
    { id: 'analytics', name: 'Analytics', icon: 'analytics', color: '#10b981' },
    { id: 'trades', name: 'Trades', icon: 'swap-horizontal', color: '#f59e0b' },
    { id: 'draft', name: 'Draft', icon: 'school', color: '#ec4899' },
    { id: 'free-agency', name: 'Free Agency', icon: 'briefcase', color: '#6366f1' },
    { id: 'advanced-stats', name: 'Advanced Stats', icon: 'stats-chart', color: '#14b8a6' },
  ];

  const trendingFilters = [
    { id: 'all', name: 'All' },
    { id: 'analytics', name: 'Analytics' },
    { id: 'injuries', name: 'Injuries' },
    { id: 'trades', name: 'Trades' },
    { id: 'breaking', name: 'Breaking' },
    { id: 'high-engagement', name: 'High Engagement' },
  ];

  // Enhanced trending stories with analytics data
  useEffect(() => {
    const initialTrendingStories = [
      {
        id: 1,
        title: 'Advanced Metrics: Which Teams Are Over/Underperforming?',
        category: 'analytics',
        time: '1h ago',
        views: '18.2K',
        trending: true,
        image: '📊',
        type: 'ANALYSIS',
        writer: 'Sarah Johnson',
        team: 'Atlanta Hawks',
        sport: 'NBA',
        sentiment: 'positive',
        engagement: 92,
        readingTime: '4 min',
        aiInsights: ['High statistical significance', '95% confidence interval', '5 key metrics analyzed'],
        isPremium: false
      },
      {
        id: 2,
        title: 'Injury Report: Key Players Sidelined This Week',
        category: 'injuries',
        time: '2h ago',
        views: '24.5K',
        trending: true,
        image: '🏥',
        type: 'BREAKING',
        writer: 'Team Doctors',
        team: 'New England Patriots',
        sport: 'NFL',
        sentiment: 'negative',
        engagement: 88,
        readingTime: '3 min',
        aiInsights: ['Affects 3 team lineups', 'Average recovery: 14 days', 'Injury correlation: 0.87'],
        isPremium: false
      },
      {
        id: 3,
        title: 'Trade Rumors: Latest from League Insiders',
        category: 'trades',
        time: '4h ago',
        views: '15.7K',
        trending: true,
        image: '📝',
        type: 'RUMOR',
        writer: 'Multiple Sources',
        team: 'Los Angeles Lakers',
        sport: 'NBA',
        sentiment: 'neutral',
        engagement: 76,
        readingTime: '5 min',
        aiInsights: ['Trade probability: 65%', 'Salary cap impact: $12M', 'Team value change: +8%'],
        isPremium: true
      },
      {
        id: 4,
        title: 'Statistical Breakthrough: New Analytics Model Predicts Playoff Outcomes',
        category: 'analytics',
        time: '6h ago',
        views: '22.3K',
        trending: true,
        image: '📈',
        type: 'RESEARCH',
        writer: 'Dr. Michael Chen',
        team: 'All Teams',
        sport: 'All',
        sentiment: 'positive',
        engagement: 95,
        readingTime: '7 min',
        aiInsights: ['Model accuracy: 87%', 'Trained on 50K+ games', 'Predicts with 82% confidence'],
        isPremium: true
      },
      {
        id: 5,
        title: 'Draft Analysis: Top 10 Prospects for 2024 Season',
        category: 'draft',
        time: '8h ago',
        views: '19.3K',
        trending: true,
        image: '🎯',
        type: 'ANALYSIS',
        writer: 'Scouting Department',
        team: 'Detroit Pistons',
        sport: 'NBA',
        sentiment: 'positive',
        engagement: 84,
        readingTime: '6 min',
        aiInsights: ['Scout ratings: 8.7/10', 'Projected impact: +5.2%', 'College stats analysis'],
        isPremium: false
      },
      {
        id: 6,
        title: 'Free Agency Predictions: Where Will Top Players Land?',
        category: 'free-agency',
        time: '12h ago',
        views: '16.8K',
        trending: true,
        image: '💰',
        type: 'PREDICTION',
        writer: 'Sports Analysts',
        team: 'All Teams',
        sport: 'All',
        sentiment: 'neutral',
        engagement: 79,
        readingTime: '5 min',
        aiInsights: ['Contract value predictions', 'Team fit analysis', 'Market trends'],
        isPremium: true
      },
    ];
    setTrendingStories(initialTrendingStories);
    setFilteredTrending(initialTrendingStories);
  }, []);

  // Enhanced mock articles with beat writers from all teams
  const generateMockArticles = () => {
    return Array.from({ length: 60 }, (_, i) => {
      const categoriesList = ['analytics', 'injuries', 'trades', 'rosters', 'draft', 'free-agency', 'advanced-stats'];
      const randomCategory = categoriesList[Math.floor(Math.random() * categoriesList.length)];
      const isPremium = Math.random() > 0.7;
      const sports = ['NBA', 'NFL', 'MLB', 'NHL'];
      const sport = sports[Math.floor(Math.random() * sports.length)];
      const team = getRandomTeam(sport);
      const writer = getRandomBeatWriter(team);
      
      return {
        id: i + 1,
        title: `${team} ${randomCategory === 'injuries' ? 'Injury Update' : 
                               randomCategory === 'trades' ? 'Trade Rumors' : 
                               randomCategory === 'draft' ? 'Draft Analysis' : 
                               randomCategory === 'free-agency' ? 'Free Agency News' : 
                               'Latest News'}: ${isPremium ? '[PREMIUM] ' : ''}Breaking Update`,
        category: randomCategory,
        excerpt: `Latest update from ${writer}, ${team} beat writer. Analysis of team performance, player stats, and upcoming games.`,
        time: `${Math.floor(Math.random() * 24)}h ago`,
        views: `${Math.floor(Math.random() * 20) + 5}K`,
        writer: writer,
        team: team,
        sport: sport,
        isBookmarked: Math.random() > 0.5,
        sentiment: ['positive', 'neutral', 'negative'][Math.floor(Math.random() * 3)],
        engagement: Math.floor(Math.random() * 30) + 70,
        readingTime: `${Math.floor(Math.random() * 8) + 2} min`,
        aiScore: Math.floor(Math.random() * 40) + 60,
        metrics: {
          socialShares: Math.floor(Math.random() * 1000),
          comments: Math.floor(Math.random() * 500),
          saves: Math.floor(Math.random() * 200)
        },
        isPremium: isPremium,
      };
    });
  };

  const getCategoryColors = (category) => {
    switch(category) {
      case 'analytics': return ['#0f766e', '#14b8a6'];
      case 'injuries': return ['#7c2d12', '#ea580c'];
      case 'trades': return ['#3730a3', '#4f46e5'];
      case 'rosters': return ['#1d4ed8', '#3b82f6'];
      case 'draft': return ['#7c2d12', '#ea580c'];
      case 'free-agency': return ['#6d28d9', '#8b5cf6'];
      case 'advanced-stats': return ['#0f766e', '#14b8a6'];
      default: return ['#1e293b', '#334155'];
    }
  };

  const getCategoryName = (category) => {
    return categories.find(c => c.id === category)?.name || category.toUpperCase();
  };

  const getSentimentColor = (sentiment) => {
    switch(sentiment) {
      case 'positive': return '#10b981';
      case 'negative': return '#ef4444';
      case 'neutral': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const calculateAnalytics = (articlesData) => {
    if (!articlesData.length) return;
    
    const totalArticles = articlesData.length;
    const avgEngagement = articlesData.reduce((sum, article) => sum + article.engagement, 0) / totalArticles;
    const sentimentBreakdown = articlesData.reduce((acc, article) => {
      acc[article.sentiment] = (acc[article.sentiment] || 0) + 1;
      return acc;
    }, {});
    
    // Calculate hot topics
    const categoryCount = articlesData.reduce((acc, article) => {
      acc[article.category] = (acc[article.category] || 0) + 1;
      return acc;
    }, {});
    
    const hotTopics = Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category, count]) => ({ category, count }));
    
    setAnalyticsMetrics({
      totalArticles,
      trendingScore: Math.floor(avgEngagement),
      engagementRate: Math.floor((avgEngagement / 100) * 100),
      avgReadingTime: Math.floor(Math.random() * 5) + 3,
      sentimentScore: sentimentBreakdown.positive ? 
        Math.floor((sentimentBreakdown.positive / totalArticles) * 100) : 0,
      hotTopics
    });
  };

  // Handle search functionality
  const handleArticleSearch = useCallback((query) => {
    setSearchQuery(query);
    addToSearchHistory(query);
    
    if (!query.trim()) {
      setFilteredArticles(articles);
      setFilteredTrending(trendingStories);
      return;
    }

    const lowerQuery = query.toLowerCase();
    
    // Filter main articles
    const filtered = articles.filter(article =>
      (article.title || '').toLowerCase().includes(lowerQuery) ||
      (article.excerpt || '').toLowerCase().includes(lowerQuery) ||
      (article.writer || '').toLowerCase().includes(lowerQuery) ||
      (article.team || '').toLowerCase().includes(lowerQuery) ||
      (article.category || '').toLowerCase().includes(lowerQuery) ||
      (article.sport || '').toLowerCase().includes(lowerQuery)
    );
    
    // Filter trending stories
    const filteredTrendingResults = trendingStories.filter(story =>
      (story.title || '').toLowerCase().includes(lowerQuery) ||
      (story.writer || '').toLowerCase().includes(lowerQuery) ||
      (story.team || '').toLowerCase().includes(lowerQuery) ||
      (story.category || '').toLowerCase().includes(lowerQuery) ||
      (story.sport || '').toLowerCase().includes(lowerQuery)
    );
    
    setFilteredArticles(filtered);
    setFilteredTrending(filteredTrendingResults);
  }, [articles, trendingStories, addToSearchHistory]);

  // Update filtered articles when articles or search query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredArticles(articles);
      setFilteredTrending(trendingStories);
    } else {
      const lowerQuery = searchQuery.toLowerCase();
      const filtered = articles.filter(article =>
        (article.title || '').toLowerCase().includes(lowerQuery) ||
        (article.excerpt || '').toLowerCase().includes(lowerQuery) ||
        (article.writer || '').toLowerCase().includes(lowerQuery) ||
        (article.team || '').toLowerCase().includes(lowerQuery) ||
        (article.category || '').toLowerCase().includes(lowerQuery) ||
        (article.sport || '').toLowerCase().includes(lowerQuery)
      );
      const filteredTrendingResults = trendingStories.filter(story =>
        (story.title || '').toLowerCase().includes(lowerQuery) ||
        (story.writer || '').toLowerCase().includes(lowerQuery) ||
        (story.team || '').toLowerCase().includes(lowerQuery) ||
        (story.category || '').toLowerCase().includes(lowerQuery) ||
        (story.sport || '').toLowerCase().includes(lowerQuery)
      );
      setFilteredArticles(filtered);
      setFilteredTrending(filteredTrendingResults);
    }
  }, [searchQuery, articles, trendingStories]);

  const loadData = async (loadMore = false) => {
    try {
      if (loadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      
      console.log('📰 Loading News data with analytics...');
      
      // Get real sports data from hook
      const nbaNews = sportsData?.nba?.news || [];
      const nflNews = sportsData?.nfl?.news || [];
      
      // Combine and process news data with beat writers
      const combinedNews = generateMockArticles();
      
      if (!loadMore) {
        setArticles(combinedNews.slice(0, 15));
        setFilteredArticles(combinedNews.slice(0, 15));
      } else {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const newArticles = combinedNews.slice(articles.length, articles.length + 10);
        setArticles(prev => [...prev, ...newArticles]);
        setFilteredArticles(prev => [...prev, ...newArticles]);
        if (articles.length + 10 >= combinedNews.length) {
          setHasMore(false);
        }
      }
      
      // Calculate analytics
      calculateAnalytics(combinedNews.slice(0, 20));
      
      // Set article sentiment data
      const sentimentMap = {};
      combinedNews.slice(0, 10).forEach(article => {
        sentimentMap[article.id] = article.sentiment;
      });
      setArticleSentiment(sentimentMap);
      
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    // Log screen view using imported function
    logScreenView('SportsNewsHub');
  }, []);

  useEffect(() => {
    // Apply trending filter
    if (trendingFilter === 'all') {
      if (searchQuery.trim()) {
        // Already filtered by search
        return;
      }
      setFilteredTrending(trendingStories);
    } else if (trendingFilter === 'breaking') {
      const filtered = trendingStories.filter(story => story.type === 'BREAKING');
      setFilteredTrending(searchQuery.trim() ? filtered : trendingStories.filter(story => story.type === 'BREAKING'));
    } else if (trendingFilter === 'high-engagement') {
      const filtered = trendingStories.filter(story => story.engagement > 85);
      setFilteredTrending(searchQuery.trim() ? filtered : trendingStories.filter(story => story.engagement > 85));
    } else {
      const filtered = trendingStories.filter(story => story.category === trendingFilter);
      setFilteredTrending(searchQuery.trim() ? filtered : trendingStories.filter(story => story.category === trendingFilter));
    }
  }, [trendingFilter, searchQuery, trendingStories]);

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    setSearchQuery('');
    await refreshAllData();
    await loadData();
    
    await logEvent('sports_news_refresh', {
      num_articles: filteredArticles.length,
    });
    
    setRefreshing(false);
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      setPage(prev => prev + 1);
      loadData(true);
    }
  };

  const shareArticle = async (article) => {
    try {
      await Share.share({
        message: `${article.title}\n\nRead more on Sports Intelligence Hub`,
        title: article.title,
        url: 'https://sportsintelligence.app/article/' + article.id,
      });
      
      logAnalyticsEvent('article_share', {
        article_id: article.id,
        article_title: article.title,
        category: article.category,
        team: article.team,
        writer: article.writer
      });
    } catch (error) {
      console.error('Error sharing article:', error);
    }
  };

  const handleCategoryChange = async (category) => {
    setSelectedCategory(category);
    setSearchQuery('');
    
    await logEvent('news_category_change', {
      from_category: selectedCategory,
      to_category: category,
    });
  };

  // Search results info
  const renderSearchResultsInfo = () => {
    if (!searchQuery.trim() || (articles.length === filteredArticles.length && trendingStories.length === filteredTrending.length)) {
      return null;
    }

    return (
      <View style={styles.searchResultsInfo}>
        <View style={styles.searchResultsContent}>
          <Text style={styles.searchResultsText}>
            Found {filteredArticles.length} articles, {filteredTrending.length} trending stories for "{searchQuery}"
          </Text>
          <TouchableOpacity 
            onPress={() => setSearchQuery('')}
            activeOpacity={0.7}
            style={styles.clearSearchButtonSmall}
          >
            <Text style={styles.clearSearchText}>Clear</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Search bar
  const renderSearchBar = () => (
    <View style={styles.searchBarContainer}>
      <SearchBar
        placeholder="Search articles, teams, players, writers..."
        onSearch={handleArticleSearch}
        searchHistory={searchHistory}
        style={styles.homeSearchBar}
      />
      <TouchableOpacity
        style={styles.advancedSearchButton}
        onPress={() => setShowAnalyticsModal(true)}
      >
        <Ionicons name="filter" size={20} color="#3b82f6" />
      </TouchableOpacity>
    </View>
  );

  // Search modal component
  const renderSearchModal = () => (
    <Modal
      animationType="slide"
      transparent={false}
      visible={searchModalVisible}
      onRequestClose={() => setSearchModalVisible(false)}
    >
      <SafeAreaView style={styles.searchModalContainer}>
        <View style={styles.searchModalHeader}>
          <TouchableOpacity 
            onPress={() => setSearchModalVisible(false)}
            style={styles.modalBackButton}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Search News Articles</Text>
        </View>

        <SearchBar
          placeholder="Search articles, teams, players, writers..."
          onSearch={handleArticleSearch}
          searchHistory={searchHistory}
          style={styles.gameSearchBar}
        />

        <FlatList
          data={filteredArticles}
          keyExtractor={(item, index) => `search-${index}`}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.searchResultItem}
              onPress={async () => {
                if (item.isPremium && !premiumArticlesUnlocked) {
                  const unlocked = await unlockPremiumArticles();
                  if (!unlocked) return;
                }
                
                Alert.alert('Article Analytics', 
                  `Team: ${item.team}\n` +
                  `Writer: ${item.writer}\n` +
                  `Engagement Rate: ${item.engagement}%\n` +
                  `AI Score: ${item.aiScore}/100\n` +
                  `Sentiment: ${item.sentiment.toUpperCase()}\n` +
                  `Reading Time: ${item.readingTime}`
                );
                setSearchModalVisible(false);
              }}
            >
              <View style={styles.searchResultIcon}>
                <Ionicons name="newspaper" size={20} color="#3b82f6" />
                {item.isPremium && (
                  <View style={styles.premiumBadgeSmall}>
                    <Ionicons name="diamond" size={10} color="#f59e0b" />
                  </View>
                )}
              </View>
              <View style={styles.searchResultContent}>
                <Text style={styles.searchResultTitle}>{item.title}</Text>
                <Text style={styles.searchResultSubtitle}>
                  {item.writer} • {item.team} • {item.time} • {getCategoryName(item.category)}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.noResults}>
              <Ionicons name="search-outline" size={48} color="#d1d5db" />
              <Text style={styles.noResultsText}>
                {searchQuery ? 'No results found' : 'Search for news articles'}
              </Text>
              {searchQuery && (
                <TouchableOpacity 
                  style={styles.clearSearchButton}
                  onPress={() => setSearchQuery('')}
                >
                  <Text style={styles.clearSearchButtonText}>Clear Search</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      </SafeAreaView>
    </Modal>
  );

  const renderAnalyticsModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showAnalyticsModal}
      onRequestClose={() => setShowAnalyticsModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <LinearGradient
            colors={['#1e40af', '#3b82f6']}
            style={styles.modalHeader}
          >
            <Text style={styles.modalTitle}>SportsHub Analytics Dashboard</Text>
            <TouchableOpacity 
              onPress={() => setShowAnalyticsModal(false)}
              style={styles.modalCloseButton}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </LinearGradient>
          
          <ScrollView style={styles.modalBody}>
            <View style={styles.analyticsSection}>
              <Text style={styles.sectionTitle}>📊 Performance Metrics</Text>
              <View style={styles.metricsGrid}>
                <View style={styles.metricCard}>
                  <Text style={styles.metricValue}>{analyticsMetrics.totalArticles}</Text>
                  <Text style={styles.metricLabel}>Total Articles</Text>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${Math.min(analyticsMetrics.totalArticles, 100)}%` }]} />
                  </View>
                </View>
                <View style={styles.metricCard}>
                  <Text style={styles.metricValue}>{analyticsMetrics.trendingScore}%</Text>
                  <Text style={styles.metricLabel}>Trending Score</Text>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${analyticsMetrics.trendingScore}%`, backgroundColor: '#10b981' }]} />
                  </View>
                </View>
                <View style={styles.metricCard}>
                  <Text style={styles.metricValue}>{analyticsMetrics.engagementRate}%</Text>
                  <Text style={styles.metricLabel}>Engagement Rate</Text>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${analyticsMetrics.engagementRate}%`, backgroundColor: '#8b5cf6' }]} />
                  </View>
                </View>
                <View style={styles.metricCard}>
                  <Text style={styles.metricValue}>{analyticsMetrics.sentimentScore}%</Text>
                  <Text style={styles.metricLabel}>Positive Sentiment</Text>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${analyticsMetrics.sentimentScore}%`, backgroundColor: '#f59e0b' }]} />
                  </View>
                </View>
              </View>
            </View>
            
            <View style={styles.analyticsSection}>
              <Text style={styles.sectionTitle}>🔥 Hot Topics</Text>
              {analyticsMetrics.hotTopics.map((topic, index) => (
                <View key={index} style={styles.hotTopicItem}>
                  <View style={styles.topicInfo}>
                    <Text style={styles.topicName}>
                      {getCategoryName(topic.category)}
                    </Text>
                    <Text style={styles.topicCount}>{topic.count} articles</Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { 
                      width: `${(topic.count / analyticsMetrics.totalArticles) * 100}%`,
                      backgroundColor: categories.find(c => c.id === topic.category)?.color || '#3b82f6'
                    }]} />
                  </View>
                </View>
              ))}
            </View>
            
            <View style={styles.analyticsSection}>
              <Text style={styles.sectionTitle}>🎯 Sentiment Analysis</Text>
              <View style={styles.sentimentChart}>
                <View style={styles.sentimentBar}>
                  <View style={[styles.sentimentFill, { 
                    width: `${analyticsMetrics.sentimentScore}%`,
                    backgroundColor: '#10b981'
                  }]} />
                </View>
                <View style={styles.sentimentLabels}>
                  <Text style={styles.sentimentLabel}>Negative</Text>
                  <Text style={styles.sentimentLabel}>Neutral</Text>
                  <Text style={styles.sentimentLabel}>Positive</Text>
                </View>
              </View>
            </View>

            {/* Quick Navigation Section in Analytics Modal */}
            <View style={styles.analyticsSection}>
              <Text style={styles.sectionTitle}>🚀 Quick Navigation</Text>
              <View style={styles.quickNavigation}>
                <TouchableOpacity 
                  style={styles.quickNavButton}
                  onPress={() => {
                    setShowAnalyticsModal(false);
                    handleNavigateToAnalytics();
                  }}
                >
                  <Ionicons name="analytics" size={20} color="#3b82f6" />
                  <Text style={styles.quickNavText}>Analytics</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.quickNavButton}
                  onPress={() => {
                    setShowAnalyticsModal(false);
                    handleNavigateToPredictions();
                  }}
                >
                  <Ionicons name="trending-up" size={20} color="#3b82f6" />
                  <Text style={styles.quickNavText}>AI Predict</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.quickNavButton}
                  onPress={() => {
                    setShowAnalyticsModal(false);
                    handleNavigateToFantasy();
                  }}
                >
                  <Ionicons name="trophy" size={20} color="#3b82f6" />
                  <Text style={styles.quickNavText}>Fantasy</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.quickNavButton}
                  onPress={() => {
                    setShowAnalyticsModal(false);
                    handleNavigateToParlayBuilder();
                  }}
                >
                  <Ionicons name="stats-chart" size={20} color="#3b82f6" />
                  <Text style={styles.quickNavText}>Parlay</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Beat Writers Stats */}
            <View style={styles.analyticsSection}>
              <Text style={styles.sectionTitle}>📝 Beat Writers Coverage</Text>
              <View style={styles.coverageCard}>
                <View style={styles.coverageHeader}>
                  <Ionicons name="people" size={24} color="#3b82f6" />
                  <Text style={styles.coverageTitle}>Team Coverage</Text>
                </View>
                <View style={styles.coverageStats}>
                  <View style={styles.coverageStat}>
                    <Text style={styles.coverageValue}>{Object.keys(TEAM_BEAT_WRITERS).length}</Text>
                    <Text style={styles.coverageLabel}>Teams Covered</Text>
                  </View>
                  <View style={styles.coverageStat}>
                    <Text style={styles.coverageValue}>124</Text>
                    <Text style={styles.coverageLabel}>Beat Writers</Text>
                  </View>
                  <View style={styles.coverageStat}>
                    <Text style={styles.coverageValue}>4</Text>
                    <Text style={styles.coverageLabel}>Major Sports</Text>
                  </View>
                </View>
              </View>
            </View>
            
            {/* Daily Locks Status */}
            <View style={styles.analyticsSection}>
              <Text style={styles.sectionTitle}>🔓 Access Status</Text>
              <View style={styles.accessCard}>
                <View style={styles.accessHeader}>
                  <Ionicons name={dailyLocks.hasAccess ? "diamond" : "lock-open"} size={24} color="#3b82f6" />
                  <Text style={styles.accessTitle}>
                    {dailyLocks.hasAccess ? 'Premium Access' : 'Daily Unlocks'}
                  </Text>
                </View>
                <Text style={styles.accessText}>
                  {dailyLocks.hasAccess 
                    ? 'Unlimited access to all premium articles' 
                    : `${dailyLocks.locksRemaining} free unlocks remaining today`}
                </Text>
              </View>
            </View>
          </ScrollView>
          
          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={() => setShowAnalyticsModal(false)}
            >
              <Text style={styles.modalButtonText}>Close Dashboard</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderHeader = () => (
    <LinearGradient
      colors={['#1e40af', '#3b82f6']}
      style={styles.header}
    >
      <View style={styles.headerTop}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerSearchButton}
            onPress={async () => {
              await logEvent('sports_news_search_toggle', {
                action: 'open_search',
              });
              setSearchModalVisible(true);
            }}
          >
            <Ionicons name="search-outline" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.analyticsButton}
            onPress={() => setShowAnalyticsModal(true)}
          >
            <Ionicons name="stats-chart" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.headerContent}>
        <Text style={styles.title}>SportsHub</Text>
        <Text style={styles.subtitle}>Beat writers, analytics & roster insights</Text>
        <View style={styles.statsRow}>
          <TouchableOpacity 
            style={styles.stat}
            onPress={() => setShowAnalyticsModal(true)}
          >
            <Ionicons name="analytics" size={14} color="rgba(255,255,255,0.8)" />
            <Text style={styles.statText}>Advanced Analytics</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.stat}>
            <Ionicons name="person" size={14} color="rgba(255,255,255,0.8)" />
            <Text style={styles.statText}>124+ Beat Writers</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.stat}>
            <Ionicons name="time" size={14} color="rgba(255,255,255,0.8)" />
            <Text style={styles.statText}>Real-time Updates</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Add navigation menu to header */}
      <View style={styles.navigationMenuContainer}>
        {renderNavigationMenu()}
      </View>
    </LinearGradient>
  );

  const renderCategoryTabs = () => (
    <View style={styles.categoryTabsContainer}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesScroll}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryTab,
              selectedCategory === category.id && styles.activeCategoryTab,
              { borderLeftColor: category.color }
            ]}
            onPress={() => handleCategoryChange(category.id)}
          >
            <Ionicons 
              name={category.icon} 
              size={16} 
              color={selectedCategory === category.id ? category.color : '#6b7280'} 
            />
            <Text style={[
              styles.categoryText,
              selectedCategory === category.id && styles.activeCategoryText
            ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={styles.categoryIndicator}>
        <Text style={styles.categoryIndicatorText}>
          {categories.find(c => c.id === selectedCategory)?.name} • {filteredArticles.length} articles
        </Text>
        <TouchableOpacity style={styles.notificationBell}>
          <Ionicons name="notifications-outline" size={20} color="#3b82f6" />
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationCount}>{analyticsMetrics.totalArticles}</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderTrendingSection = () => {
    if (filteredTrending.length === 0 && searchQuery.trim()) {
      return (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📈 Trending Analysis</Text>
            <Text style={styles.sectionSubtitle}>No trending stories found</Text>
          </View>
          <View style={styles.emptyTrendingContainer}>
            <Ionicons name="search-outline" size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>No trending stories match "{searchQuery}"</Text>
            <TouchableOpacity 
              onPress={() => setSearchQuery('')}
              style={styles.clearSearchButton}
            >
              <Text style={styles.clearSearchButtonText}>Clear Search</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>📈 Trending Analysis</Text>
            <Text style={styles.sectionSubtitle}>Most discussed stories with AI insights</Text>
          </View>
          <TouchableOpacity 
            style={styles.seeAllButton}
            onPress={() => setShowAnalyticsModal(true)}
          >
            <Text style={styles.seeAll}>View Analytics</Text>
          </TouchableOpacity>
        </View>
        
        {/* Quick Filters */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
        >
          {trendingFilters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterButton,
                trendingFilter === filter.id && styles.activeFilterButton
              ]}
              onPress={() => setTrendingFilter(filter.id)}
            >
              <Text style={[
                styles.filterText,
                trendingFilter === filter.id && styles.activeFilterText
              ]}>
                {filter.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.trendingScroll}
        >
          {filteredTrending.map((story) => (
            <TouchableOpacity 
              key={story.id} 
              style={styles.trendingCard}
              onPress={async () => {
                if (story.isPremium && !premiumArticlesUnlocked) {
                  const unlocked = await unlockPremiumArticles();
                  if (!unlocked) return;
                }
                
                Alert.alert('Article Analytics', 
                  `Team: ${story.team}\n` +
                  `Writer: ${story.writer}\n` +
                  `Engagement: ${story.engagement}%\n` +
                  `Reading Time: ${story.readingTime}\n` +
                  `AI Confidence: 87%\n\n` +
                  `Key Insights:\n${story.aiInsights.join('\n')}`
                );
              }}
            >
              <LinearGradient
                colors={getCategoryColors(story.category)}
                style={styles.trendingImage}
              >
                {story.isPremium && (
                  <View style={styles.premiumBadge}>
                    <Ionicons name="diamond" size={12} color="#f59e0b" />
                  </View>
                )}
                <Text style={styles.trendingEmoji}>{story.image}</Text>
                <View style={styles.storyTypeBadge}>
                  <Text style={styles.storyTypeText}>{story.type}</Text>
                </View>
                <View style={[
                  styles.sentimentBadge,
                  { backgroundColor: getSentimentColor(story.sentiment) }
                ]}>
                  <Ionicons 
                    name={story.sentiment === 'positive' ? 'trending-up' : 
                           story.sentiment === 'negative' ? 'trending-down' : 'remove'} 
                    size={10} 
                    color="white" 
                  />
                  <Text style={styles.sentimentBadgeText}>
                    {story.sentiment.toUpperCase()}
                  </Text>
                </View>
              </LinearGradient>
              <View style={styles.trendingContent}>
                <View style={styles.writerInfo}>
                  <Ionicons name="person-circle" size={12} color="#6b7280" />
                  <Text style={styles.writerName}>{story.writer}</Text>
                  <View style={styles.teamTag}>
                    <Text style={styles.teamTagText}>{story.team}</Text>
                  </View>
                </View>
                <Text style={styles.trendingTitle} numberOfLines={2}>
                  {story.title}
                </Text>
                
                {/* Analytics Metrics */}
                <View style={styles.analyticsRow}>
                  <View style={styles.analyticsMetric}>
                    <Ionicons name="eye" size={12} color="#9ca3af" />
                    <Text style={styles.analyticsText}>{story.views}</Text>
                  </View>
                  <View style={styles.analyticsMetric}>
                    <Ionicons name="time" size={12} color="#9ca3af" />
                    <Text style={styles.analyticsText}>{story.readingTime}</Text>
                  </View>
                  <View style={styles.analyticsMetric}>
                    <Ionicons name="trending-up" size={12} color="#10b981" />
                    <Text style={styles.analyticsText}>{story.engagement}%</Text>
                  </View>
                </View>
                
                <View style={styles.trendingFooter}>
                  <Text style={styles.trendingCategory}>{getCategoryName(story.category)}</Text>
                  <Text style={styles.trendingTime}>{story.time}</Text>
                </View>
                
                <View style={styles.articleActions}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => shareArticle(story)}
                  >
                    <Ionicons name="share-outline" size={14} color="#6b7280" />
                    <Text style={styles.actionText}>Share</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => Alert.alert('AI Insights', story.aiInsights.join('\n'))}
                  >
                    <Ionicons name="sparkles" size={14} color="#8b5cf6" />
                    <Text style={styles.actionText}>AI Insights</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="bookmark-outline" size={14} color="#6b7280" />
                    <Text style={styles.actionText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderArticleItem = ({ item, index }) => (
    <TouchableOpacity 
      style={[
        styles.newsCard,
        index === filteredArticles.length - 1 && styles.lastCard
      ]}
      onPress={async () => {
        if (item.isPremium && !premiumArticlesUnlocked) {
          const unlocked = await unlockPremiumArticles();
          if (!unlocked) return;
        }
        
        Alert.alert('Article Analytics', 
          `Team: ${item.team}\n` +
          `Writer: ${item.writer}\n` +
          `Engagement Rate: ${item.engagement}%\n` +
          `AI Score: ${item.aiScore}/100\n` +
          `Sentiment: ${item.sentiment.toUpperCase()}\n` +
          `Reading Time: ${item.readingTime}`
        );
      }}
    >
      <View style={styles.newsHeader}>
        <View style={styles.newsHeaderLeft}>
          <View style={[
            styles.newsCategoryBadge,
            { backgroundColor: categories.find(c => c.id === item.category)?.color + '20' }
          ]}>
            <Text style={[
              styles.newsCategoryText,
              { color: categories.find(c => c.id === item.category)?.color }
            ]}>
              {getCategoryName(item.category)}
            </Text>
          </View>
          {item.isPremium && (
            <View style={styles.premiumTag}>
              <Ionicons name="diamond" size={10} color="#f59e0b" />
              <Text style={styles.premiumTagText}>PREMIUM</Text>
            </View>
          )}
        </View>
        <View style={styles.newsAnalytics}>
          <View style={[
            styles.sentimentDot,
            { backgroundColor: getSentimentColor(item.sentiment) }
          ]} />
          <Text style={styles.newsTime}>{item.time}</Text>
        </View>
      </View>
      
      <Text style={styles.newsTitle}>{item.title}</Text>
      
      <Text style={styles.newsExcerpt} numberOfLines={2}>
        {item.excerpt}
      </Text>
      
      <View style={styles.articleInfo}>
        <View style={styles.byline}>
          <Ionicons name="person" size={12} color="#6b7280" />
          <Text style={styles.bylineText}>
            <Text style={styles.writerNameText}>{item.writer}</Text> • {item.team} Beat Writer
          </Text>
        </View>
        <View style={styles.viewCount}>
          <Ionicons name="eye" size={12} color="#6b7280" />
          <Text style={styles.viewsText}>{item.views}</Text>
        </View>
      </View>
      
      {/* Enhanced analytics row */}
      <View style={styles.enhancedAnalytics}>
        <View style={styles.analyticsItem}>
          <CircularProgress
            size={40}
            progress={item.engagement / 100}
            color="#3b82f6"
            text={`${item.engagement}%`}
            showText={true}
          />
          <Text style={styles.analyticsLabel}>Engagement</Text>
        </View>
        <View style={styles.analyticsItem}>
          <CircularProgress
            size={40}
            progress={item.aiScore / 100}
            color="#10b981"
            text={`${item.aiScore}`}
            showText={true}
          />
          <Text style={styles.analyticsLabel}>AI Score</Text>
        </View>
        <View style={styles.analyticsItem}>
          <View style={styles.readingTime}>
            <Ionicons name="time" size={16} color="#8b5cf6" />
            <Text style={styles.readingTimeText}>{item.readingTime}</Text>
          </View>
          <Text style={styles.analyticsLabel}>Read Time</Text>
        </View>
      </View>
      
      <View style={styles.newsFooter}>
        <View style={styles.newsStats}>
          <View style={styles.statItem}>
            <Ionicons name="share-social" size={12} color="#3b82f6" />
            <Text style={styles.statCount}>{item.metrics.socialShares}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="chatbubble" size={12} color="#10b981" />
            <Text style={styles.statCount}>{item.metrics.comments}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="bookmark" size={12} color="#f59e0b" />
            <Text style={styles.statCount}>{item.metrics.saves}</Text>
          </View>
        </View>
        <View style={styles.articleActions}>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => shareArticle(item)}
          >
            <Ionicons name="share-outline" size={18} color="#6b7280" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons 
              name={item.isBookmarked ? "bookmark" : "bookmark-outline"} 
              size={18} 
              color={item.isBookmarked ? "#3b82f6" : "#6b7280"} 
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (loadingMore) {
      return (
        <View style={styles.loadingMoreContainer}>
          <ActivityIndicator size="small" color="#3b82f6" />
          <Text style={styles.loadingMoreText}>Loading more articles...</Text>
        </View>
      );
    }
    if (!hasMore && filteredArticles.length > 0) {
      return (
        <View style={styles.noMoreContainer}>
          <Text style={styles.noMoreText}>No more articles to load</Text>
          <TouchableOpacity 
            style={styles.analyticsButton}
            onPress={() => setShowAnalyticsModal(true)}
          >
            <Ionicons name="stats-chart" size={16} color="#3b82f6" />
            <Text style={styles.analyticsButtonText}>View Analytics</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return null;
  };

  if (loading && filteredArticles.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading SportsHub...</Text>
        <Text style={styles.loadingSubtext}>Analyzing trends and metrics</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      
      <ScrollView
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#3b82f6']}
            tintColor="#3b82f6"
          />
        }
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderSearchBar()}
        {renderSearchResultsInfo()}
        {renderCategoryTabs()}
        
        {renderTrendingSection()}
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>
                📰 Latest {categories.find(c => c.id === selectedCategory)?.name}
              </Text>
              <Text style={styles.sectionSubtitle}>
                {filteredArticles.length} articles • {analyticsMetrics.engagementRate}% avg engagement
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.analyticsBadge}
              onPress={() => setShowAnalyticsModal(true)}
            >
              <Ionicons name="stats-chart" size={16} color="#fff" />
              <Text style={styles.analyticsBadgeText}>Analytics</Text>
            </TouchableOpacity>
          </View>
          
          {filteredArticles.length > 0 ? (
            <FlatList
              ref={flatListRef}
              data={filteredArticles}
              renderItem={renderArticleItem}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              onEndReached={loadMore}
              onEndReachedThreshold={0.5}
              ListFooterComponent={renderFooter}
            />
          ) : (
            <View style={styles.emptyStateContainer}>
              <View style={styles.emptyStateContent}>
                <Ionicons name="search" size={48} color="#d1d5db" />
                <Text style={styles.emptyText}>No articles found</Text>
                <Text style={styles.emptySubtext}>
                  {searchQuery ? `No results for "${searchQuery}"` : 'Try a different category'}
                </Text>
                {searchQuery && (
                  <TouchableOpacity 
                    onPress={() => setSearchQuery('')}
                    style={styles.clearSearchButton}
                  >
                    <Text style={styles.clearSearchButtonText}>Clear Search</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Articles update hourly. Analytics refreshed every 15 minutes.
          </Text>
          <Text style={styles.dailyLocksInfo}>
            {dailyLocks.hasAccess 
              ? '🎉 Premium: Unlimited access to all articles' 
              : `🔓 Free: ${dailyLocks.locksRemaining}/${dailyLocks.dailyLimit} daily unlocks remaining`}
          </Text>
        </View>
      </ScrollView>
      
      {renderAnalyticsModal()}
      {renderSearchModal()}
      <AnalyticsBox />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // NEW: Navigation menu styles
  navigationMenuContainer: {
    marginTop: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    padding: 8,
  },
  
  navigationMenu: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  
  navButton: {
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },
  
  navButtonText: {
    color: 'white',
    fontSize: 10,
    marginTop: 4,
    fontWeight: '500',
  },

  // NEW: Search modal styles
  searchModalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  
  searchModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  
  modalBackButton: {
    marginRight: 16,
  },
  
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  
  gameSearchBar: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
  },
  
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  
  searchResultIcon: {
    marginRight: 12,
    position: 'relative',
  },
  
  searchResultContent: {
    flex: 1,
  },
  
  searchResultTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 2,
  },
  
  searchResultSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  
  noResults: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  
  noResultsText: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 12,
  },

  // NEW: Quick navigation styles
  quickNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  
  quickNavButton: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    minWidth: 80,
  },
  
  quickNavText: {
    fontSize: 12,
    color: '#3b82f6',
    marginTop: 4,
    fontWeight: '500',
  },

  // NEW: Coverage card styles
  coverageCard: {
    backgroundColor: '#f0f9ff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0f2fe',
  },
  
  coverageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  coverageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0c4a6e',
    marginLeft: 8,
  },
  
  coverageStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  
  coverageStat: {
    alignItems: 'center',
  },
  
  coverageValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e40af',
  },
  
  coverageLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },

  // Updated Header styles
  header: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  backButton: {
    padding: 8,
  },
  
  headerSearchButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  analyticsButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  
  headerContent: {
    alignItems: 'center',
  },
  
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  
  subtitle: {
    fontSize: 14,
    color: 'white',
    marginTop: 5,
    textAlign: 'center',
  },
  
  statsRow: {
    flexDirection: 'row',
    marginTop: 15,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
    marginVertical: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  
  statText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginLeft: 5,
  },

  // Search Bar Container
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  
  homeSearchBar: {
    flex: 1,
    marginRight: 8,
  },
  
  advancedSearchButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },

  // Original styles plus styles from File 1
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  loadingSubtext: {
    marginTop: 5,
    color: '#9ca3af',
    fontSize: 14,
  },
  searchResultsInfo: {
    backgroundColor: '#f1f5f9',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  
  searchResultsContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  
  searchResultsText: {
    fontSize: 14,
    color: '#4b5563',
    flex: 1,
  },
  
  clearSearchText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
  
  clearSearchButtonSmall: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  
  clearSearchButton: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
  },
  
  clearSearchButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  
  categoryTabsContainer: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  
  categoriesScroll: {
    paddingVertical: 10,
  },
  
  categoriesContent: {
    paddingHorizontal: 15,
  },
  
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 10,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  
  activeCategoryTab: {
    backgroundColor: '#e0e7ff',
    borderColor: '#3b82f6',
  },
  
  categoryText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 6,
    fontWeight: '500',
  },
  
  activeCategoryText: {
    color: '#1f2937',
  },
  
  categoryIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#f8fafc',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  
  categoryIndicatorText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  
  notificationBell: {
    position: 'relative',
    padding: 5,
  },
  
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'white',
  },
  
  notificationCount: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  
  section: {
    margin: 16,
    marginTop: 0,
  },
  
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
  },
  
  sectionSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  
  analyticsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  
  analyticsBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  
  seeAllButton: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  
  seeAll: {
    color: '#3b82f6',
    fontSize: 12,
    fontWeight: '500',
  },
  
  filterScroll: {
    marginBottom: 15,
  },
  
  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 6,
    backgroundColor: '#f8fafc',
    borderRadius: 15,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  
  activeFilterButton: {
    backgroundColor: '#3b82f6',
    borderColor: '#2563eb',
  },
  
  filterText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  
  activeFilterText: {
    color: 'white',
  },
  
  trendingScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  
  trendingCard: {
    width: width * 0.75,
    backgroundColor: 'white',
    borderRadius: 12,
    marginRight: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  
  trendingImage: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  
  trendingEmoji: {
    fontSize: 48,
  },
  
  premiumBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  
  premiumBadgeSmall: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  
  storyTypeBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  
  storyTypeText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
  },
  
  sentimentBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  
  sentimentBadgeText: {
    fontSize: 8,
    color: 'white',
    fontWeight: '600',
    marginLeft: 2,
  },
  
  trendingContent: {
    padding: 16,
  },
  
  writerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  writerName: {
    fontSize: 11,
    color: '#6b7280',
    marginLeft: 4,
    marginRight: 8,
  },
  
  teamTag: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  
  teamTagText: {
    fontSize: 10,
    color: '#6b7280',
    fontWeight: '600',
  },
  
  trendingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
    lineHeight: 18,
  },
  
  analyticsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  
  analyticsMetric: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  analyticsText: {
    fontSize: 10,
    color: '#6b7280',
    marginLeft: 4,
  },
  
  trendingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  
  trendingCategory: {
    fontSize: 10,
    color: '#3b82f6',
    fontWeight: '600',
  },
  
  trendingTime: {
    fontSize: 10,
    color: '#9ca3af',
  },
  
  articleActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 10,
  },
  
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  
  actionText: {
    fontSize: 11,
    color: '#6b7280',
    marginLeft: 4,
  },
  
  newsCard: {
    backgroundColor: 'white',
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  
  lastCard: {
    marginBottom: 20,
  },
  
  newsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  
  newsHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    flexWrap: 'wrap',
  },
  
  newsCategoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.1)',
  },
  
  newsCategoryText: {
    fontSize: 10,
    fontWeight: '600',
  },
  
  premiumTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  
  premiumTagText: {
    fontSize: 8,
    color: '#92400e',
    fontWeight: '600',
    marginLeft: 2,
  },
  
  newsAnalytics: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  sentimentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  
  newsTime: {
    fontSize: 11,
    color: '#9ca3af',
  },
  
  newsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
    lineHeight: 20,
  },
  
  newsExcerpt: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
    marginBottom: 12,
  },
  
  articleInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  
  byline: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  bylineText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  
  writerNameText: {
    fontWeight: '600',
    color: '#1f2937',
  },
  
  viewCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  viewsText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  
  enhancedAnalytics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  
  analyticsItem: {
    alignItems: 'center',
  },
  
  analyticsLabel: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 4,
  },
  
  readingTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  readingTimeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 4,
  },
  
  newsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 15,
  },
  
  newsStats: {
    flexDirection: 'row',
  },
  
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  
  statCount: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  
  iconButton: {
    padding: 6,
    marginLeft: 10,
  },
  
  loadingMoreContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  
  loadingMoreText: {
    marginLeft: 10,
    color: '#6b7280',
    fontSize: 14,
  },
  
  noMoreContainer: {
    padding: 20,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  
  noMoreText: {
    color: '#9ca3af',
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 10,
  },
  
  analyticsButtonText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  
  emptyTrendingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  
  emptyStateContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  
  emptyStateContent: {
    alignItems: 'center',
  },
  
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 12,
  },
  
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
    textAlign: 'center',
  },
  
  footer: {
    padding: 20,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    marginTop: 10,
  },
  
  footerText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
  
  dailyLocksInfo: {
    fontSize: 12,
    color: '#3b82f6',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
  },
  
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  
  modalHeader: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  
  modalCloseButton: {
    padding: 4,
  },
  
  modalBody: {
    padding: 20,
  },
  
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  
  modalButton: {
    backgroundColor: '#3b82f6',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2563eb',
  },
  
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  
  analyticsSection: {
    marginBottom: 25,
  },
  
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  
  metricCard: {
    width: '48%',
    backgroundColor: '#f8fafc',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 5,
  },
  
  metricLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  
  progressBar: {
    width: 100,
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
  },
  
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 3,
  },
  
  hotTopicItem: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  
  topicInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  topicName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  
  topicCount: {
    fontSize: 12,
    color: '#6b7280',
  },
  
  sentimentChart: {
    backgroundColor: '#f8fafc',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  
  sentimentBar: {
    height: 20,
    backgroundColor: '#e5e7eb',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 10,
  },
  
  sentimentFill: {
    height: '100%',
    borderRadius: 10,
  },
  
  sentimentLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  
  sentimentLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  
  accessCard: {
    backgroundColor: '#f0f9ff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0f2fe',
  },
  
  accessHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  accessTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0c4a6e',
    marginLeft: 8,
  },
  
  accessText: {
    fontSize: 14,
    color: '#0c4a6e',
    lineHeight: 20,
  },
});

export default SportsNewsHub;
