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
  const [audioFile, setAudioFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [whisperTranscription, setWhisperTranscription] = useState(null)
  const [gptGeneratedResponse, setGptGeneratedResponse] = useState(null);


  const [recording, setRecording] = useState(false)

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
  // this is the brain of grimaldus
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
        "output_format": "mp3_44100_64" 
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
  
  
  // audio ingestion file blocked by cors
  // const handleFileChange = (event) => {
  //   setAudioFile(event.target.files[0]);
  // };
  // const handleTranscription = async () => {
  //   if (!audioFile) return;

  //   setLoading(true);
  //   try {
  //     const formData = new FormData();
  //     formData.append('audio', audioFile);

  //     const response = await fetch('https://api.openai.com/v1/speech/transcribe', {
  //       method: 'POST',
  //       headers: {
  //         Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
  //       },
  //       body: formData,
  //     });

  //     if (!response.ok) {
  //       throw new Error('Failed to transcribe audio');
  //     }

  //     const data = await response.json();
  //     setTextInput(data.transcription);
  //     generateGPTResponse()
  //     // setTranscription('');
  //   } catch (error) {
  //     console.error('Error transcribing audio:', error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

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
            
            {/* <div className='cardRightDiv'> */}
              {/* <Form>
                <Form.Group controlId="formFile" className="mb-3">
                  <Form.Label>Audio Input</Form.Label>
                  <Form.Control 
                  type="file"
                  accept='audio/*'
                  onChange={handleFileChange}
                  />
                  <Form.Text>File uploads are currently limited to 25 MB and the following input file types are supported: mp3, mp4, mpeg, mpga, m4a, wav, and webm.</Form.Text>
                </Form.Group>
              </Form> */}

              {/* <div>
                <h5>Or Try</h5>
                <div 
                className='micDiv'
                onClick={() => setRecording(true)}
                >
                  {!recording ? (
                    <FaMicrophone size={50} className='micIcon'/>
                  ) : (
                    <ImCancelCircle size={50} className='cancelIcon'/>
                  )}
                </div>
              </div> */}
              {/* <Button onClick={handleTranscription}>Submit</Button>
            </div> */}
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
