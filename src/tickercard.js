import React from 'react';
import {Card, CardActions, CardHeader, CardText} from 'material-ui/Card';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import Graph from './graph'
import Snackbar from 'material-ui/Snackbar';
import {getText} from './networking'
import {generateTimeStamps, parseResponse, setTimeInterval} from './parseutil'
export default class TickerCard extends React.Component {
  
  constructor(props) {
    super(props);
    this.stop = this.stop.bind(this)
    this.play = this.play.bind(this)
    this.dateButtonClicked = this.dateButtonClicked.bind(this)

    this.state = {
      expanded: false,       
      date: 0, 
      data: [], 
      timeStamps: [],
      prcChange: 0,
      displayError: false
    };
  
    this.multiplier = 300
    this.gran = "300"
    this.timeInterval = "1d"
    this.lastClose = -1
    this.notes = []
    
    this.priceData = []
    this.timeStamps = []
    this.URL = "https://hidden-island-42423.herokuapp.com/api/"+props.ticker+"&x="+props.x+"&f=d,o"
    this.errorMessage = "Something went wrong"
  }

  componentDidMount = (props) => {
    this.getlastClose()
    getText(this.URL +"&i=300&p=1d", this.parseResponse, this.handleRequestError)  
  }

  parseResponse = (response) => {
    let data = parseResponse(response, this.timeInterval, this.gran)
    this.priceData = data[0]
    this.timeStamps = data[1]
    this.open = this.priceData[0]
    
    if(this.timeInterval === "1d" && this.lastClose !== -1){
        let prc = (this.open - this.lastClose) / this.lastClose 
        this.setState({prcChange: -prc})
    }else if(this.timeInterval === "3M" || this.timeInterval === "1Y"){
      this.timeStamps.push(this.lastDate)
      this.priceData.push(String(this.lastClose))
    }

    this.timeStamps = generateTimeStamps(this.timeStamps, this.timeInterval)
    this.generateNotes()
    this.setState({fetching:false})
  }

  handleRequestError = (err) => {
      this.errorMessage = err;
      this.setState({displayError: true})
  }

  parseCloseRequest = (response) => {
      let today = new Date()
      let lines = response.split('\n')
      lines.splice(0, 7).reverse()   
      lines.forEach((line, i) => {
        let d = line.split(",")
        let date = new Date(Number(d[0].slice(1)) * 1000)
        if(date.getDate() !== today.getDate() && date.getHours() + (today.getTimezoneOffset() % 60)  === 22){
          this.lastClose = Number(d[1])
          this.lastDate = date
        }
    })
  }

  getlastClose = () => {
    const { x, ticker } = this.props
    let url = "https://hidden-island-42423.herokuapp.com/api/"+ticker+"&x="+x+"&f=d,o,c&i=23400&p=2d"
    getText(url, this.parseCloseRequest, this.handleRequestError)
}
  generateNotes() {
      this.notes = []
      let open = this.open
      if(this.timeInterval === "1d" && this.lastClose !== -1)
        open = this.lastClose
      this.priceData.forEach(val => {
          let idx = Math.floor(((val-open) / open) * this.multiplier)
          if(idx > 60)idx=60
          if(idx < -60)idx=-60

          this.notes.push(idx)
      });
  }
  addData(i){
    let open = this.open
    if(this.timeInterval === "1d"  && this.lastClose !== -1)
      open = this.lastClose
    let prc = (open - this.priceData[i-1]) / open;

    this.setState({
      prcChange: prc,
      timeStamps: [...this.state.timeStamps, this.timeStamps[i-1]]}
      ,() => this.setState({data: [...this.state.data, Number(this.priceData[i-1])]}))
  }

  handleExpandChange = (expanded) => {
    if(!expanded)
      this.stop()
    this.setState({expanded: expanded});
  };

  clearData(){
    let prc = 0
    if(this.timeInterval === "1d"  && this.lastClose !== -1)
      prc = (this.open - this.lastClose) / this.lastClose 
    this.setState({data: [], timeStamps: [], prcChange: -prc})
  }

  stop(){
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
    this.setState({ date: value})
  }
  
  render() {
    const style = {width:"500", minWidth:"50px", margin: "30"}
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
        </CardActions>
        <CardText expandable={true} >
          <Graph className="card-graph" data={this.state.data} timeStamps={this.state.timeStamps}></Graph>
          <div className="card-toolbar-wrapper">
              <div className="card-toolbar-text">
                {"Exaggeration: x" + this.multiplier}
              </div>
              <div className="date-button-group">         
                <FlatButton style={style} primary={this.state.date === 0} onClick={() => this.dateButtonClicked(0)}>1d</FlatButton>
                <FlatButton style={style} primary={this.state.date === 1} onClick={() => this.dateButtonClicked(1)}>1w</FlatButton>
                <FlatButton style={style} primary={this.state.date === 2} onClick={() => this.dateButtonClicked(2)}>1m</FlatButton>
                <FlatButton style={style} primary={this.state.date === 3} onClick={() => this.dateButtonClicked(3)}>3m</FlatButton>
                <FlatButton style={style} primary={this.state.date === 4} onClick={() => this.dateButtonClicked(4)}>1y</FlatButton>
              </div>
          </div>
      </CardText>
      <Snackbar
          open={this.state.displayError}
          message={String(this.errorMessage)}
          autoHideDuration={2500}
          onRequestClose={() => this.setState({displayError: false})}
        />
    </Card>
    );
  }
}

  
