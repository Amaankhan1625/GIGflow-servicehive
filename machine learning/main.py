from agent import agent
import os

def main():
    print("Welcome to AutoStream AI Agent! Type 'exit' to quit.")
    messages = []
    state = {
        "messages": messages,
        "intent": None,
        "lead_data": {},
        "response": None
    }
    
    while True:
        user_input = input("You: ")
        if user_input.lower() == 'exit':
            break
        state["messages"].append(user_input)
        result = agent.invoke(state)
        print(f"Agent: {result['response']}")
        # Update state for next turn
        state = result

if __name__ == "__main__":
    main()
