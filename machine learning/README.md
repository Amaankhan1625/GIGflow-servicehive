# AutoStream Conversational AI Agent

This project implements a Conversational AI Agent for AutoStream, a SaaS product for automated video editing tools for content creators. The agent uses LangGraph for state management, RAG for knowledge retrieval, intent detection, and tool execution for lead capture.

## Features

- **Intent Identification**: Classifies user intents into casual greeting, product/pricing inquiry, or high-intent lead.
- **RAG-Powered Knowledge Retrieval**: Answers questions using a local knowledge base stored in JSON.
- **Tool Execution**: Captures leads by collecting name, email, and platform, then calling a mock API.
- **State Management**: Retains memory across conversation turns using LangGraph.

## Setup

1. Clone the repository.
2. Install dependencies: `pip install -r requirements.txt`
3. Set your OpenAI API key: `export OPENAI_API_KEY='your-key-here'`
4. Run the agent: `python main.py`

## Architecture Explanation

I chose LangGraph because it provides a structured way to manage complex conversational flows with state persistence across turns. Unlike simple chains, LangGraph allows for conditional routing based on intent and state, ensuring the agent can handle multi-turn conversations effectively. State is managed through a TypedDict that tracks messages, current intent, lead data, and responses, allowing the agent to remember context over 5-6 turns.

## WhatsApp Integration

To integrate this agent with WhatsApp, I would use the WhatsApp Business API with webhooks. The agent would run as a server (e.g., using Flask), receiving messages via webhooks from WhatsApp. For each incoming message, parse the payload, pass it to the LangGraph agent, generate a response, and send it back via the WhatsApp API. This requires setting up a webhook endpoint and handling authentication with WhatsApp's servers.
