
import openai
import json

def clean_conversation(text):
    completion = openai.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "user", "content": f'This is a sales conversation. \
             Can you fix the errors if any in the grammar in transcription of the audio or any other errors. \
             Just give the result and nothing else. Conversation:{text}'}
        ],
    )
    return completion.choices[0].message.content


def gpt_summarize(text):
    completion = openai.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "user", "content": f'This is a sales conversation. \
             Can you summarize the conversation highlighting the important points discussed. Just give me the summary and no additonal text. Conversation:{text}'}
        ],
    )
    return completion.choices[0].message.content



def generate_to_do(text):
    data = [{"task": "task1", "deadline": "date1"}, {"task": "task2", "deadline": "date2"}]
    completion = openai.chat.completions.create(
        model="gpt-4o",
        messages = [{ 
                 "role": "user", 'content': f'This is a sales conversation. Can you generate only the important to-do list based on action items from the call. \
                Today\'s date is 8th July 2024, take that as reference for deadline. \
                Return the result in a JSON array format like this: {json.dumps(data)}  \
                If there is no deadline for a task, just keep the deadline entry empty. \
                If there are no important to-do items, return an empty array. Conversation: {text}.\
                IMPORTANT: Please return only the JSON array and nothing else. Give the deadline in UTC time'
            }
        ]
    )
    return completion.choices[0].message.content

