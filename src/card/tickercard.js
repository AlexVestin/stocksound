import React from 'react';
import {Card, CardActions, CardHeader, CardText} from 'material-ui/Card';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import CircularProgress from 'material-ui/CircularProgress';

import Graph from './graph'
import {getText} from '../util/networking'
import {generateTimeStamps, parseResponse, setTimeInterval, parseClose} from '../util/parseutil'
export default class TickerCard extends React.Component {
  
  constructor(props) {
    super(props);
    this.stop = this.stop.bind(this)
    this.play = this.play.bind(this)
    this.dateButtonClicked = this.dateButtonClicked.bind(this)

    this.state = {
      expanded: false,       
      timeIntervalIndex: 0, 
      data: [], 
      timeStamps: [],
      prcChange: 0,
      fetching: false
    };
  
    this.multiplier = 250
    this.gran = "300"
    this.timeInterval = "1d"
    this.lastClose = -1
    this.notes = []
    
    this.priceData = []
    this.timeStamps = []
    this.URL = "https://hidden-island-42423.herokuapp.com/api/"+props.ticker+"&x="+props.x+"&f=d,o"
  }

  componentDidMount = (props) => {
    this.setState({fetching:true})
    
    this.getlastClose()
    getText(this.URL +"&i=300&p=1d", this.parseResponse, this.handleRequestError)  
  }

  parseResponse = (response) => {
    //Makeshift error handling
    if(response.toUpperCase().includes("SORRY")) {
      this.handleRequestError("Request for stock prices was not allowed. See issue #1 on Github for more info.")
      this.setState({fetching: false})
      return;
    }

    let data = parseResponse(response, this.timeInterval, this.gran)
    this.priceData = data[0]
    this.timeStamps = data[1]
    this.open = this.priceData[0]
    
    /*
    if(this.timeInterval === "1d" && this.lastClose !== -1){
        let prc = (this.open - this.lastClose) / this.lastClose 
        this.setState({prcChange: -prc})
    }
    */

    this.timeStamps = generateTimeStamps(this.timeStamps, this.timeInterval)
    this.generateNotes()
    this.setState({fetching: false})
  }

  handleRequestError = (err) => {
    this.props.handleRequestError(err)
  }

  parseCloseRequest = (response) => {
    let lc = parseClose(response)
    if(lc !== undefined)
      [this.lastDate, this.lastClose] = lc

  } 

  getlastClose = () => {
    const { x, ticker } = this.props
    let url = "https://hidden-island-42423.herokuapp.com/api/"+ticker+"&x="+x+"&f=d,c&i=23400&p=2d"
    getText(url, this.parseCloseRequest, this.handleRequestError)
}
  generateNotes() {
      this.notes = []
      let open = this.open
      /*
      if(this.timeInterval === "1d" && this.lastClose !== -1)
        open = this.lastClose
      */

      this.priceData.forEach(val => {
          let idx = Math.floor(((val-open) / open) * this.multiplier)

          //Clamp as not to go above/below available notes 
          if(idx > 60)idx=60
          if(idx < -60)idx=-60
          this.notes.push(idx)
      });

  }
  addData(i){
    let open = this.open
    /*
    if(this.timeInterval === "1d"  && this.lastClose !== -1)
      open = this.lastClose
    */
    let prc = (open - this.priceData[i]) / open;

    this.setState({
      prcChange: prc,
      timeStamps: [...this.state.timeStamps, this.timeStamps[i]]},
      () =>{ this.setState({data: [...this.state.data, Number(this.priceData[i])]})})
  }

  handleExpandChange = (expanded) => {
    if(!expanded)
      this.stop()
    this.setState({expanded: expanded});
  };

  clearData(){
    let prc = 0          
    this.setState({data: [], timeStamps: [], prcChange: -prc})
  }

  stop(){
    this.setState({prcChange: 0})
    this.props.stop(this.props.ticker)
  }

  play(){
    this.props.play(this.notes, this.props.ticker)
    this.setState({expanded: true})
  }

  dateButtonClicked(value) {
    [this.gran, this.timeInterval, this.multiplier] = setTimeInterval(value)
    this.stop()
    getText(this.URL + "&i="+this.gran+"&p="+this.timeInterval, this.parseResponse, this.handleRequestError)
    this.setState({fetching:true, timeIntervalIndex: value})
  }
  
  render() {
    const style = {minWidth:"40px" }
    return (
      <Card 
        expanded={this.state.expanded}
        onExpandChange={this.handleExpandChange}
      >
        <CardHeader
            title={"$" + this.props.ticker}
            subtitle={this.props.name}
            actAsExpander={true}
            showExpandableButton={true}
        />
        <CardActions>
          <RaisedButton label="Play" onClick={this.play} />
          <RaisedButton label="Stop" onClick={this.stop}/>

          
          {this.state.expanded &&
            <div style={{float: "right"}}>
            <b 
              style={{color: this.state.prcChange > 0 ? "red":"green", marginTop: "12px"}}
            >{String(-this.state.prcChange*100).substring(0, 5)+ "%"}
            </b>
            </div>
          }
          {this.state.fetching && <CircularProgress style={{position: "absolute", marginTop: 3}} size={30} thickness={3} />}
        </CardActions>
        <CardText expandable={true} >
          <Graph className="card-graph" data={this.state.data} timeStamps={this.state.timeStamps}></Graph>
          <div className="card-toolbar-wrapper">
              <div className="card-toolbar-text">
                {"Note amplitude: x" + this.multiplier}
              </div>
              <div className="date-button-group">         
                <FlatButton style={style} primary={this.state.timeIntervalIndex === 0} onClick={() => this.dateButtonClicked(0)}>1d</FlatButton>
                <FlatButton style={style} primary={this.state.timeIntervalIndex === 1} onClick={() => this.dateButtonClicked(1)}>1w</FlatButton>
                <FlatButton style={style} primary={this.state.timeIntervalIndex === 2} onClick={() => this.dateButtonClicked(2)}>1m</FlatButton>
                <FlatButton style={style} primary={this.state.timeIntervalIndex === 3} onClick={() => this.dateButtonClicked(3)}>3m</FlatButton>
                <FlatButton style={style} primary={this.state.timeIntervalIndex === 4} onClick={() => this.dateButtonClicked(4)}>1y</FlatButton>
              </div>
          </div>
      </CardText>
    </Card>
    );
  }
}

  
