# your_app/consumers.py
import json
import base64

import json
from collections import deque
import threading

from channels.generic.websocket import JsonWebsocketConsumer
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from google.cloud.speech import RecognitionConfig, StreamingRecognitionConfig
from helpers.speech_translate import SpeechClientBridge, consume_stream
from helpers.calls import gpt_summarize, clean_conversation, generate_to_do
from google.cloud import speech, language_v1

from .models import CallRecord, Contact, Deal, CallSummary


config = RecognitionConfig(
    encoding=RecognitionConfig.AudioEncoding.MULAW,
    sample_rate_hertz=8000,
    language_code="en-US",
)
streaming_config = StreamingRecognitionConfig(config=config, interim_results=True)

language_client = language_v1.LanguageServiceClient()


def on_transcription_response(response, consumer):
    if not response.results:
        return

    result = response.results[0]
    if not result.alternatives:
        return

    transcription = result.alternatives[0].transcript
    added_text = transcription[len(consumer.last_partial_text):].strip()
    if added_text:
        if consumer.last_partial_text and not consumer.last_partial_text.endswith(" "):
            added_text = " " + added_text
        print("Added Text: " + added_text)
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            "transcriptions",  
            {
                "type": "send.transcription",
                "text": added_text,
                "voice_type": consumer.message_type
            }
        )
    consumer.last_partial_text = transcription


class TranscriptionDataConsumer(JsonWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.queue = deque()
        self.contact_id = None
        self.deal_id = None

    def connect(self):
        self.accept()
        async_to_sync(self.channel_layer.group_add)(
            "transcriptions",  
            self.channel_name
        )
        self.send(text_data=json.dumps({
            'is_connected': True
        }))

    def get_queue_as_json(self):
        data = []
        for item in self.queue:
            data.append({
                item['type']: item['text']
            })
        self.queue = []
        return json.dumps(data, indent=4)
    
    def analyze_sentiment(self, text):
        document = language_v1.Document(content=text, type_=language_v1.Document.Type.PLAIN_TEXT)
        sentiment = language_client.analyze_sentiment(request={'document': document}).document_sentiment
        
        # Detailed sentiment annotation
        sentiment_score = sentiment.score
        sentiment_magnitude = sentiment.magnitude
        if sentiment_score > 0.25:
            sentiment_annotation = "positive"
        elif sentiment_score < -0.25:
            sentiment_annotation = "negative"
        else:
            sentiment_annotation = "neutral"
        
        sentences = language_client.analyze_sentiment(request={'document': document}).sentences
        sentence_annotations = []
        for sentence in sentences:
            sentence_text = sentence.text.content
            sentence_sentiment_score = sentence.sentiment.score
            sentence_sentiment_magnitude = sentence.sentiment.magnitude
            if sentence_sentiment_score > 0.25:
                sentence_annotation = "positive"
            elif sentence_sentiment_score < -0.25:
                sentence_annotation = "negative"
            else:
                sentence_annotation = "neutral"
            sentence_annotations.append({
                'text': sentence_text,
                'sentiment_score': sentence_sentiment_score,
                'sentiment_magnitude': sentence_sentiment_magnitude,
                'annotation': sentence_annotation
            })
        
        return sentiment_score, sentiment_magnitude, sentiment_annotation, sentence_annotations
    
    def receive(self, text_data):
        msg = json.loads(text_data)
        print(msg, "mesage")
        self.contact_id = int(msg['contact_id'])
        self.deal_id = int(msg['contact_id'])



    def disconnect(self, close_code):
        if self.queue:
            data = self.get_queue_as_json()
            if self.contact_id and self.deal_id:
                contact = Contact.objects.get(id=self.contact_id)
                deal = Deal.objects.get(id=self.deal_id)
                callrecord = CallRecord(
                    contact = contact,
                    deal = deal,
                    transcript = data
                )
                callrecord.save()

                cleaned_conversation = clean_conversation(callrecord.transcript)
                summary = gpt_summarize(cleaned_conversation)
                to_do = generate_to_do(cleaned_conversation) 
                call_summary = CallSummary.objects.create(
                    text = summary,
                    to_do = to_do
                )
                callrecord.call_summary = call_summary
                callrecord.save()
            else:
                pass

    def send_transcription(self, event):
        text = event['text']
        voice_type = event['voice_type']

        
        sentiment_score, sentiment_magnitude, sentiment_annotation, sentence_annotations = self.analyze_sentiment(text)
   
        self.send(text_data=json.dumps({
            'transcription': text,
            'type': voice_type,
            'sentiment_score': sentiment_score,
            'sentiment_magnitude': sentiment_magnitude,
            'sentiment_annotation': sentiment_annotation,
            'sentence_annotations': sentence_annotations
        }))

        if not self.queue:
            self.queue.append({
                "type": "sales" if voice_type == 'out' else "client",
                "text": text
            })
        else:
            last_element = self.queue[-1]
            if last_element['type'] == ("sales" if voice_type == 'out' else "client"):
                last_element['text'] += " " + text
            else:
                self.queue.append({
                    "type": "sales" if voice_type == 'out' else "client",
                    "text": text
                })


class TranscriptionInBoundConsumer(JsonWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.transcription_data_consumer = TranscriptionDataConsumer()
        self.bridge = None
        
    def connect(self):
        self.accept()
        self.last_partial_text = "" 
        self.message_type = "out"
        self.send(text_data=json.dumps({
                'transcription': 'transcription'
            }))
        self.bridge = SpeechClientBridge(streaming_config, lambda response: on_transcription_response(response, self))
        t = threading.Thread(target=self.bridge.start)
        t.start()

    def disconnect(self, close_code):
        if self.bridge:
            self.bridge.terminate()
        self.transcription_data_consumer.disconnect(close_code)

    def receive(self, text_data):
        consume_stream(self, text_data)



class TranscriptionOutBoundConsumer(JsonWebsocketConsumer):
    def connect(self):
        self.accept()
        self.last_partial_text = "" 
        self.message_type = "in"
        self.send(text_data=json.dumps({
                'transcription': 'transcription'
            }))
        self.bridge = SpeechClientBridge(streaming_config, lambda response: on_transcription_response(response, self))
        t = threading.Thread(target=self.bridge.start)
        t.start()
        
    
    def disconnect(self, close_code):
        if self.bridge:
            self.bridge.terminate()
            # self.transcription_data_consumer.disconnect(close_code)

    def receive(self, text_data):
        consume_stream(self, text_data)
