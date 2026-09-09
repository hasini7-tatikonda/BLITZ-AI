# BLITZ — AI Assistant

BLITZ is an AI-powered chatbot built to provide a simple and interactive way to communicate with an LLM.

The project focuses on making AI conversations easy to manage while keeping the interface clean, responsive, and practical. It was developed as a Beginner-level AI application project with an emphasis on API integration, user interaction, validation, and a usable chatbot experience.

## Purpose of the Project

This project was developed to get practical experience with AI APIs, frontend development, API integration, streaming responses, state management, and building a usable AI-powered application.

BLITZ helped me understand the basic workflow of connecting a frontend application with an LLM API and building additional features around the chatbot experience.

## Features

- AI-powered conversations using the Groq API
- Streaming AI responses for a more natural chat experience
- Stop response generation when needed
- Regenerate an AI response
- Copy responses easily
- Conversation history
- Create new chats
- Rename conversations
- Delete conversations
- Clear conversation history
- Persistent chat history
- Dark and light theme
- Input validation and error handling
- Responsive and clean user interface
- Modern UI with clear visual hierarchy

## Tech Stack

- **React** — Frontend framework
- **TypeScript** — Type-safe development
- **Vite** — Development and build tool
- **Tailwind CSS** — UI styling
- **Groq API** — AI/LLM integration
- **Lucide React** — Icons
- **React Markdown** — Markdown response rendering
- **Remark GFM** — GitHub-flavored Markdown support

## How It Works

The basic flow of BLITZ is:

1. User enters a message  
2. The application validates the input  
3. The message is sent to the Groq API  
4. The AI response is streamed back  
5. The response is displayed in the chat   
6. The conversation is saved to chat history

This allows BLITZ to behave more like a practical AI assistant rather than just a basic text input and output application.

## Getting Started
1. Clone the repository
- git clone <https://github.com/hasini7-tatikonda/BLITZ-AI>
2. Open the project
- cd BLITZ-AI
3. Install dependencies
- npm install
4. Configure the environment
- Create a .env file in the project root:
  VITE_GROQ_API_KEY=your_api_key_here
5. Start the development server
- npm run dev
The application will be available through the local development URL shown in the terminal.

**Build for Production**
To create a production build:
npm run build
To preview the production build:
npm run preview

## Future Improvements

Some possible improvements for future versions include:

1. Moving API requests to a secure backend
2. User authentication
3. Cloud-based conversation storage
4. Multiple AI model selection
5. File and document support
6. Voice input and output
7. More advanced conversation management
8. Improved conversation search
9. Deployment for public access
