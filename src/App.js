import React, {useState, useEffect} from 'react';
import './App.scss';

const beep = require("./beep.wav");

function App() {
  const SESSION = "Session";
  const BREAK = "Break";
  const [state, setState] = useState({
    breakLength: 5,
    sessionLength: 25,
    label: SESSION,
    isRunning: false,
    timeLeft: 1500,
    timoutId: ''
  });
  const [timestamp, setTimestamp] = useState({past: Date.now(), now: Date.now()});

  const clampLength = (length) => (length > 0 && length <= 60);

  const incBreakLength = () => {
    if (!state.isRunning && clampLength(state.breakLength + 1)) {
      setState(state => ({
        breakLength: state.breakLength + 1,
        sessionLength: state.sessionLength,
        label: state.label,
        isRunning: state.isRunning,
        timeLeft: state.timeLeft,
        timeoutId: state.timeoutId
      }));
    }
  };

  const decBreakLength = () => {
    if (!state.isRunning && clampLength(state.breakLength - 1)) {
      setState(state => ({
        breakLength: state.breakLength - 1,
        sessionLength: state.sessionLength,
        label: state.label,
        isRunning: state.isRunning,
        timeLeft: state.timeLeft,
        timeoutId: state.timeoutId
      }))
    }
  };

  const incSessionLength = () => {
    if (!state.isRunning && clampLength(state.sessionLength + 1)) {
      setState(state => {
        let timeLeft = state.timeLeft;
        if (!state.isRunning) {
          timeLeft = (state.sessionLength + 1) * 60;
        }

        return {
          breakLength: state.breakLength,
          sessionLength: state.sessionLength + 1,
          label: state.label,
          isRunning: state.isRunning,
          timeLeft: timeLeft,
          timeoutId: state.timeoutId
        };
      });
    }
  };

  const decSessionLength = () => {
    if (!state.isRunning && clampLength(state.sessionLength - 1)) {
      setState(state => {
        let timeLeft = state.timeLeft;
        if (!state.isRunning) {
          timeLeft = (state.sessionLength - 1) * 60;
        }

        return {
          breakLength: state.breakLength,
          sessionLength: state.sessionLength - 1,
          label: state.label,
          isRunning: state.isRunning,
          timeLeft: timeLeft,
          timeoutId: state.timeoutId
        };
      });
    }
  };

  useEffect(() => {
    if (state.isRunning && Date.now() - timestamp.past >= 1000) {
      setTimestamp({past: Date.now(), now: Date.now()});

      let timeoutId = setTimeout(() => setTimestamp(timestamp => ({past: timestamp.past, now: Date.now()})), 1000);

      let timeLeft = state.timeLeft;
      let label = state.label;

      if (timeLeft - 1 === 0) {
        if (state.label === SESSION) {
          label = BREAK;
        } else if (state.label === BREAK) {
          label = SESSION;
        }
        document.getElementById("beep").play();
      }

      if (timeLeft === 0) {
        if (state.label === SESSION) {
          timeLeft = state.sessionLength * 60;
        } else if (state.label === BREAK) {
          timeLeft = state.breakLength * 60;
        }
      } else {
        timeLeft--;
      }

      setState(state => {
        return {
          breakLength: state.breakLength,
          sessionLength: state.sessionLength,
          label: label,
          isRunning: state.isRunning,
          timeLeft: timeLeft,
          timeoutId: timeoutId
        };
      });
    } else if (state.isRunning) {
      setTimeout(() => setTimestamp(timestamp => ({past: timestamp.past, now: Date.now()})), 1000);
    }
  }, [state, timestamp]);

  const handleStartStopClick = () => {
    if (state.isRunning) {
      clearTimeout(state.timeoutId);
      setState(state => ({
        breakLength: state.breakLength,
        sessionLength: state.sessionLength,
        label: SESSION,
        isRunning: false,
        timeLeft: state.timeLeft,
        timeoutId: ''
      }));
    } else {
      setTimestamp(timestamp => ({past: Date.now(), now: Date.now()}));
      setState(state => ({
        breakLength: state.breakLength,
        sessionLength: state.sessionLength,
        label: state.label,
        isRunning: true,
        timeLeft: state.timeLeft,
        timeoutId: state.timeoutId
      }));
    }
  };

  const handleResetclick = () => {
    clearTimeout(state.timeoutId);
    const beeper = document.getElementById("beep");
    beeper.pause();
    beeper.currentTime = 0;

    setState(state => ({
      breakLength: 5,
      sessionLength: 25,
      label: SESSION,
      isRunning: false,
      timeLeft: 1500,
      timeoutId: ''
    }));
  };

  const getMinutes = () => Math.floor(state.timeLeft / 60);

  const getSeconds = () => state.timeLeft % 60;

  const format2Digits = (value) => ("0" + value).slice(-2);

  return (<div className="container-fluid h-100 d-flex flex-column
   justify-content-center">
    <div className="row">
      <div className="col-md-8 h1 text-white d-flex flex-column
        justify-content-center align-items-center">
        <h1 id="timer-label" className="border border-white">{state.label}</h1>
        <div id="time-left">{`${format2Digits(getMinutes())}:${format2Digits(getSeconds())}`}</div>
        <audio id="beep">
          <source src={beep} type="audio/wav"/>
        </audio>
        <div className="d-flex flex-row px-5 py-1 border border-white">
          <button id="start_stop" className="control-btns" onClick={handleStartStopClick}>{
              state.isRunning
                ? <i className="fa fa-pause"></i>
                : <i className="fa fa-play"></i>
            }</button>
          <button id="reset" className="control-btns" onClick={handleResetclick}>
            <i className="fa fa-refresh"></i>
          </button>
        </div>
      </div>
      <div className="col-md-4 text-white d-flex flex-column align-items-center
        mt-5">
        <h2 id="break-label">Break Length</h2>
        <div className="d-flex flex-row justify-content-center align-items-center">
          <button id="break-decrement" className="control-btns" onClick={decBreakLength}>
            <i className="fa fa-minus"></i>
          </button>
          <span id="break-length" className="length-value">{state.breakLength}</span>
          <button id="break-increment" className="control-btns" onClick={incBreakLength}>
            <i className="fa fa-plus"></i>
          </button>
        </div>
        <h2 id="session-label" className="mt-5">Session Length</h2>
        <div className="d-flex flex-row justify-content-center align-items-center">
          <button id="session-decrement" className="control-btns" onClick={decSessionLength}>
            <i className="fa fa-minus"></i>
          </button>
          <span id="session-length" className="length-value">{state.sessionLength}</span>
          <button id="session-increment" className="control-btns" onClick={incSessionLength}>
            <i className="fa fa-plus"></i>
          </button>
        </div>
      </div>
    </div>
  </div>);
}

export default App;
