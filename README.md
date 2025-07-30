# 🐛 Agents SDK - Minimal Reproduction Issue

![agents-header](https://github.com/user-attachments/assets/f6d99eeb-1803-4495-9c5e-3cf07a37b402)

<a href="https://deploy.workers.cloudflare.com/?url=https://github.com/cloudflare/agents-starter"><img src="https://deploy.workers.cloudflare.com/button" alt="Deploy to Cloudflare"/></a>

**⚠️ ISSUE REPRODUCTION**: This repository demonstrates a critical issue with the [`agents`](https://www.npmjs.com/package/agents) SDK when deployed to Cloudflare Workers. Subsequent requests in the same chat room stall unpredictably at random steps, while the same code works perfectly locally. Added a fetch call to verify if network calls are broken once the agent breaks.

## 🚨 The Problem

**Environment**: Cloudflare Workers (production deployment)  
**Affected**: Agents SDK chat flow with multiple requests per session  
**Status**: ❌ Broken in Workers, ✅ Works locally  

### Issue Description

We're migrating a Node.js project using the Agents SDK to Cloudflare Workers. The application uses:
- One agent per user serving multiple chat sessions
- SQLite for internal session mapping
- E2B sandbox integration
- Similar flow to the official chat bot example

### Reproduction Steps

1. Deploy this starter to Cloudflare Workers
2. Send the first chat message → ✅ **Works perfectly**
3. Send multiple messages in the same chat room but different sessions → ❌ **Hangs indefinitely** after some requests (~4 in this minimal reproduction, but about 1-2 requests in our production environment)
4. Subsequent requests stall at random steps in production:
   - Authentication
   - E2B sandbox loading
   - Tool initialization
   - Network calls never resolve or timeout

### Expected vs Actual Behavior

| Environment | First Request | Subsequent Requests |
|-------------|---------------|--------------------|
| **Local Development** | ✅ Works | ✅ Works |
| **Cloudflare Workers** | ✅ Works | ❌ Hangs randomly |

### Current Flow (onChatMessage)

```typescript
// This flow works locally but fails on Workers after first request
1. Authentication
2. Load E2B sandbox
3. Billing service check
4. Initialize tools
5. Return stream from Agents SDK  // ← Hangs here or earlier steps
```

## 🔍 How to Reproduce

### Prerequisites
- Cloudflare account
- OpenAI API key
- This exact starter template

### Setup Instructions

1. **Clone and Install**:
   ```bash
   npx create-cloudflare@latest --template cloudflare/agents-starter
   cd agents-starter
   npm install
   ```

2. **Configure Environment**:
   ```bash
   # Create .dev.vars file
   echo "OPENAI_API_KEY=your_openai_api_key" > .dev.vars
   ```

3. **Test Locally** (this works):
   ```bash
   npm start
   # Open browser, send multiple messages → All work fine
   ```

4. **Deploy to Workers** (this breaks):
   ```bash
   npm run deploy
   # Visit deployed URL, send first message → Works
   # Send second message → Hangs indefinitely
   ```

### 🔧 Technical Details

**Architecture**:
- One agent instance per user
- Multiple chat sessions mapped via SQLite
- Hyperdrive connection to PostgreSQL (GCP)
- E2B sandbox integration
- Streaming responses via Agents SDK

**Failure Pattern**:
- ✅ First request after deployment: Always succeeds
- ❌ Subsequent requests: Hang at unpredictable steps
- 🔄 No timeout or error - requests just never resolve
- 🏠 Local development: No issues whatsoever

**Affected Components**:
- Authentication flow
- E2B sandbox initialization
- Tool system setup
- Agents SDK streaming
- Network calls in general

## 📊 Issue Analysis

### What We Know

- **Timing**: Issue started recently (wasn't happening before)
- **Scope**: Only affects Cloudflare Workers deployment
- **Pattern**: First request always works, subsequent ones fail
- **Randomness**: Failure occurs at different steps unpredictably
- **No Errors**: Requests don't timeout or throw errors, they just hang

### Suspected Causes

1. **Workers Runtime Differences**: 
   - Different event loop behavior
   - Request/response lifecycle differences
   - Memory or state management issues
   - Max allowed connections

2. **Agents SDK Integration**:
   - Potential Workers-specific compatibility issue
   - State persistence between requests
   - Streaming response handling

3. **External Dependencies**:
   - E2B sandbox connection pooling
   - Hyperdrive connection management
   - SQLite state between requests

### 🧪 Debugging Steps Taken

- [x] Confirmed local development works perfectly
- [x] Verified first request always succeeds in Workers
- [x] Identified random failure points in subsequent requests
- [x] Ruled out API key or authentication issues
- [ ] Need investigation into Workers-specific behavior
- [ ] Need Agents SDK team input on Workers compatibility

## 📁 Project Structure

```
├── src/
│   ├── app.tsx        # Chat UI implementation
│   ├── server.ts      # ⚠️ Main agent logic (where issues occur)
│   ├── tools.ts       # Tool definitions (hangs during init)
│   ├── utils.ts       # Helper functions
│   └── styles.css     # UI styling
├── wrangler.jsonc     # Workers configuration
└── .dev.vars.example  # Environment template
```

### 🔍 Key Files for Investigation

- **`src/server.ts`**: Contains the main chat flow that hangs
- **`src/tools.ts`**: Tool initialization that sometimes fails
- **`wrangler.jsonc`**: Workers configuration that might affect behavior
- **Network calls**: Any external API calls that hang in Workers

## 🛠️ Help Needed

### For Cloudflare Team

1. **Workers Runtime Investigation**:
   - Are there known issues with persistent connections in Workers?
   - How should long-running agent sessions be handled?
   - Any Workers-specific considerations for the Agents SDK?

2. **Debugging Assistance**:
   - Best practices for debugging hanging requests in Workers
   - Logging/monitoring recommendations for this type of issue
   - Workers-specific profiling tools

### For Agents SDK Team

1. **Workers Compatibility**:
   - Is the Agents SDK fully tested on Cloudflare Workers?
   - Any known limitations or required configurations?
   - Recommended patterns for multi-request agent sessions?

2. **State Management**:
   - How should agent state persist between requests in Workers?
   - Are there Workers-specific initialization patterns?
   - Connection pooling best practices?

### For Community

1. **Similar Issues**:
   - Has anyone experienced similar hanging request issues?
   - Any workarounds or solutions found?
   - Alternative deployment patterns that work?

2. **Testing Help**:
   - Can others reproduce this issue with the same setup?
   - Different Workers configurations to try?
   - Alternative agent architectures that work reliably?

---

## 📋 Original Template Information

<details>
<summary>Click to expand original starter template documentation</summary>

### Features

- 💬 Interactive chat interface with AI
- 🛠️ Built-in tool system with human-in-the-loop confirmation
- 📅 Advanced task scheduling (one-time, delayed, and recurring via cron)
- 🌓 Dark/Light theme support
- ⚡️ Real-time streaming responses
- 🔄 State management and chat history
- 🎨 Modern, responsive UI

### Customization Guide

#### Adding New Tools

Add new tools in `tools.ts` using the tool builder:

```typescript
// Example of a tool that requires confirmation
const searchDatabase = tool({
  description: "Search the database for user records",
  parameters: z.object({
    query: z.string(),
    limit: z.number().optional(),
  }),
  // No execute function = requires confirmation
});

// Example of an auto-executing tool
const getCurrentTime = tool({
  description: "Get current server time",
  parameters: z.object({}),
  execute: async () => new Date().toISOString(),
});
```

#### Use a different AI model provider

The starting implementation uses the [`ai-sdk`](https://sdk.vercel.ai/docs/introduction) and [OpenAI provider](https://sdk.vercel.ai/providers/ai-sdk-providers/openai), but you can use alternatives like [`workers-ai-provider`](https://sdk.vercel.ai/providers/community-providers/cloudflare-workers-ai) or [`anthropic`](https://sdk.vercel.ai/providers/ai-sdk-providers/anthropic).

</details>

## Learn More

- [`agents`](https://github.com/cloudflare/agents/blob/main/packages/agents/README.md)
- [Cloudflare Agents Documentation](https://developers.cloudflare.com/agents/)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)

## License

MIT
