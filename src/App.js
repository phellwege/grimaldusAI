import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { Button, Card, Form } from 'react-bootstrap';
import LoadingPage from './loading/LoadingPage'
import OpenAI from 'openai';

import { FaMicrophone } from "react-icons/fa";
import { ImCancelCircle } from "react-icons/im";

function App() {
  const openai = new OpenAI({apiKey:`${process.env.REACT_APP_GRIMALDUS_API_KEY}`, dangerouslyAllowBrowser: true})
  const tts_url = `https://api.elevenlabs.io/v1/text-to-speech/${process.env.REACT_APP_VOICE_ID}/stream`;
  const [loading, setLoading] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [gptGeneratedResponse, setGptGeneratedResponse] = useState(null);

  const [recording, setRecording] = useState(false);
  let recognition = null;
  const handleListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition ||
      window.mozSpeechRecognition ||
      window.msSpeechRecognition;
  
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
  
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setTextInput(transcript);
      };
  
      if (!recording) {
        recognition.start();
        setRecording(true);
      } else {
        recognition.stop();
        setRecording(false);
      }
    }
  };

  const handleSubmitText = async (e) => {
    e.preventDefault();
    if(textInput.length < 1) {
      return
    }
    try {
      setLoading(true);
      await generateGPTResponse(textInput)
    } catch (error) {
      console.error(error)
    }
  };
  // this is the brain of Grimaldus
  const generateGPTResponse = async (textInput) => {
    try {
      const gptResponse = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
            {
                role: 'system',
                content: `
                Reply to this as Grimaldus, the Reclusiarch of the Black Templars Chapter from Warhammer 40k. Speak in his authoritative and fervent tone, demonstrating his unwavering dedication to the Emperor and the righteous fury of the Black Templars. Keep your response to a single paragraph.
                `
            },
            {
                role: 'user',
                content: `
                    ${textInput}.
                `
            }
        ],
        temperature: 0.6,
        max_tokens: 1000,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        stop: "{}",
    });
    setLoading(false);
    setGptGeneratedResponse(gptResponse.choices[0].message.content);
    } catch (error) {
      console.error(error)
    }
  };

  // download
  const handleTheVoiceOfGrimaldusDownload = () => {
    if (!gptGeneratedResponse) {
      console.error('No generated response to convert to speech');
      return;
    }
    setLoading(true)
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': `${process.env.REACT_APP_XI_API_KEY}`
      },
      body: JSON.stringify({
        "model_id": "eleven_multilingual_v2",
        "text": gptGeneratedResponse,
        "voice_settings": {
          "stability": 0.5,
          "similarity_boost": 0.75,
          "style": 0.0,
          "use_speaker_boost": true
        }
      })
    };
  
    fetch(tts_url, options)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.blob();
    })
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'output.mp3');
      document.body.appendChild(link);
      link.click();
      setLoading(false)
    })
    .catch(error => {
      console.error('Error:', error);
    });
  };

  // playback
  const handleTheVoiceOfGrimaldus = () => {
    if (!gptGeneratedResponse) {
      console.error('No generated response to convert to speech');
      return;
    }
    setLoading(true)
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': `${process.env.REACT_APP_XI_API_KEY}`
      },
      body: JSON.stringify({
        "model_id": "eleven_multilingual_v2",
        "text": gptGeneratedResponse,
        "voice_settings": {
          "stability": 0.5,
          "similarity_boost": 0.75,
          "style": 0.0,
          "use_speaker_boost": true
        },
        "output_format": "mp3_44100_192" 
      })
    };
  
    fetch(tts_url, options)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.blob();
      })
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const audioElement = new Audio(url);
        setLoading(false)
        audioElement.play().catch(error => {
          console.error('Error playing audio:', error);
        });
      })
      .catch(error => {
        console.error('Error:', error);
      });
  };
  

  return (
    <>
    {loading && (
      <LoadingPage />
    )}
    <div className='pageWrapper'>
      <h1>Grimaldus AI</h1>
      <Card className='inputAndOutputCard'>
        <Card.Header>
          Input choices
        </Card.Header>
        <Card.Body>
          <div className='cardInnerDiv'>
            <div className='cardLeftDiv'>
              <Form>
                <Form.Label>
                  Text Input {textInput.length}/500
                  </Form.Label>
                <Form.Control 
                as='textarea'
                maxLength={500}
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                />
              </Form>
              <Button 
              onClick={(e) => 
              handleSubmitText(e)
              }
              >
                Submit
              </Button>
            </div>
            {/* user audio input */}
            <div className='cardRightDiv'>
              <div>
                <div 
                className='micDiv'
                >
                  {!recording ? (
                    <FaMicrophone 
                    size={50} 
                    className='micIcon'
                    onClick={() => {handleListening()}}
                    />
                  ) : (
                    <ImCancelCircle 
                    size={50} 
                    className='cancelIcon'
                    onClick={() => {handleListening()}}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>
      <Card className='inputAndOutputCard'>
        <Card.Header>
          Response
        </Card.Header>
        <Card.Body>
        {gptGeneratedResponse && (
          <>
          <h5>Grimaldus</h5>
          {gptGeneratedResponse}
          <br/>
          <div className='cardButtonGroup'>
            <Button onClick={handleTheVoiceOfGrimaldus}>
              Hear Me!
            </Button>
            <Button onClick={handleTheVoiceOfGrimaldusDownload}>
              Download My Holy Words
            </Button>
          </div>
          </>
          )}
        </Card.Body>
      </Card>
    </div> 
    </>
  );
}

export default App;
