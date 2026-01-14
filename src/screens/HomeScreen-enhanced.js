// In HomeScreen-enhanced.js, update the useEffect or API calls:

useEffect(() => {
  const loadData = async () => {
    try {
      // // Use the new methods that use real data where available
      const [gamesResponse, newsResponse] = await Promise.all([
        apiService.getGames(), // This will use mock for NBA games (endpoint doesn't exist)
        apiService.getNewsAll(), // This uses REAL endpoint
      ]);
      
      // Check if we're using mock data
      if (gamesResponse.isMock) {
        // } else {
        // }
      
      if (newsResponse.usingMock) {
        // } else {
        // }
      
      setGames(gamesResponse.data || []);
      setNews(newsResponse.news?.nba || []);
      
    } catch (error) {
      // // Fallback to mock data if needed
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
