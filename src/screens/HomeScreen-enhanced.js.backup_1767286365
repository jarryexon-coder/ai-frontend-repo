// In HomeScreen-enhanced.js, update the useEffect or API calls:

useEffect(() => {
  const loadData = async () => {
    try {
      console.log('📡 Loading HomeScreen data...');
      
      // Use the new methods that use real data where available
      const [gamesResponse, newsResponse] = await Promise.all([
        apiService.getGames(), // This will use mock for NBA games (endpoint doesn't exist)
        apiService.getNewsAll(), // This uses REAL endpoint
      ]);
      
      // Check if we're using mock data
      if (gamesResponse.isMock) {
        console.log('ℹ️ Using mock NBA games (real endpoint not implemented)');
      } else {
        console.log('✅ Using real NBA games data');
      }
      
      if (newsResponse.usingMock) {
        console.log('ℹ️ Using mock news data');
      } else {
        console.log('✅ Using real news data');
      }
      
      setGames(gamesResponse.data || []);
      setNews(newsResponse.news?.nba || []);
      
    } catch (error) {
      console.log('Error loading data:', error.message);
      // Fallback to mock data if needed
      setGames([
        {
          id: 1,
          away_team: 'Golden State Warriors',
          home_team: 'Los Angeles Lakers',
          awayScore: 105,
          homeScore: 108,
          status: 'Final',
          quarter: '4th',
          time: '7:30 PM ET',
          channel: 'TNT',
          timeRemaining: '0:00'
        }
      ]);
      setNews([]);
    }
  };
  
  loadData();
}, []);
