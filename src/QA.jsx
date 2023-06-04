import { useEffect, useState } from 'react'

// install dependencies
import * as tf from "@tensorflow/tfjs";
import * as qna from "@tensorflow-models/qna";
import { Rings } from "react-loader-spinner";
import { Fragment } from 'react';

function QA({ passage }) {
  // initialize instances and references with state hooks
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState([]);
  const [model, setModel] = useState(null);

  // load Tensorflow model

  const loadModel = async () => {
    const model = await qna.load();
    setModel(model);
  }

  // handle question
  const handleAnswer = async (e) => {
    if (!model || e.which == 13) return;
    setQuestion(e.target.value);
    const answer = await model.findAnswers(question, passage);
    setAnswer(answer);
  }

  useEffect(() => { loadModel() }, [])

  // set up question (input) and answer (output)
  return (
    <div className='App'>
      <header className='App-header'>
        {(model === null) ?
          <div className='d-flex flex-column align-items-center'>
            <h2>Please wait for model loading!</h2>
            <Rings
              type="Puff"
              color="#00BFFF"
              height={50}
              width={50}
            ></Rings>
          </div>
          :
          <Fragment>
            Ask a Question (<b>English</b> Only) <input value={question} size={80} onChange={handleAnswer}></input><br />
            Answers {answer ? answer.map((ans, idx) => <div>Answer {idx + 1}: {ans.text} ({ans.score})</div>) : ""}
          </Fragment>
        }
      </header>
    </div>
  )
}

export default QA