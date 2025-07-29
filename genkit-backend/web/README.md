# Genkit + Gemini Backend Web GUI

A comprehensive web-based testing interface for the Genkit + Gemini Go backend. This GUI provides an intuitive way to test all AI endpoints with real-time feedback and beautiful visualizations.

## 🌟 Features

### 🏥 Health Monitoring
- Real-time backend connectivity status
- Performance metrics and response times
- Service information display
- Automatic health checks

### 💬 Chat Interface
- Interactive AI conversation
- Pre-loaded example prompts
- Real-time response display
- Conversation history

### 📝 Text Summarization
- Intelligent text summarization
- Word count analysis
- Multiple example texts (articles, research papers, meeting notes)
- Configurable summary length

### 🎨 Creative Content Generation
- Multiple creative styles (poetic, humorous, scientific, etc.)
- Topic-based content generation
- Style customization
- Creative writing examples

### 📊 Product Analysis
- Structured product analysis
- JSON-formatted responses
- Rating system (0-10 scale)
- Pros/cons breakdown
- Detailed recommendations

### 🌤️ Weather Information
- Location-based weather queries
- AI-interpreted weather data
- Simulated tool calling demonstration
- Natural language weather summaries

## 🚀 Quick Start

### Option 1: Direct File Access
1. Open `index.html` in your web browser
2. The GUI will automatically try to connect to `http://localhost:8080`
3. Start testing your backend endpoints!

### Option 2: Simple HTTP Server
```bash
# Navigate to the web directory
cd genkit-backend/web

# Start a simple HTTP server (Python 3)
python -m http.server 3000

# Or use Node.js
npx serve .

# Or use Go
go run -c "package main; import \"net/http\"; func main() { http.Handle(\"/\", http.FileServer(http.Dir(\".\"))); http.ListenAndServe(\":3000\", nil) }"
```

Then open `http://localhost:3000` in your browser.

### Option 3: Integrate with Backend
Add a static file server to your Go backend:

```go
// Add this to your main.go router setup
router.PathPrefix("/").Handler(http.FileServer(http.Dir("./web/")))
```

Then access the GUI at `http://localhost:8080`

## 🎯 Usage Guide

### Configuration
1. **Backend URL**: Change the backend URL if running on a different host/port
2. **Timeout**: Adjust request timeout for slower connections
3. **Auto-refresh**: Health checks run automatically every 30 seconds

### Testing Endpoints

#### 1. Health Check Tab 🏥
- Click "Check Health" to verify backend connectivity
- View service status, version, and response time
- Monitor connection status in real-time

#### 2. Chat Tab 💬
- Enter your message in the text area
- Click example buttons for quick testing
- Send messages and view AI responses
- Perfect for testing conversational AI capabilities

#### 3. Summarize Tab 📝
- Paste long text content
- Use example buttons for pre-loaded content
- Get concise summaries with word count analysis
- Test with articles, research papers, or meeting notes

#### 4. Creative Tab 🎨
- Enter a topic and select a creative style
- Choose from poetic, humorous, scientific, and more
- Generate creative content on any subject
- Experiment with different style combinations

#### 5. Analysis Tab 📊
- Describe a product for detailed analysis
- Get structured JSON responses
- View ratings, pros, cons, and recommendations
- Test with different product categories

#### 6. Weather Tab 🌤️
- Enter any city name
- Get AI-interpreted weather information
- Demonstrates simulated tool calling
- Natural language weather summaries

### Keyboard Shortcuts
- `Ctrl/Cmd + Enter`: Submit current form
- `Ctrl/Cmd + 1-6`: Switch between tabs
- `Tab`: Navigate between form fields

## 🎨 Features & Benefits

### Real-time Status Monitoring
- Visual connection indicators
- Automatic health checks
- Performance metrics
- Error handling and display

### User-Friendly Interface
- Modern, responsive design
- Intuitive tab-based navigation
- Example buttons for quick testing
- Beautiful JSON response formatting

### Comprehensive Testing
- All backend endpoints covered
- Example data for each endpoint
- Error handling and display
- Request/response timing

### Developer Experience
- Syntax-highlighted JSON responses
- Loading states and feedback
- Configurable timeouts
- Easy backend URL switching

## 🔧 Customization

### Changing Backend URL
1. Update the URL in the configuration section
2. Or modify the default in the JavaScript:
```javascript
let currentBackendUrl = 'http://your-backend-url:port';
```

### Adding New Endpoints
1. Add a new tab in the HTML
2. Create corresponding JavaScript functions
3. Follow the existing pattern for API calls

### Styling Customization
- Modify the CSS variables for colors
- Update the gradient backgrounds
- Customize the component styling
- Add your own branding

## 📱 Responsive Design

The GUI is fully responsive and works on:
- 💻 Desktop computers
- 📱 Mobile devices
- 📋 Tablets
- 🖥️ Large displays

## 🛡️ Security Considerations

### Development Use
- This GUI is designed for development and testing
- CORS is set to allow all origins in the example
- No authentication is implemented

### Production Deployment
If deploying to production:
1. Implement proper authentication
2. Restrict CORS origins
3. Use HTTPS connections
4. Add rate limiting
5. Implement proper error handling

## 🔍 Troubleshooting

### Backend Connection Issues
1. Verify your Go backend is running
2. Check the backend URL in configuration
3. Ensure CORS is properly configured
4. Check browser console for errors

### Response Errors
1. Verify your Google AI API key is set
2. Check backend logs for detailed errors
3. Ensure internet connectivity for AI API calls
4. Verify request format matches API expectations

### Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- JavaScript enabled
- Local storage support
- Fetch API support

## 📈 Performance Tips

1. **Caching**: Responses are not cached by default
2. **Timeouts**: Adjust timeout values for your network
3. **Concurrent Requests**: One request at a time per tab
4. **Large Responses**: JSON viewer handles large responses well

## 🚀 Advanced Features

### Custom Examples
Add your own example data by modifying the example functions:

```javascript
function setCustomExample() {
    document.getElementById('inputField').value = 'Your custom example';
}
```

### API Response Processing
Customize how responses are displayed:

```javascript
function formatCustomResponse(data) {
    // Your custom formatting logic
    return formattedData;
}
```

### Additional Endpoints
Extend the GUI to support new backend endpoints:

```javascript
async function callCustomEndpoint() {
    // Your custom API call logic
}
```

## 📚 Resources

- [Go Backend Documentation](../README.md)
- [Google AI SDK Documentation](https://pkg.go.dev/github.com/google/generative-ai-go)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [Web Development Best Practices](https://web.dev/)

## 🤝 Contributing

1. Fork the repository
2. Make your changes to the web GUI
3. Test thoroughly across different browsers
4. Submit a pull request with detailed description

## 📄 License

This web GUI is part of the Genkit + Gemini Backend project and follows the same MIT License.

---

**Happy Testing! 🚀**

Built with ❤️ for developers who love great tooling and beautiful interfaces. 