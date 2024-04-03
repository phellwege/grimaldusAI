import react, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { Button, Card, Form } from 'react-bootstrap';
import LoadingPage from './loading/LoadingPage'
import React from 'react';

function App() {
  const [textInput, setTextInput] = useState(null)
  return (
    <>
    <LoadingPage />
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
                <Form.Label>Text Input</Form.Label>
                <Form.Control 
                as='textarea'
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                />
              </Form>
              <Button>Submit</Button>
            </div>
            <div className='cardRightDiv'>
              <Form>
                <Form.Group controlId="formFile" className="mb-3">
                  <Form.Label>Audio Input</Form.Label>
                  <Form.Control type="file" />
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
        
        </Card.Body>
      </Card>
    </div> 
    </>
  );
}

export default App;
