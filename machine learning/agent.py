import os
from langchain_openai import ChatOpenAI
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode
from typing import TypedDict, List, Optional
import json

# Mock lead capture function
def mock_lead_capture(name: str, email: str, platform: str):
    print(f"Lead captured successfully: {name}, {email}, {platform}")

# Load knowledge base
with open('knowledge_base.json', 'r') as f:
    docs = json.load(f)

# Initialize embeddings and vector store
embeddings = OpenAIEmbeddings(api_key="sk-proj-your-actual-api-key-here")
vectorstore = FAISS.from_texts([doc['content'] for doc in docs], embeddings)
retriever = vectorstore.as_retriever()

# LLM
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0, api_key="sk-proj-your-actual-api-key-here")

# State definition
class AgentState(TypedDict):
    messages: List[str]
    intent: Optional[str]
    lead_data: dict
    response: Optional[str]

# Intent classification node
def classify_intent(state: AgentState):
    prompt = ChatPromptTemplate.from_template(
        "Classify the user's intent from the following options: casual greeting, product or pricing inquiry, high-intent lead (ready to sign up). User message: {message}"
    )
    chain = prompt | llm | StrOutputParser()
    intent = chain.invoke({"message": state['messages'][-1]})
    state['intent'] = intent.strip()
    return state

# RAG retrieval node
def retrieve_info(state: AgentState):
    if state['intent'] in ['product or pricing inquiry']:
        docs = retriever.get_relevant_documents(state['messages'][-1])
        context = "\n".join([doc.page_content for doc in docs])
        prompt = ChatPromptTemplate.from_template(
            "Answer the user's question based on the following context: {context}. User message: {message}"
        )
        chain = prompt | llm | StrOutputParser()
        response = chain.invoke({"context": context, "message": state['messages'][-1]})
        state['response'] = response
    return state

# Lead collection node
def collect_lead(state: AgentState):
    if state['intent'] == 'high-intent lead (ready to sign up)':
        lead_data = state.get('lead_data', {})
        if 'name' not in lead_data:
            state['response'] = "Great! To get started, could you please provide your name?"
        elif 'email' not in lead_data:
            state['response'] = "Thanks! Now, could you share your email address?"
        elif 'platform' not in lead_data:
            state['response'] = "Almost there! What platform do you create content on (e.g., YouTube, Instagram)?"
        else:
            # All data collected, trigger tool
            mock_lead_capture(lead_data['name'], lead_data['email'], lead_data['platform'])
            state['response'] = "Thank you! Your lead has been captured successfully."
    return state

# Response generation node
def generate_response(state: AgentState):
    if not state.get('response'):
        if state['intent'] == 'casual greeting':
            state['response'] = "Hello! How can I assist you with AutoStream today?"
        else:
            state['response'] = "I'm here to help with AutoStream. What would you like to know?"
    return state

# Update lead data based on user input
def update_lead_data(state: AgentState):
    if state['intent'] == 'high-intent lead (ready to sign up)':
        user_msg = state['messages'][-1].lower()
        lead_data = state.get('lead_data', {})
        if 'name' not in lead_data and 'name' in user_msg:
            lead_data['name'] = user_msg.split('name is ')[-1] if 'name is' in user_msg else user_msg
        elif 'email' not in lead_data and '@' in user_msg:
            lead_data['email'] = user_msg
        elif 'platform' not in lead_data:
            lead_data['platform'] = user_msg
        state['lead_data'] = lead_data
    return state

# Build the graph
graph = StateGraph(AgentState)

graph.add_node("classify_intent", classify_intent)
graph.add_node("retrieve_info", retrieve_info)
graph.add_node("collect_lead", collect_lead)
graph.add_node("generate_response", generate_response)
graph.add_node("update_lead", update_lead_data)

graph.set_entry_point("classify_intent")

graph.add_edge("classify_intent", "retrieve_info")
graph.add_edge("retrieve_info", "collect_lead")
graph.add_edge("collect_lead", "update_lead")
graph.add_edge("update_lead", "generate_response")
graph.add_edge("generate_response", END)

agent = graph.compile()
