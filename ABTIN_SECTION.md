# Abtin Psychologist AI Section

## Overview

The `/abtin` section is a dedicated AI-powered psychologist interface that helps users explore their thoughts through two different modes:

- **Brainstorm Mode**: Creative, divergent thinking for generating ideas freely without judgment
- **Debate Mode**: Critical analysis through Socratic dialogue to challenge and refine ideas

## Features

### Authentication
- Basic HTTP authentication
- Username and password stored in environment variables
- Session-based access (credentials stored in sessionStorage)

### AI Models
The section supports 4 high-quality AI models:
1. **OpenAI GPT-5.1** - Most advanced reasoning and analysis
2. **Anthropic Claude Sonnet 4.5** - Exceptional nuanced analysis
3. **Anthropic Claude 3.5 Sonnet** - High quality analysis and reasoning
4. **OpenAI GPT-4o** - OpenAI flagship model

### Modes

#### Brainstorm Mode
- Encourages creative, divergent thinking
- Uses techniques like mind mapping and lateral thinking
- Higher temperature (0.9) for more creative responses
- Focuses on generating multiple ideas without judgment
- Warm, encouraging tone

#### Debate Mode
- Critical thinking through Socratic dialogue
- Presents counter-arguments and alternative viewpoints
- Lower temperature (0.7) for more focused responses
- Helps examine assumptions and biases
- Intellectually rigorous but respectful tone

## Setup

### Environment Variables

Add the following to your `.env` file:

```env
# Abtin Psychologist AI Section
ABTIN_USERNAME=abtin
ABTIN_PASSWORD=your_secure_abtin_password
```

### OpenRouter API Key

The section uses the OpenRouter API for AI model access. Ensure you have:

```env
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Usage

1. Navigate to `/abtin` in your browser
2. Enter your username and password (from environment variables)
3. Select a mode (Brainstorm or Debate)
4. Choose an AI model
5. Start chatting with the AI psychologist

## API Endpoint

**POST** `/api/abtin/chat`

### Authentication
- Uses Basic HTTP authentication
- Header: `Authorization: Basic <base64(username:password)>`

### Request Body
```json
{
  "messages": [
    { "role": "user", "content": "Your message here" }
  ],
  "mode": "brainstorm" | "debate",
  "model": "openai/gpt-5.1" | "anthropic/claude-sonnet-4.5" | "anthropic/claude-3.5-sonnet" | "openai/gpt-4o"
}
```

### Response
- Streaming SSE (Server-Sent Events)
- Returns AI responses in real-time

### Example Request
```bash
curl -X POST http://localhost:3000/api/abtin/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic $(echo -n 'abtin:password' | base64)" \
  -d '{
    "messages": [
      { "role": "user", "content": "Help me brainstorm ideas for a new project" }
    ],
    "mode": "brainstorm",
    "model": "openai/gpt-5.1"
  }'
```

## Security

- Authentication is handled via Basic HTTP Auth
- Credentials are stored in sessionStorage (base64 encoded) for the current session
- API endpoints validate credentials on every request
- No Clerk authentication is required (standalone section)
- Environment variables must be set for ABTIN_USERNAME and ABTIN_PASSWORD (no defaults)

### Security Considerations

⚠️ **Important**: 
- Credentials in sessionStorage are vulnerable to XSS attacks
- This implementation is suitable for internal/private use
- For production use with sensitive data, consider implementing:
  - HTTP-only cookies with session tokens
  - HTTPS enforcement
  - Additional security headers
  - Rate limiting on authentication attempts

## Technical Details

### Files Created
- `/src/app/abtin/page.tsx` - Main UI component
- `/src/app/api/abtin/chat/route.ts` - API endpoint
- `/src/lib/auth/abtin-auth.ts` - Authentication utilities

### Dependencies
- Uses existing OpenRouter client (`@/lib/ai/openrouter`)
- Framer Motion for animations
- Lucide React for icons

## Notes

- The section is completely independent from the rest of the application
- No credit system or rate limiting applied (different from main chat)
- Conversation history is maintained in client memory (not persisted)
- Maximum 50 messages per conversation
- Maximum 10,000 characters per message
