import React, { Component } from 'react'
import Dropzone from 'react-dropzone'
import mammoth from 'mammoth'
import axios from 'axios'
import './App.css'
import JSONTree from 'react-json-tree'
import Dropdown from 'react-dropdown'
import 'react-dropdown/style.css'

let url = `https://unga.mido.io/enhancer/chain`
const headers = {
  Accept: 'application/json',
  'Content-type': 'text/plain',
}

const outputOptions = [
  { value: 'application/json', label: 'JSON-LD' },
  { value: 'application/rdf+xml', label: 'RDF/XML' },
  { value: 'application/rdf+json', label: 'RDF/JSON' },
  { value: 'text/turtle', label: 'Turtle' },
  { value: 'text/rdf+nt', label: 'N-TRIPLES' },
]

const chains = [
  { value: `${url}/undo-plain`, label: 'Plain' },
  { value: `${url}/undo+dbpedia-proper-noun`, label: 'Proper Noun' },
  { value: `${url}/undo+dbpedia-named-entity-linking`, label: 'Named Entity Linking' },
  { value: `${url}/undo+dbpedia-fst-linking`, label: 'FST Linking' },
  { value: `${url}/undo+dbpedia-disambiguation`, label: 'Disambiguation' },
]

const defOutOptions = outputOptions[0];
const defChain = chains[0];


class App extends Component {
  render() {
    return (
      <div className='App'>
        <div className='App-body'>
          <h1>Wrapped stanbol</h1>
          <MyDropzone />
        </div>
      </div>
    );
  }
}

export default App;

class MyDropzone extends Component {

  constructor(props) {
    super(props);
    this.state = {
      data: null,
      outputFormat: defOutOptions.value,
    }
  }

  async onFileRead(arrayBuffer, fileName) {
    const { value: fileText } = await mammoth.extractRawText({ arrayBuffer })
    this.setState({ fileText, fileName })
  }

  async fetchData(){
    const { fileText } = this.state

    const { data } = await axios({
      headers,
      url,
      method: 'post',
      data: fileText,
    })

    this.setState({data})
  }

  getDocData(acceptedFiles) {
    const reader = new FileReader();
    reader.readAsArrayBuffer(acceptedFiles[0])
    const fileName = acceptedFiles[0].name
    reader.onload = ({ target: { result: arrayBuffer } }) => {
      this.onFileRead(arrayBuffer, fileName)
    } 
  }

  outputSelect({value}) {
    this.setState({outputFormat: value})
    
  }

  render() {
    const { data, fileName} = this.state
    let onFileName
    const jsonData = typeof data === 'object' ? JSON.stringify(data, null, 2) : data

    const onData = (
      <div>
        {headers.Accept.includes('json') && (<div>

        <h2>Enhanced data: </h2>
        <JSONTree data={data} theme={theme} invertTheme={false} hideRoot={true}/>
        </div>)}
        <h3>Raw output: </h3>
        <textarea className='rawDataArea' value={jsonData}></textarea>
      </div>)

    if (fileName) {
      onFileName = (
        <div>Selected file: {fileName}</div>
      )
    }
    return (
      <div>
        <Dropzone onDrop={acceptedFiles => this.getDocData(acceptedFiles)}>
          {({ getRootProps, getInputProps }) => (
            <section>
              <div {...getRootProps()}>
                <input {...getInputProps()} />
                <p>Drag 'n' drop docx file here, or click to select a file</p>
              </div>
              {fileName && onFileName}
            </section>
          )}
        </Dropzone>

        <div>
          <div>Enhancer chain: <Dropdown options={chains} onChange={({value}) => url = value} value={defChain} placeholder="Select an enchancer chain" /></div>
          <div>Output format: <Dropdown options={outputOptions} onChange={({ value }) => headers.Accept = value } value={defOutOptions} placeholder="Select an output format" /></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>

          <div><button onClick={() => this.fetchData()} disabled={!fileName}> Get Enhanced data</button></div>
        </div>
        <div>
          {data && onData}
        </div>
      </div>
    );
  }
}

const theme = {
  scheme: 'monokai',
  author: 'wimer hazenberg (http://www.monokai.nl)',
  base00: '#272822',
  base01: '#383830',
  base02: '#49483e',
  base03: '#75715e',
  base04: '#a59f85',
  base05: '#f8f8f2',
  base06: '#f5f4f1',
  base07: '#f9f8f5',
  base08: '#f92672',
  base09: '#fd971f',
  base0A: '#f4bf75',
  base0B: '#a6e22e',
  base0C: '#a1efe4',
  base0D: '#66d9ef',
  base0E: '#ae81ff',
  base0F: '#cc6633'
};
