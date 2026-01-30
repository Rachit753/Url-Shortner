# Url Shortner with Analytics Dashboard

This project is a full-stack URL shortener that allows users to generate short links (random or custom) and track detailed analytics for each link. It records total and unique clicks, daily traffic trends, visitor locations, referrers, and browser statistics, all visualized in a real-time dashboard.

The project is built for developers and learners who want to understand how URL shortening services work end-to-end, including backend APIs, database design, analytics collection, and frontend data visualization using modern web technologies.


## Problem Statement
Long URLs are difficult to share and track. This project solves that by providing short, customizable URLs along with detailed usage analytics.

## Features
- Generate short URLs (random or custom)
- Redirect to original URLs
- Track total and unique clicks
- Collect visitor analytics (IP, location, browser, referrer)
- Real-time analytics dashboard
- Rate limiting and security middleware
  
## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- NanoID
- Axios (GeoIP lookup)

### Frontend
- React
- Axios
- Recharts

### Security & Tools
- Helmet
- Express Rate Limit
- Mongo Sanitize
  
## System Architecture
1. Client sends URL to backend API
2. Backend validates and stores URL in MongoDB
3. Short URL redirects increment click counters
4. Analytics data is stored per click
5. Frontend polls analytics endpoint and visualizes data
   
## API Endpoints

| Method | Endpoint | Description |
|------|--------|------------|
| POST | /api/url/shorten | Create random short URL |
| POST | /api/url/custom | Create custom short URL |
| GET | /:shortId | Redirect to original URL |
| GET | /api/url/:shortId/analytics | Get analytics data |

## Database Schema

### Url
- shortId (unique)
- originalUrl
- clicks
- createdAt

### Click
- urlId (reference)
- ip
- userAgent
- referrer
- location
- timestamp

## Environment Variables
- PORT
- MONGO_URI
- BASE_URL
  
## Setup & Installation
1. Clone the repository
2. Install dependencies:
   npm install
3. Add environment variables:
   PORT=5000
   MONGO_URI=your_mongodb_uri
4. Run the project:
   npm start
    
## Security Considerations
- Rate limiting to prevent abuse
- MongoDB query sanitization
- HTTP security headers using Helmet
- Input validation on URLs
  
## Performance & Scalability Notes
- Polling is used for simplicity; WebSockets can replace it for real-time updates
- Analytics aggregation is done in application layer; can be optimized using MongoDB aggregation pipelines
- Caching (Redis) can be added for high-traffic URLs
  
## Future Improvements
- User authentication
- URL expiration
- QR code generation
- WebSocket-based live analytics
  
## Author
Rachit

## License
MIT