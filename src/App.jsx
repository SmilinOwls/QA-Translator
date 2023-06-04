import { useEffect, useRef, useState } from 'react'
import LanguageSelector from './components/Language/LanguageSelector';
import Progress from './components/Progress';
import ColorSchemeToggle from './components/ColorScheme/ColorScheme';
import LanguageList from './components/Language/LanguageList';
import QA from './QA';

// Bootstrap CSS
import "bootstrap/dist/css/bootstrap.min.css";
// Bootstrap Bundle JS
import "bootstrap/dist/js/bootstrap.bundle.min";
// Bootstrap icon
import "bootstrap-icons/font/bootstrap-icons.css";
// Import App Style
import './App.css';

function App() {

  // Model loading
  const [ready, setReady] = useState(null);
  const [disabled, setDisabled] = useState(false);
  const [progressItems, setProgressItems] = useState([]);

  // Inputs and outputs
  const [input, setInput] = useState('I love walking every day.');
  const [sourceLanguage, setSourceLanguage] = useState('eng_Latn');
  const [targetLanguage, setTargetLanguage] = useState('fra_Latn');
  const [output, setOutput] = useState('');
  const [inputTab, setInputTab] = useState([{ "English": "eng_Latn" }, { "French": "fra_Latn" }, { "Vietnamese": "vie_Latn" }]);
  const [outputTab, setOutputTab] = useState([{ "French": "fra_Latn" }, { "English": "eng_Latn" }, { "Vietnamese": "vie_Latn" }]);

  // Create a reference to the worker object.
  const worker = useRef(null);

  // We use the `useEffect` hook to setup the worker as soon as the `App` component is mounted.
  useEffect(() => {
    if (!worker.current) {
      // Create the worker if it does not yet exist.
      worker.current = new Worker(new URL('./worker.js', import.meta.url), {
        type: 'module'
      });
    }

    // Create a callback function for messages from the worker thread.
    const onMessageReceived = (e) => {
      switch (e.data.status) {
        case 'initiate':
          // Model file start load: add a new progress item to the list.
          setReady(false);
          setProgressItems(prev => [...prev, e.data]);
          break;

        case 'progress':
          // Model file progress: update one of the progress items.
          setProgressItems(
            prev => prev.map(item => {
              if (item.file === e.data.file) {
                return { ...item, progress: e.data.progress }
              }
              return item;
            })
          );
          break;

        case 'done':
          // Model file loaded: remove the progress item from the list.
          setProgressItems(
            prev => prev.filter(item => item.file !== e.data.file)
          );
          break;

        case 'ready':
          // Pipeline ready: the worker is ready to accept messages.
          setReady(true);
          break;

        case 'update':
          // Generation update: update the output text.
          setOutput(e.data.output);
          break;

        case 'complete':
          // Generation complete: re-enable the "Translate" button
          setDisabled(false);
          break;
      }
    };

    // Attach the callback function as an event listener.
    worker.current.addEventListener('message', onMessageReceived);

    // Define a cleanup function for when the component is unmounted.
    return () => worker.current.removeEventListener('message', onMessageReceived);
  });

  const translate = () => {
    setDisabled(true);
    worker.current.postMessage({
      text: input,
      src_lang: sourceLanguage,
      tgt_lang: targetLanguage,
    });
  }

  const handleCopy = (output, str) => {
    if (output !== "") navigator.clipboard.writeText(output);
    var tooltip = document.getElementById('myTooltip');
    tooltip.innerHTML = str;
  }


  const swapLanguage = () => {
    setSourceLanguage(targetLanguage);
    setTargetLanguage(sourceLanguage);
    const _in = { ...inputTab.filter((tab) => { return Object.values(tab)[0] == sourceLanguage; })[0]};
    const _out = { ...outputTab.filter((tab) => { return Object.values(tab)[0] == targetLanguage })[0]}
    const _in_key = Object.keys(_in)[0];
    const _out_key = Object.keys(_out)[0];
    const inChecked = inputTab.filter((tab) => { return Object.keys(tab)[0] == _out_key; });
    const outChecked = outputTab.filter((tab) => { return Object.keys(tab)[0] == _in_key });
    console.log(_in, _out);
    if (inChecked.length != 0 && outChecked.length != 0) return;
    else {
      
      if (inChecked.length == 0) {
        inputTab.shift();
        inputTab.unshift(_out);
      }

      if (outChecked.length == 0) {
        outputTab.shift();
        outputTab.unshift(_in);
      }
    }
  }

  return (
    <>
      <div className='container'>
        <h1>Q&A Integrated with Multiligual Translator (BETA)</h1>
        <ColorSchemeToggle></ColorSchemeToggle>
        <div className='language-container'>
          <LanguageSelector type={"Source"} tag={inputTab} language={sourceLanguage} setLanguage={setSourceLanguage} setTab={setInputTab} />
          <LanguageSelector type={"Target"} tag={outputTab} language={targetLanguage} setLanguage={setTargetLanguage} setTab={setOutputTab} />
        </div>

        <div className='textbox-container'>
          <div className="textarea-container">
            <LanguageList tab={inputTab} language={sourceLanguage} setLanguage={setSourceLanguage} />
            <textarea value={input} rows={3} onChange={e => setInput(e.target.value)} onKeyDown={(e) => e.target.style.height = e.target.scrollHeight + 'px'} autoFocus></textarea>
            <button type="button" className={input !== "" ? "btn-close" : "btn btn-default"} aria-label="Close" onClick={() => setInput("")}></button>
            <div className='textcount'><p>{input.length} / 5.000</p></div>
          </div>
          <div className="swap">
            <button className='btn btn-success' onClick={swapLanguage}>
              <i className="bi bi-arrow-left-right"></i>
            </button>
          </div>
          <div className="textarea-container">
            <LanguageList tab={outputTab} language={targetLanguage} setLanguage={setTargetLanguage} />
            <textarea value={output} rows={3} readOnly></textarea>
            <button className="btn copyable">
              <div className="tool-tip">
                <div className="tooltiptext" id='myTooltip'>Copy to clipboard</div>
                <div onClick={() => handleCopy(output, "Copied!")} onMouseOut={() => handleCopy("", "Copy to clipboard")}>
                  <i className="bi bi-clipboard"></i>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      <button disabled={disabled} className="btn btn-primary" onClick={translate}>Translate</button>

      <div className='progress-bars-container'>
        {ready === false && (
          <label>Loading models... (only run once)</label>
        )}
        {progressItems.map(data => (
          <div key={data.file}>
            <Progress text={data.file} percentage={data.progress} />
          </div>
        ))}
      </div>
      <QA passage={input}></QA>
    </>
  )
}

export default App