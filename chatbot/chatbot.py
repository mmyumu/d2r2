import os
import openai

# openai.api_key = os.environ.get('OPENAI_KEY')
# completion = openai.Completion()

start_chat_log = '''Human: Hello, who are you?
AI: I am doing great. How can I help you today?
'''

class ChatBot:
    def __init__(self) -> None:
        pass

    def tell(self, sentence):
        return f"reply to : {sentence}"

        # if chat_log is None:
        #     chat_log = start_chat_log
        # prompt = f'{chat_log}Human: {question}\nAI:'
        # response = completion.create(
        #     prompt=prompt, engine="davinci", stop=['\nHuman'], temperature=0.9,
        #     top_p=1, frequency_penalty=0, presence_penalty=0.6, best_of=1,
        #     max_tokens=150)
        # answer = response.choices[0].text.strip()
        # return answer
        # return f"reply to : {sentence}"