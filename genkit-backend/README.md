# Genkit + Gemini Go Backend - Proof of Concept

A comprehensive proof of concept Go backend that demonstrates the integration of Google's AI capabilities using the Gemini models. This project showcases various AI features including chat, text summarization, creative content generation, structured analysis, and simulated tool calling.

## 🚀 Features

- **Chat Interface**: General-purpose AI assistant powered by Gemini 2.5 Flash
- **Text Summarization**: Intelligent text summarization with word count analysis
- **Creative Content Generation**: Generate creative content in various styles
- **Structured Analysis**: Product analysis with JSON output for structured data
- **Weather Information**: Simulated tool calling for weather data with AI interpretation
- **CORS Support**: Cross-origin resource sharing for frontend integration
- **Health Monitoring**: Built-in health check endpoint
- **Environment Variables**: Configurable settings for different deployment environments

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Go Backend    │    │   Google AI     │
│   (React/etc)   │◄──►│   (Genkit)      │◄──►│   (Gemini)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                       ┌─────────────────┐
                       │   Environment   │
                       │   Variables     │
                       └─────────────────┘
```

## 📋 Prerequisites

- Go 1.21 or higher
- Google AI API Key (from [Google AI Studio](https://makersuite.google.com/app/apikey))
- Git (for cloning)

## 🛠️ Setup Instructions

### 1. Clone and Navigate

```bash
cd genkit-backend
```

### 2. Initialize Go Module

```bash
go mod init genkit-backend
go mod tidy
```

### 3. Install Dependencies

```bash
go get github.com/gorilla/mux@v1.8.1
go get github.com/joho/godotenv@v1.5.1
go get github.com/google/generative-ai-go@v0.15.0
go get google.golang.org/api@v0.169.0
```

### 4. Environment Configuration

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` and add your Google AI API key:

```env
GOOGLE_GENAI_API_KEY=your_actual_api_key_here
PORT=8080
```

### 5. Get Your Google AI API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API key"
4. Copy the generated key and add it to your `.env` file

## 🚀 Running the Application

### Development Mode

```bash
go run main.go
```

### Production Build

```bash
go build -o genkit-backend main.go
./genkit-backend
```

The server will start on `http://localhost:8080` (or the port specified in your `.env` file).

## 📡 API Endpoints

### Health Check
```
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "service": "genkit-gemini-backend",
  "version": "1.0.0",
      "models": ["gemini-2.5-flash"]
}
```

### Chat Interface
```
POST /chat
```

**Request:**
```json
{
  "message": "Hello, how are you today?"
}
```

**Response:**
```json
{
  "response": "Hello! I'm doing well, thank you for asking. How can I help you today?",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Text Summarization
```
POST /summarize
```

**Request:**
```json
{
  "text": "Your long text content here..."
}
```

**Response:**
```json
{
  "summary": "A concise summary of the provided text...",
  "wordCount": 150
}
```

### Creative Content Generation
```
POST /creative
```

**Request:**
```json
{
  "topic": "artificial intelligence",
  "style": "poetic"
}
```

**Response:**
```json
{
  "content": "Generated creative content...",
  "topic": "artificial intelligence",
  "style": "poetic"
}
```

### Product Analysis
```
POST /analyze
```

**Request:**
```json
{
  "productDescription": "iPhone 15 Pro - Latest smartphone with advanced camera system..."
}
```

**Response:**
```json
{
  "name": "iPhone 15 Pro",
  "category": "Smartphone",
  "features": ["Advanced camera system", "A17 Pro chip", "Titanium design"],
  "pros": ["Excellent camera quality", "Fast performance", "Premium build"],
  "cons": ["High price", "Limited battery life"],
  "rating": 8.5,
  "recommendation": "Great choice for users who prioritize camera quality and performance..."
}
```

### Weather Information
```
POST /weather
```

**Request:**
```json
"New York"
```
or
```json
{
  "location": "New York"
}
```

**Response:**
```json
{
  "location": "New York",
  "weather": "The weather in New York looks quite pleasant today...",
  "data": {
    "location": "New York",
    "temperature": "22°C",
    "condition": "Partly cloudy",
    "humidity": "65%",
    "windSpeed": "15 km/h",
    "forecast": "Sunny with occasional clouds"
  }
}
```

## 🧪 Testing the API

### Using curl

```bash
# Health check
curl http://localhost:8080/health

# Chat
curl -X POST http://localhost:8080/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is artificial intelligence?"}'

# Summarize
curl -X POST http://localhost:8080/summarize \
  -H "Content-Type: application/json" \
  -d '{"text": "Artificial intelligence (AI) is a wide-ranging branch of computer science concerned with building smart machines capable of performing tasks that typically require human intelligence..."}'

# Creative content
curl -X POST http://localhost:8080/creative \
  -H "Content-Type: application/json" \
  -d '{"topic": "space exploration", "style": "scientific"}'

# Product analysis
curl -X POST http://localhost:8080/analyze \
  -H "Content-Type: application/json" \
  -d '{"productDescription": "Tesla Model 3 - Electric sedan with autopilot capabilities and over 300 miles of range"}'

# Weather
curl -X POST http://localhost:8080/weather \
  -H "Content-Type: application/json" \
  -d '"San Francisco"'
