package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/google/generative-ai-go/genai"
	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
	"google.golang.org/api/option"
)

// Response structures for different flows
type ChatRequest struct {
	Message string `json:"message"`
}

type ChatResponse struct {
	Response  string    `json:"response"`
	Timestamp time.Time `json:"timestamp"`
}

type SummaryRequest struct {
	Text string `json:"text"`
}

type SummaryResponse struct {
	Summary   string `json:"summary"`
	WordCount int    `json:"wordCount"`
}

type CreativeRequest struct {
	Topic string `json:"topic"`
	Style string `json:"style"`
}

type CreativeResponse struct {
	Content string `json:"content"`
	Topic   string `json:"topic"`
	Style   string `json:"style"`
}

// Structured output example
type ProductAnalysis struct {
	Name           string   `json:"name"`
	Category       string   `json:"category"`
	Features       []string `json:"features"`
	Pros           []string `json:"pros"`
	Cons           []string `json:"cons"`
	Rating         float64  `json:"rating"`
	Recommendation string   `json:"recommendation"`
}

type AnalysisRequest struct {
	ProductDescription string `json:"productDescription"`
}

type WeatherInfo struct {
	Location    string `json:"location"`
	Temperature string `json:"temperature"`
	Condition   string `json:"condition"`
	Humidity    string `json:"humidity"`
	WindSpeed   string `json:"windSpeed"`
	Forecast    string `json:"forecast"`
}

// Global Gemini client
var geminiClient *genai.Client

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, trying to use system environment variables")
	}

	// Initialize Gemini client
	apiKey := os.Getenv("GOOGLE_GENAI_API_KEY")
	if apiKey == "" {
		log.Fatal("GOOGLE_GENAI_API_KEY environment variable is required")
	}

	ctx := context.Background()
	client, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		log.Fatalf("Failed to create Gemini client: %v", err)
	}
	defer client.Close()

	geminiClient = client

	// Set up HTTP routes
	router := mux.NewRouter()

	// Apply CORS middleware to all routes
	router.Use(corsMiddleware)

	// Health check endpoint
	router.HandleFunc("/health", healthHandler).Methods("GET", "OPTIONS")

	// API routes for different AI operations
	router.HandleFunc("/chat", chatHandler).Methods("POST", "OPTIONS")
	router.HandleFunc("/summarize", summaryHandler).Methods("POST", "OPTIONS")
	router.HandleFunc("/creative", creativeHandler).Methods("POST", "OPTIONS")
	router.HandleFunc("/analyze", analysisHandler).Methods("POST", "OPTIONS")
	router.HandleFunc("/weather", weatherHandler).Methods("POST", "OPTIONS")

	// Catch-all OPTIONS handler for preflight requests
	router.Methods("OPTIONS").HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// CORS headers are already set by middleware
		w.WriteHeader(http.StatusNoContent)
	})

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Starting Genkit + Gemini backend server on port %s", port)
	log.Printf("Available endpoints:")
	log.Printf("  GET  /health - Health check")
	log.Printf("  POST /chat - General chat with AI")
	log.Printf("  POST /summarize - Text summarization")
	log.Printf("  POST /creative - Creative content generation")
	log.Printf("  POST /analyze - Structured product analysis")
	log.Printf("  POST /weather - Weather information with simulated tool calling")

	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%s", port), router))
}

