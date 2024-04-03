import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { Button, Card, Form } from 'react-bootstrap';
import LoadingPage from './loading/LoadingPage'
import OpenAI from 'openai';

function App() {
  const openai = new OpenAI({apiKey:`${process.env.REACT_APP_GRIMALDUS_API_KEY}`, dangerouslyAllowBrowser: true})
  const [loading, setLoading] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [audioFileInput, setAudioFileInput] = useState(null);
  const [finalText, setFinalText] = useState(null);

  const [whisperTranscription, setWhisperTranscription] = useState(null)
  const [gptGeneratedResponse, setGptGeneratedResponse] = useState(null);

  const handleSubmitText = async (e) => {
    e.preventDefault();
    if(textInput.length < 1) {
      return
    }
    try {
      setLoading(true);
      setFinalText(textInput);
      await generateGPTResponse(finalText)
    } catch (error) {
      console.error(error)
    }
  };
  // this is the brain of grimaldus
  const generateGPTResponse = async (finalText) => {
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
                    ${finalText}.
                `
            }
        ],
        temperature: 0.7,
        max_tokens: 500,
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
              <Button onClick={(e) => handleSubmitText(e)}>Submit</Button>
            </div>
            <div className='cardRightDiv'>
              <Form>
                <Form.Group controlId="formFile" className="mb-3">
                  <Form.Label>Audio Input</Form.Label>
                  <Form.Control 
                  type="file"
                  accept='audio/*'
                  />
                  <Form.Text>File uploads are currently limited to 25 MB and the following input file types are supported: mp3, mp4, mpeg, mpga, m4a, wav, and webm.</Form.Text>
                </Form.Group>
              </Form>
              <Button>Submit</Button>
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
          </>
          )}
        </Card.Body>
      </Card>
    </div> 
    </>
  );
}

export default App;
