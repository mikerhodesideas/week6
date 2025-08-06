# Mike Rhodes - Build the Agent - Quick Template v1

Week 6 App
New Scripts
AI APIs
New 'data insights' page


## Environment Setup

### API Keys Configuration
Before using the AI insights feature, you need to configure API keys for the supported providers:

1. **Copy the environment template:**
   ```bash
   cp .env.template .env.local
   ```

2. **Add your API keys to `.env.local`:**
   - **OpenAI**: Get your key from [platform.openai.com/account/api-keys](https://platform.openai.com/account/api-keys)
   - **Anthropic**: Get your key from [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys)  
   - **Gemini**: Get your key from [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)

3. **Available AI Models:**
   - **OpenAI**: GPT-4.1 Nano (default), GPT-4.1 Mini, GPT-4.1
   - **Anthropic**: Claude 4 Sonnet (default), Claude 4 Opus
   - **Gemini**: Gemini 2.5 Flash (default), Gemini 2.5 Pro

The app will automatically select sensible defaults when you choose a provider, but you can configure custom defaults in your `.env.local` file.

## Technologies used
This doesn't really matter, but is useful for the AI to understand more about this project. We are using the following technologies
- React with Next.js 15 App Router
- TailwindCSS for design
- A google sheet deployed as a web app for the data storage
- A google script to power data fetching 