func chatHandler(w http.ResponseWriter, r *http.Request) {
	var req ChatRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	ctx := context.Background()
	model := geminiClient.GenerativeModel("gemini-2.5-flash")
	model.SetTemperature(0.7)
	model.SetMaxOutputTokens(1000)

	prompt := fmt.Sprintf("You are a helpful AI assistant. Please respond to: %s", req.Message)

	resp, err := model.GenerateContent(ctx, genai.Text(prompt))
	if err != nil {
		log.Printf("Error generating content: %v", err)
		http.Error(w, "Failed to generate response", http.StatusInternalServerError)
		return
	}

	var responseText string
	if len(resp.Candidates) > 0 && len(resp.Candidates[0].Content.Parts) > 0 {
		responseText = fmt.Sprintf("%v", resp.Candidates[0].Content.Parts[0])
	} else {
		responseText = "No response generated"
	}

	response := ChatResponse{
		Response:  responseText,
		Timestamp: time.Now(),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func summaryHandler(w http.ResponseWriter, r *http.Request) {
	var req SummaryRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	ctx := context.Background()
	model := geminiClient.GenerativeModel("gemini-2.5-flash")
	model.SetTemperature(0.3)
	model.SetMaxOutputTokens(500)

	prompt := fmt.Sprintf(`Please provide a concise summary of the following text. 
	Focus on the key points and main ideas:

	%s`, req.Text)

	resp, err := model.GenerateContent(ctx, genai.Text(prompt))
	if err != nil {
		log.Printf("Error generating summary: %v", err)
		http.Error(w, "Failed to generate summary", http.StatusInternalServerError)
		return
	}

	var responseText string
	if len(resp.Candidates) > 0 && len(resp.Candidates[0].Content.Parts) > 0 {
		responseText = fmt.Sprintf("%v", resp.Candidates[0].Content.Parts[0])
	} else {
		responseText = "No summary generated"
	}

	wordCount := len(strings.Fields(req.Text))

	response := SummaryResponse{
		Summary:   responseText,
		WordCount: wordCount,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func creativeHandler(w http.ResponseWriter, r *http.Request) {
	var req CreativeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	ctx := context.Background()
	model := geminiClient.GenerativeModel("gemini-2.5-flash")
	model.SetTemperature(0.9)
	model.SetMaxOutputTokens(1200)

	prompt := fmt.Sprintf(`Generate creative content about "%s" in the "%s" style. 
	Be imaginative and engaging while maintaining the requested style.`,
		req.Topic, req.Style)

	resp, err := model.GenerateContent(ctx, genai.Text(prompt))
	if err != nil {
		log.Printf("Error generating creative content: %v", err)
		http.Error(w, "Failed to generate creative content", http.StatusInternalServerError)
		return
	}

	var responseText string
	if len(resp.Candidates) > 0 && len(resp.Candidates[0].Content.Parts) > 0 {
		responseText = fmt.Sprintf("%v", resp.Candidates[0].Content.Parts[0])
	} else {
		responseText = "No creative content generated"
	}

	response := CreativeResponse{
		Content: responseText,
		Topic:   req.Topic,
		Style:   req.Style,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func analysisHandler(w http.ResponseWriter, r *http.Request) {
	var req AnalysisRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	ctx := context.Background()
	model := geminiClient.GenerativeModel("gemini-2.5-flash")
	model.SetTemperature(0.4)
	model.SetMaxOutputTokens(1500)

	prompt := fmt.Sprintf(`Analyze the following product description and provide a structured analysis:

	%s

	Please provide your response in valid JSON format with the following structure:
	{
		"name": "product name",
		"category": "product category",
		"features": ["feature1", "feature2", "feature3"],
		"pros": ["pro1", "pro2", "pro3"],
		"cons": ["con1", "con2"],
		"rating": 8.5,
		"recommendation": "detailed recommendation"
	}

	Only return the JSON, no additional text.`, req.ProductDescription)

	resp, err := model.GenerateContent(ctx, genai.Text(prompt))
	if err != nil {
		log.Printf("Error generating analysis: %v", err)
		http.Error(w, "Failed to generate analysis", http.StatusInternalServerError)
		return
	}

	var responseText string
	if len(resp.Candidates) > 0 && len(resp.Candidates[0].Content.Parts) > 0 {
		responseText = fmt.Sprintf("%v", resp.Candidates[0].Content.Parts[0])
	} else {
		responseText = "No analysis generated"
	}

	// Try to parse as JSON
	var analysis ProductAnalysis
	if err := json.Unmarshal([]byte(responseText), &analysis); err != nil {
		// If JSON parsing fails, create a structured response with the raw text
		analysis = ProductAnalysis{
			Name:           "Analysis Generated",
			Category:       "Unknown",
			Features:       []string{"See recommendation for details"},
			Pros:           []string{"See recommendation for details"},
			Cons:           []string{"See recommendation for details"},
			Rating:         0.0,
			Recommendation: responseText,
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(analysis)
}

func weatherHandler(w http.ResponseWriter, r *http.Request) {
	var location string
	if err := json.NewDecoder(r.Body).Decode(&location); err != nil {
		// Try to decode as a struct with location field
		var req struct {
			Location string `json:"location"`
		}
		r.Body.Close()
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid JSON - expected location string or {\"location\": \"city\"}", http.StatusBadRequest)
			return
		}
		location = req.Location
	}

	// Simulate getting weather data (tool calling simulation)
	weatherData := WeatherInfo{
		Location:    location,
		Temperature: "22°C",
		Condition:   "Partly cloudy",
		Humidity:    "65%",
		WindSpeed:   "15 km/h",
		Forecast:    "Sunny with occasional clouds",
	}

	ctx := context.Background()
	model := geminiClient.GenerativeModel("gemini-2.5-flash")
	model.SetTemperature(0.7)
	model.SetMaxOutputTokens(600)

	weatherJSON, _ := json.MarshalIndent(weatherData, "", "  ")
	prompt := fmt.Sprintf(`Based on the following weather data for %s, provide a friendly and informative weather summary:

	%s

	Please provide a natural, conversational response about the weather conditions.`, location, string(weatherJSON))

	resp, err := model.GenerateContent(ctx, genai.Text(prompt))
	if err != nil {
		log.Printf("Error generating weather response: %v", err)
		http.Error(w, "Failed to generate weather information", http.StatusInternalServerError)
		return
	}

	var responseText string
	if len(resp.Candidates) > 0 && len(resp.Candidates[0].Content.Parts) > 0 {
		responseText = fmt.Sprintf("%v", resp.Candidates[0].Content.Parts[0])
	} else {
		responseText = fmt.Sprintf("Weather data for %s: %s, %s", location, weatherData.Temperature, weatherData.Condition)
	}

	response := map[string]interface{}{
		"location": location,
		"weather":  responseText,
		"data":     weatherData,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	response := map[string]interface{}{
		"status":    "healthy",
		"timestamp": time.Now(),
		"service":   "genkit-gemini-backend",
		"version":   "1.0.0",
		"models":    []string{"gemini-2.5-flash"},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Log CORS request for debugging
		log.Printf("CORS: %s %s from %s", r.Method, r.URL.Path, r.Header.Get("Origin"))

		// Set CORS headers
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH")
		w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, X-Requested-With")
		w.Header().Set("Access-Control-Allow-Credentials", "true")
		w.Header().Set("Access-Control-Max-Age", "3600")

		// Handle preflight OPTIONS request
		if r.Method == "OPTIONS" {
			log.Printf("CORS: Handling OPTIONS preflight for %s", r.URL.Path)
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}