```

### Using Postman

1. Import the API endpoints into Postman
2. Set the base URL to `http://localhost:8080`
3. Add `Content-Type: application/json` header for POST requests
4. Test each endpoint with the example payloads above

## 🚀 Deployment Options

### 1. Google Cloud Run

```bash
# Build for Cloud Run
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/genkit-backend

# Deploy to Cloud Run
gcloud run deploy genkit-backend \
  --image gcr.io/YOUR_PROJECT_ID/genkit-backend \
  --platform managed \
  --region us-central1 \
  --set-env-vars GOOGLE_GENAI_API_KEY=your_api_key
```

### 2. Docker

Create a `Dockerfile`:

```dockerfile
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -o main .

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/main .
CMD ["./main"]
```

Build and run:

```bash
docker build -t genkit-backend .
docker run -p 8080:8080 -e GOOGLE_GENAI_API_KEY=your_api_key genkit-backend
```

### 3. Traditional Server

```bash
# Build binary
go build -o genkit-backend main.go

# Run with systemd or your preferred process manager
sudo systemctl enable genkit-backend
sudo systemctl start genkit-backend
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `GOOGLE_GENAI_API_KEY` | Google AI API key | Yes | - |
| `PORT` | Server port | No | 8080 |
| `GOOGLE_CLOUD_PROJECT` | GCP project ID (for Vertex AI) | No | - |
| `GOOGLE_CLOUD_REGION` | GCP region (for Vertex AI) | No | - |

### Model Configuration

The application uses `gemini-2.0-flash-exp` by default. You can modify the model in the code:

```go
model := geminiClient.GenerativeModel("gemini-2.5-flash")
```

Available models:
- `gemini-2.0-flash-exp` (experimental, latest features)
- `gemini-1.5-flash` (stable, fast)
- `gemini-1.5-pro` (stable, more capable)

## 📊 Monitoring and Observability

### Health Monitoring

The `/health` endpoint provides service status and can be used for:
- Load balancer health checks
- Kubernetes liveness/readiness probes
- Monitoring system integration

### Logging

The application logs important events:
- Server startup and configuration
- API request errors
- AI model responses and errors

## 🛡️ Security Considerations

### Production Deployment

1. **API Key Security**: Never commit API keys to version control
2. **CORS Configuration**: Restrict CORS origins in production
3. **Rate Limiting**: Implement rate limiting for production use
4. **Authentication**: Add authentication middleware for sensitive endpoints
5. **HTTPS**: Always use HTTPS in production

### Example Security Middleware

```go
func authMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        apiKey := r.Header.Get("X-API-Key")
        if apiKey != os.Getenv("API_KEY") {
            http.Error(w, "Unauthorized", http.StatusUnauthorized)
            return
        }
        next.ServeHTTP(w, r)
    })
}
```

## 📈 Performance Optimization

### Caching

Consider implementing caching for frequently requested content:

```go
var cache = make(map[string]string)
var cacheMutex sync.RWMutex

func getCachedResponse(key string) (string, bool) {
    cacheMutex.RLock()
    defer cacheMutex.RUnlock()
    value, exists := cache[key]
    return value, exists
}
```

### Connection Pooling

The Google AI client automatically handles connection pooling, but you can optimize by:
- Reusing the client instance (as done in this implementation)
- Setting appropriate timeouts
- Implementing retry logic for failed requests

## 🧩 Frontend Integration

### React Example

```javascript
const API_BASE_URL = 'http://localhost:8080';

async function chatWithAI(message) {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message }),
  });
  
  return await response.json();
}

// Usage
const result = await chatWithAI("Hello, AI!");
console.log(result.response);
```

### Vue.js Example

```javascript
// In your Vue component
async submitMessage() {
  try {
    const response = await this.$http.post('/chat', {
      message: this.userMessage
    });
    this.aiResponse = response.data.response;
  } catch (error) {
    console.error('Error:', error);
  }
}
```

## 🔄 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

1. **API Key Error**: 
   - Ensure your `GOOGLE_GENAI_API_KEY` is set correctly
   - Verify the API key is valid and has appropriate permissions

2. **Module Import Errors**:
   - Run `go mod tidy` to download dependencies
   - Ensure you're using Go 1.21 or higher

3. **Port Already in Use**:
   - Change the `PORT` environment variable
   - Kill any existing processes on port 8080

4. **CORS Errors**:
   - Check that your frontend origin is allowed
   - Verify CORS headers are properly set

### Debug Mode

Enable debug logging by modifying the log level:

```go
log.SetLevel(log.DebugLevel)
```

## 📚 Resources

- [Google AI Go SDK Documentation](https://pkg.go.dev/github.com/google/generative-ai-go)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [Google AI Studio](https://makersuite.google.com/)
- [Go Web Development](https://golang.org/doc/)

## 🔮 Future Enhancements

- [ ] WebSocket support for real-time chat
- [ ] File upload and processing capabilities
- [ ] Integration with vector databases
- [ ] Advanced prompt engineering tools
- [ ] Metrics and analytics dashboard
- [ ] Multi-language support
- [ ] Batch processing capabilities
- [ ] Plugin system for custom tools

---

**Built with ❤️ using Go, Google AI, and the power of Gemini models** 