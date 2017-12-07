import React from 'react'
import * as ObjectModel from './ObjectModel.js';
import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom'

const Home = () => (
  <div>
    <h2>Home</h2>
  </div>
)

const About = () => (
  <div>
    <h2>About</h2>
  </div>
)

class Topics extends React.Component {

  render() {

    var indents = [];
    for (var i = 0; i < this.props.sensors.length; i++) {
      let item = this.props.sensors[i];
      indents.push(<li key={item._id}><Link to={`/topics/` + item._id}>{item._name}</Link></li>);
    }

    return (
      <div class="wrapper">
        <ul class="sensors">
          {indents}
        </ul>
        
        <Route path="/topics/:topicId" component={ (props) => <Sensor {...props} sensors={this.props.sensors} />}/>
         
        <Route exact path={`/topics`} render={() => (
          <h3>Please select a topic.</h3>
        )}/>
      </div>
    )
  }
}

class BasicExample extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      sensors:[]
    }
    let gestionSensor = new GestionSensor();
    gestionSensor.onSensor = (sensor) => {
      let newSensors = gestionSensor.sensors.slice(0);

      this.setState({sensors: newSensors})
    }
  }
  render() {
    return (
      <Router>
        <div>
          <ul class="nav">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/topics">Topics</Link></li>
          </ul>

          <hr/>

          <Route exact path="/" component={Home}/>
          <Route path="/about" component={About}/>
          <Route path="/topics" component={ () => <Topics sensors={this.state.sensors} />} />
            
        </div>
      </Router>
    )
  }
}
export default BasicExample

class Sensor extends React.Component {

  render() {
    let sensor = this.props.sensors[this.props.match.params.topicId];

    let values = [];
    if(sensor._data.values !== undefined){ 
      
      for (var i = 0; i < sensor._data.values.length; i++) {
        values.push(<li key={i}><span>{sensor._data.values[i]}</span></li>);
      }
    }

    return (
      <div class="sensor">
        <strong>Sensor name : {sensor._name} </strong>
        <p>Current value : {sensor._data.curval()}</p>
        <div class="historique">{values.reverse()}</div>
      </div>
    );
  }
}

class GestionSensor {
  constructor() {
    this.sensors = [];

    // Create a WebSocket connection to the server
    const ws = new WebSocket("ws://" + window.location.host+ "/socket");

    // We get notified once connected to the server
    ws.onopen = (event) => {
      console.log("We are connected.");
    };

    // Listen to messages coming from the server. When it happens, create a new <li> and append it to the DOM.
    ws.onmessage = (event) => {  
      // Sensors
      let m = JSON.parse(event.data);
      if(this.containsName(this.sensors, m.topic) < 0){
          // add sensor to the list
          switch(m.message.type) {
              case "TEMPERATURE" : 
              this.sensors.push(new ObjectModel.Temperature(Object.keys(this.sensors).length, m.topic, new ObjectModel.TimeSeries([m.message.value],[Date.now()])));
              break;
              case "PERCENT" :
              this.sensors.push(new ObjectModel.Sensor(Object.keys(this.sensors).length, m.topic, new ObjectModel.TimeSeries([m.message.value],[Date.now()]), m.message.type));
              break;
              default:
              this.sensors.push(new ObjectModel.Sensor(Object.keys(this.sensors).length, m.topic, new ObjectModel.Datum(m.message.value), m.message.type));
              break;
          }
      } else {
        switch(m.message.type) {
          case "TEMPERATURE" : case "PERCENT" :
          this.sensors[this.containsName(this.sensors, m.topic)]._data.push(m.message.value,Date.now());
          break;
          default:
          this.sensors[this.containsName(this.sensors, m.topic)]._data.value = m.message.value;
          break;
        }
      }
      this.onSensor();
    };
  }
  
  containsName(array, name) {
    var contains = -1;    
    array.forEach(element => {
      if(element._name === name)
        contains = array.indexOf(element);
    });
    return contains;
  };

  sensors() { return this.sensors.slice(0);}

  onSensor() {}

}