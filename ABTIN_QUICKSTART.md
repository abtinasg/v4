# Abtin Psychologist AI - Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### Step 1: Set Environment Variables

Add these lines to your `.env` file:

```env
# Abtin Psychologist AI credentials
ABTIN_USERNAME=abtin
ABTIN_PASSWORD=MySecurePassword123!
```

> 💡 **Tip**: Choose a strong password for production use!

### Step 2: Ensure OpenRouter API Key

Make sure you have the OpenRouter API key configured:

```env
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Step 3: Start the Application

```bash
npm run dev
```

### Step 4: Access the Abtin Section

Open your browser and navigate to:

```
http://localhost:3000/abtin
```

### Step 5: Login

Enter the credentials you set in Step 1:
- **Username**: `abtin`
- **Password**: `MySecurePassword123!`

## 🎯 How to Use

### 1. Choose Your Mode

**Brainstorm Mode** 🌟
- Best for: Generating new ideas, creative problem-solving
- Example: "Help me brainstorm marketing strategies for a new product"

**Debate Mode** 💭
- Best for: Critical thinking, examining arguments
- Example: "Challenge my assumption that remote work is always better"

### 2. Select an AI Model

- **OpenAI GPT-5.1**: Best for complex reasoning
- **Claude Sonnet 4.5**: Exceptional for nuanced analysis
- **Claude 3.5 Sonnet**: Great balance of quality and speed
- **OpenAI GPT-4o**: OpenAI's flagship model

### 3. Start Chatting!

Type your message and press Enter (or click Send).

## 📝 Example Conversations

### Brainstorm Mode Example
```
You: I want to start a side business but I'm not sure what to do.

AI: Let's explore this together! Here are some directions we could take:
1. What are your natural skills and passions?
2. What problems do you notice in your daily life that need solutions?
3. What hobbies could potentially be monetized?
...
```

### Debate Mode Example
```
You: I think social media is entirely negative for society.

AI: That's an interesting position. Let me challenge that assumption:
1. How do you account for social movements like #MeToo that gained traction through social media?
2. What about people in remote areas who maintain connections through these platforms?
...
```

## 🔒 Security Notes

- This section is independent from the main application
- No credit system or rate limiting
- Conversations are not saved (client-side only)
- Each session starts fresh after logout

## ❓ Troubleshooting

### "Authentication not configured" error
- Check that `ABTIN_USERNAME` and `ABTIN_PASSWORD` are set in your `.env` file
- Restart the application after adding environment variables

### "Invalid credentials" error
- Verify you're using the exact username and password from `.env`
- Check for extra spaces or special characters

### Can't access /abtin route
- Make sure the application is running (`npm run dev`)
- Check the console for any error messages
- Verify the route exists at `http://localhost:3000/abtin`

## 🎨 Features

✅ Two specialized modes (Brainstorm & Debate)
✅ Four premium AI models
✅ Real-time streaming responses
✅ Clean, modern interface
✅ Session-based authentication
✅ No credit costs (standalone section)
✅ Conversation history (per session)

## 📚 Next Steps

- Read the full documentation: [ABTIN_SECTION.md](./ABTIN_SECTION.md)
- Experiment with different modes and models
- Try various prompting techniques
- Share feedback for improvements!

---

**Need Help?** Check the main documentation or open an issue on GitHub.
