# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

XV Studio is an AI-driven marketing content creation platform for SMBs built with Next.js 14, TypeScript, and Tailwind CSS. The application uses a conversational AI assistant (OpenAI) to guide users through creating marketing content packages, which are then sent to n8n workflows via webhooks for processing.

## Development Commands

```bash
# Development
npm run dev           # Start Next.js development server on localhost:3000

# Production
npm run build         # Build the application for production
npm start            # Start production server

# Code quality
npm run lint         # Run ESLint
```

## Environment Variables

Required environment variables (see `.env.example`):

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key (client-side)
- `SUPABASE_SERVICE_KEY` - Supabase service role key (server-side)
- `OPENAI_API_KEY` - OpenAI API key for the assistant
- `N8N_WEBHOOK_URL_WEEKLY_SOCIAL_MEDIA_PACKAGE` - n8n webhook endpoint for social media packages
- `NEXT_PUBLIC_N8N_WEBHOOK_URL_BUSINESS_WEBSITE_DNA` - n8n webhook for business website DNA
- `N8N_WEBHOOK_URL_PRODUCT_DATA` - n8n webhook for product data scraping and analysis

## Architecture

### Application Flow

1. **Product Selection**: Users select a content product from the sidebar (e.g., "Social Media Package")
2. **Conversational Assistant**: The chat interface initiates a conversation with an AI assistant that collects requirements through natural dialogue
3. **Content Generation**: Once the user confirms, the assistant generates a structured JSON payload containing the content package
4. **Webhook Delivery**: The payload is automatically sent to the configured n8n webhook for downstream processing

### Key Directories

- `app/` - Next.js App Router pages and API routes
  - `app/studio/page.tsx` - Main studio interface (3-column layout: sidebar, chat, preview)
  - `app/api/assistant/route.ts` - OpenAI chat completions endpoint
  - `app/api/webhook/` - Webhook forwarding endpoints for n8n integration
- `components/` - React components organized by feature
  - `components/chat/` - Chat interface components
  - `components/sidebar/` - Project selection and navigation
  - `components/landing/` - Landing page sections
  - `components/preview/` - Content preview panel
  - `components/business/` - Business profile management
  - `components/products/` - Product/services catalog
  - `components/gallery/` - Saved projects gallery
- `lib/` - Utility modules
  - `lib/supabaseClient.ts` - Browser-side Supabase client (uses anon key)
  - `lib/supabaseAdmin.ts` - Server-side Supabase client (uses service key)
  - `lib/theme-provider.tsx` - Dark mode support via next-themes
- `types/` - TypeScript type definitions
  - `types/database.ts` - Supabase database schema types

### Supabase Client Pattern

The codebase uses two separate Supabase clients:

- **Browser Client** (`lib/supabaseClient.ts`): For client-side operations using the public anon key
- **Admin Client** (`lib/supabaseAdmin.ts`): For server-side operations requiring elevated privileges (service role key)

Both clients use singleton patterns with global caching in development to prevent multiple instances.

### AI Assistant System

The assistant (`app/api/assistant/route.ts`) uses a system prompt that:
- Guides users through a multi-step conversation
- Collects minimal required information
- Confirms the content plan before generating
- Outputs a structured JSON payload when the user confirms
- Uses GPT-4o-mini model with temperature 0.7

The chat container (`components/chat/ChatContainer.tsx`) detects when the assistant returns a JSON payload (via `hasPayload` flag) and automatically triggers the webhook delivery, marking the conversation as complete.

### Product Configuration

Products are configured in `components/chat/ChatContainer.tsx` via the `PRODUCT_CONFIGS` object. Each product has:
- `id`: Unique identifier
- `name`: Display name
- `greeting`: Initial message shown when the product is selected

Currently configured product: Social Media Package (id: 1)

### Path Aliases

The project uses `@/*` as a path alias pointing to the root directory. Import like:
```typescript
import Component from "@/components/Component"
import { supabaseBrowserClient } from "@/lib/supabaseClient"
```

### Styling

- Tailwind CSS with dark mode support via `class` strategy
- Custom CSS variables in `app/globals.css` for background/foreground colors
- Dark mode toggling through `next-themes` ThemeProvider in root layout
