import React from 'react'
import Typewriter from 'typewriter-effect';
import Servo from '../static/servo.gif'
import './loadingPage.css'
export default function LoadingPage() {
  return (
    <div className='loadingPageWrapper'>
        <h1>Cogitating</h1>
        <div>
        <img src={Servo} alt='a gif of a servoskull' id='loadingGif'/>
            <Typewriter
            options={{
                strings: [
                  'Incoming vox transmission from Inquisitorial command. Priority clearance required for decryption. Initiating secure channel.',
                  'Critical system failure in progress. Attempting to reroute power and restore functionality. Standby for updates.', 
                  'Data analysis indicates potential heretical activity within local population. Recommending deployment of Adeptus Arbites for investigation and enforcement.'
                ],
                autoStart: true,
                loop: true,
            }}
            />
        </div>
    </div>
  )
}