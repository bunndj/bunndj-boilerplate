# OpenAI Production Configuration

This document addresses the OpenAI timeout issues occurring in production environments.

## Problem Description

OpenAI API calls are timing out in production, causing the system to fall back to basic extraction with low confidence scores (40). This happens due to:

1. **Network Latency**: Production servers have different network conditions
2. **Firewall/Proxy**: Production environments may have network restrictions
3. **Resource Constraints**: Limited server resources affecting HTTP processing
4. **Short Timeouts**: Default timeouts may be insufficient for production

## Solution: Enhanced Configuration

### Environment Variables

Add these to your production `.env` file:

```env
# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_TIMEOUT=300          # 5 minutes total timeout
OPENAI_CONNECT_TIMEOUT=30   # 30 seconds connection timeout
OPENAI_RETRY_ATTEMPTS=3     # Retry failed requests 3 times
OPENAI_MAX_EXECUTION_TIME=600  # 10 minutes PHP execution limit
```

### Nginx Configuration (if applicable)

If using Nginx, increase timeout settings:

```nginx
# In your nginx site configuration
proxy_read_timeout 600s;
proxy_connect_timeout 30s;
proxy_send_timeout 600s;
```

### PHP Configuration

Ensure PHP settings allow long-running requests:

```ini
# In php.ini or via environment
max_execution_time = 600
max_input_time = 300
memory_limit = 512M
```

## Enhanced Features

### 1. Retry Logic
- Automatically retries failed requests up to 3 times
- 1-second delay between retries
- Exponential backoff for better reliability

### 2. Better Error Detection
- Detects various timeout error types
- Logs detailed error information for debugging
- Graceful fallback to basic extraction

### 3. Performance Monitoring
- Logs response times for performance analysis
- Tracks request success/failure rates
- Monitors timeout configurations

## Troubleshooting

### Check Logs
Monitor Laravel logs for these entries:
```bash
# Check for OpenAI errors
tail -f storage/logs/laravel.log | grep "OpenAI"

# Look for timeout errors
grep -i "timeout" storage/logs/laravel.log
```

### Common Error Messages

1. **"Connection timed out"** → Network connectivity issue
2. **"cURL error 28"** → Request timeout exceeded
3. **"Maximum execution time"** → PHP execution limit reached
4. **"OpenAI request timed out"** → API response too slow

### Testing OpenAI Connection

Test the connection manually:
```bash
# Test from your production server
curl -X POST "https://api.openai.com/v1/chat/completions" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [{"role": "user", "content": "Test"}],
    "max_tokens": 100
  }'
```

## Performance Optimization

### 1. Content Size Reduction
- Current limit: 8000 characters from document
- Consider reducing if timeouts persist
- Implement content summarization for large documents

### 2. Model Selection
- Currently using `gpt-4o-mini` for speed
- Consider `gpt-3.5-turbo` for even faster responses
- Balance between speed and accuracy

### 3. Caching Strategy
- Cache successful extractions
- Avoid re-processing identical documents
- Implement Redis caching for better performance

## Monitoring & Alerts

### Key Metrics to Monitor
1. OpenAI API response times
2. Timeout frequency
3. Fallback usage rate
4. Document processing success rate

### Alert Thresholds
- Response time > 60 seconds
- Timeout rate > 10%
- Fallback usage > 20%

## Emergency Fallback

If OpenAI continues to fail, the system will:
1. Use basic regex-based extraction
2. Extract guest count, emails, and basic information
3. Provide confidence score of 40
4. Allow manual form completion

The fallback ensures the application remains functional even when OpenAI is unavailable.

## Next Steps

1. Deploy the enhanced configuration
2. Monitor logs for 24-48 hours
3. Adjust timeout values based on actual performance
4. Consider implementing async processing for large documents
5. Set up monitoring alerts for production stability
