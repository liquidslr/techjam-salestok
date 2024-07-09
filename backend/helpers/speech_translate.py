import queue
import json
import base64
from google.cloud import speech



class SpeechClientBridge:
    def __init__(self, streaming_config, on_response):
        self._on_response = on_response
        self._queue = queue.Queue()
        self._ended = False
        self.streaming_config = streaming_config

    def start(self):
        client = speech.SpeechClient()
        stream = self.generator()
        requests = (
            speech.StreamingRecognizeRequest(audio_content=content)
            for content in stream
        )
        responses = client.streaming_recognize(self.streaming_config, requests)
        self.process_responses_loop(responses)

    def terminate(self):
        self._ended = True

    def add_request(self, buffer):
        self._queue.put(bytes(buffer), block=False)

    def process_responses_loop(self, responses):
        for response in responses:
            self._on_response(response)

            if self._ended:
                break

    def generator(self):
        while not self._ended:
         
            chunk = self._queue.get()
            if chunk is None:
                return
            data = [chunk]

            while True:
                try:
                    chunk = self._queue.get(block=False)
                    if chunk is None:
                        return
                    data.append(chunk)
                except queue.Empty:
                    break

            yield b"".join(data)



def consume_stream(consumer, text_data):
  packet = json.loads(text_data)

  if packet['event'] == 'start':
      print('Streaming is starting')
      consumer.send(text_data=json.dumps({'message': 'Streaming is starting'}))
  elif packet['event'] == 'stop':
      print('\nStreaming has stopped')
      consumer.bridge.terminate()
      consumer.send(text_data=json.dumps({'message': 'Streaming has stopped'}))
  elif packet['event'] == 'media':
      try:
          media = packet["media"]
          chunk = base64.b64decode(media["payload"])
          consumer.bridge.add_request(chunk)
          text = None

      except Exception as e:
          print(f"Error processing media: {e}")
          consumer.send(text_data=json.dumps({'error': str(e)}))
            