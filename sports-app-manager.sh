check_secret_phrase_logs() {
    print_header "CHECKING SECRET PHRASE LOGS"
    
    echo -e "${CYAN}Checking MongoDB for secret phrase logs...${NC}"
    
    # Check MongoDB directly
    if command -v mongosh &> /dev/null; then
        mongosh --quiet --eval "
        use sports-app;
        const count = db.secretphraseanalytics.countDocuments();
        const recent = db.secretphraseanalytics.find().sort({timestamp: -1}).limit(3).toArray();
        
        print('Total secret phrase events: ' + count);
        print('');
        print('Recent events:');
        recent.forEach((doc, i) => {
            print(\`\${i+1}. \${doc.phraseKey} - \${doc.userId?.substring(0, 20)}... - \${new Date(doc.timestamp).toLocaleString()}\`);
        });
        " 2>/dev/null || echo "Could not connect to MongoDB"
    else
        echo "mongosh not installed"
    fi
    
    # Also check backend logs
    echo -e "\n${CYAN}Checking backend logs for secret phrases...${NC}"
    grep -i "26arbitrage\|secret.*phrase\|log-event" /Users/jerryexon/sports-app-production/logs/backend.log | tail -5
}
