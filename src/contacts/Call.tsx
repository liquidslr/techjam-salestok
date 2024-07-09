import React, { useState, useEffect, useRef } from 'react';
import { Device } from 'twilio-client';
import { useParams, useSearchParams } from 'react-router-dom';

const MicrophoneControl = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const getMicrophone = async () => {
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        setStream(audioStream);
      } catch (err) {
        console.error('Error accessing microphone:', err);
      }
    };

    getMicrophone();
  }, []);

  const toggleMute = () => {
    if (stream) {
      stream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  return (
    <div>
      <button onClick={toggleMute}>{isMuted ? 'Unmute' : 'Mute'}</button>
    </div>
  );
};

const Call = () => {
  const [device, setDevice] = useState<Device | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('8035229496');
  const [isReady, setIsReady] = useState(false);
  const [inTranscription, setInTranscription] = useState('');
  const [outTranscription, setOutTranscription] = useState('');
  const [sentiment, setSentiment] = useState('');
  const [lang, setlang] = useState('');

  const [connected, setConnected] = useState(false);

  const websocketRef = useRef<WebSocket | any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const deal = searchParams.get('deal');

  const setupWebSocket = () => {
    if (websocketRef.current) {
      websocketRef.current.close();
    }
    websocketRef.current = new WebSocket(
      'ws://localhost:8000/ws/transcriptions/'
    );
    websocketRef.current.onopen = () => {
      if (websocketRef.current) {
        const msg = {
          contact_id: `${id}`,
          deal_id: deal,
        };
        websocketRef.current.send(JSON.stringify(msg));
      }
      console.log('WebSocket connection established');
      setlang('English');
    };
    websocketRef.current.onmessage = (e: any) => {
      const data = JSON.parse(e.data);
      if (data.message) {
        console.log(data.message);
      }
      if (data['is_connected']) {
        setConnected(true);
      }
      if (data.sentiment_annotation) {
        setSentiment(data.sentiment_annotation);
      }
      if (data.transcription) {
        // console.log(data['type'], data['type'] == 'out', 'typeeee');
        if (data['type'] == 'out') {
          // console.log(outTranscription.length, 'intranscription');
          setInTranscription((prev) => {
            return prev + data.transcription;
          });
          setOutTranscription(' ');
        } else {
          // console.log(inTranscription.length, 'intranscription');
          setOutTranscription((prev) => {
            return prev + data.transcription;
          });
          setInTranscription(' ');
        }
      }
    };
    websocketRef.current.onerror = (error: any) => {
      console.error('WebSocket error:', error);
      setConnected(false);
    };
    websocketRef.current.onclose = () => {
      console.log('WebSocket connection closed');
      setConnected(false);
    };
  };

  useEffect(() => {
    setupDevice();
    return () => {
      if (websocketRef.current) {
        websocketRef.current.close();
      }
    };
  }, []);

  const setupDevice = async () => {
    const response = await fetch(
      'http://localhost:8000/api/call/token/?identity=user'
    );
    const data = await response.json();

    const newDevice = new Device(data.token);
    newDevice.on('ready', () => {
      console.log('Twilio.Device is ready for calls');
      setIsReady(true);
    });

    newDevice.on('error', (error) => {
      console.error('Twilio.Device error:', error);
    });

    newDevice.on('incoming', (call) => {
      call.on('accept', () => {
        // Start transcription if needed
      });
    });

    setDevice(newDevice);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
    if (websocketRef.current) {
      websocketRef.current.close();
      websocketRef.current = null;
    }
  };

  const handleHangup = () => {
    if (device) {
      device.disconnectAll();
    } else {
      console.error('Device not set up.');
    }
  };

  const makeCall = () => {
    if (!websocketRef.current) {
      setupWebSocket();
    }

    if (device) {
      const call = device.connect({ To: phoneNumber });

      call.on('accept', () => {
        // startRecording();
        console.log('Call accepted and WebSocket is active');
      });

      call.on('disconnect', () => {
        console.log('Call disconnected');
        stopRecording();
        if (websocketRef.current) {
          websocketRef.current.close();
        }
      });
    } else {
      console.error('Device not set up.');
    }
  };

  const toTitleCase = (str: string) => {
    return str.replace(
      /\w\S*/g,
      (text) => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
    );
  };

  const getBackgroundColor = (sentiment: any) => {
    switch (sentiment.toLowerCase()) {
      case 'positive':
        return 'green';
      case 'negative':
        return 'red';
      case 'neutral':
        return 'grey';
      default:
        return 'transparent';
    }
  };
  const color = getBackgroundColor(sentiment);

  return (
    <div className="border p-4 shadow-lg">
      {/* <MicrophoneControl /> */}
      <div className="flex flex-row justify-between w-full">
        <div className="flex flex-col justify-center">
          <div className="text-md">
            <span className="font-semibold"> Voice Call</span>: +1{phoneNumber}
          </div>
          {lang && (
            <div>
              <span className="font-semibold"> Recommended Languag</span>:
              English
            </div>
          )}

          {sentiment && (
            <div className="text-black font-semibold">
              Sentiment:{' '}
              <span style={{ color: color }} className="font-semibold">
                {toTitleCase(sentiment)}
              </span>
            </div>
          )}
        </div>
        <div>
          <button
            onClick={makeCall}
            className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700"
          >
            Call
          </button>
          <button
            className="bg-red-500 text-white font-bold py-2 px-4 rounded m-4 hover:bg-red-700"
            onClick={handleHangup}
          >
            Hang Up
          </button>
        </div>
      </div>
      {connected && (
        <div className="flex items-center">
          <div className="h-3 w-3 rounded-full bg-[#56F000]" />
          <div className="mx-2 text-sm">Connected</div>
        </div>
      )}

      <div className="h-auto w-full">
        <div className="bg-white w-full rounded-lg flex flex-col overflow-hidden">
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {inTranscription && (
              <div className="flex items-start space-x-2">
                <div className="bg-gray-200 p-3 rounded-lg">
                  <p>{inTranscription}</p>
                </div>
              </div>
            )}
            {outTranscription && (
              <div className="flex items-end justify-end space-x-2">
                <div className="bg-blue-500 text-white p-3 rounded-lg">
                  <p>{outTranscription}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Call;
