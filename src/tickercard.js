import React from 'react';
import {Card, CardActions, CardHeader, CardText} from 'material-ui/Card';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import Graph from './graph'

export default class TickerCard extends React.Component {
  
  constructor(props) {
    super(props);
    this.stop = this.stop.bind(this)
    this.play = this.play.bind(this)
    this.dateButtonClicked = this.dateButtonClicked.bind(this)

    this.state = {
      expanded: false, 
      loaded:false, 
      playing:false, 
      data: [], 
      date: 0, 
      timeStamps: [],
      timeStampDetail: "",
      prcChange: 0
    };
  
    this.multiplier = 300
    this.gran = "300"
    this.timeInterval = "1d"
    this.lastClose = -1
    this.notes = []
    
    this.priceData = []
    this.timeStamps = []
    this.URL = "https://hidden-island-42423.herokuapp.com/api/"+props.ticker+"&x="+props.x+"&f=d,o"
    
  }

  componentDidMount = (props) => {
    this.getlastClose()
    this.getData(this.URL +"&i=300&p=1d", 0)
  }

  getData = (url, val) => {
      
      this.setState({fetching: true}, () => {
      fetch(url, {
        method: "GET",
        mode: 'cors',
        headers:{
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials':true,
            'Access-Control-Allow-Methods': 'GET'
            }
    }).then(response => { return response.text() }).then( response=>{
        this.priceData = []
        this.timeStamps = []
        let lines = response.split('\n')
        lines.splice(0, 7)   
        let prev = -1
        lines.forEach((line, i) => {
          if(this.timeInterval !== "1M" || i % 2 ===  1){
            if(line.indexOf("TIMEZONE_OFFSET") === -1){
              let d = line.split(",")
              if(d[0].length > 10){
                prev = Number(d[0].slice(1))* 1000 
                this.timeStamps.push(new Date(prev))
              }else{
                prev += this.gran*1000
                this.timeStamps.push(new Date(prev))
              }
              this.priceData.push(d[1])
            }  
          } 
        })

        this.priceData.pop()
        this.timeStamps.pop()
        this.open = this.priceData[0]
        if(this.timeInterval === "1d"){
            let prc = (this.open - this.lastClose) / this.lastClose 
            this.setState({prcChange: -prc})
        }else{
          this.timeStamps.push(this.lastDate)
          this.priceData.push(String(this.lastClose))
        }
        this.generateTimeStamps()
        this.generateNotes()
        this.setState({fetching:false, date: val})
    }).catch(error => {
      console.log(error)
      })  
    })   
}

  getlastClose = () => {
    let today = new Date()
    const { x, ticker } = this.props
    fetch("https://hidden-island-42423.herokuapp.com/api/"+ ticker +"&x="+x+"&f=d,o,c&i=23400&p=2d").then((response) => {return response.text()})
    .then((response) => {
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
  })
}

  generateTimeStamps = () => {
    let currentDay = ""
    let currentYear = ""
    this.timeStamps = this.timeStamps.map((date, index) => {
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      const day = date.getDate()
      const hours = date.getHours()            
      const minutes = date.getMinutes()
      let tickValue = "" 
      switch(this.timeInterval){
          case "1d":
            if(currentDay !== day){
              currentDay = day
              return tickValue += day + "/"+month
          }
          tickValue += hours+":"+minutes
          if(tickValue.split(":")[1].length !== 2)tickValue+="0"
          return tickValue
          case "7d":
              if(currentDay !== day){
                  currentDay = day
                  return tickValue += day + "/"+month
              }
              tickValue += hours+":"+minutes
              if(tickValue.split(":")[1].length !== 2)tickValue+="0"
              return tickValue
          case "1M":
            if(currentDay !== day || index % 5 === 0){
              currentDay = day
              tickValue += day + "/"+month + " "
            }
            return tickValue
          case "3M":
              return day +"/" + month
          case "1Y":
              if(currentYear !== year){
                  tickValue += String(year).slice(-2) + " " 
                  currentYear = year
              }
              return tickValue + day+"/"+month
          default:
              return ""
            }   
      })
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


  handleChange = (event, index, value) => { 
      this.setState({value: index})
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
    switch(value){
      case 0:
        this.gran = "300";
        this.timeInterval = "1d"
        this.multiplier = 300
        break;
      case 1:
        this.gran = "2100";
        this.timeInterval = "7d"
        this.multiplier = 200
        break;
      case 2:
        this.gran = "57600";
        this.timeInterval = "1M"
        this.multiplier = 100
        break;
      case 3:
        this.gran = "86640";
        this.timeInterval = "3M"
        this.multiplier = 60
        break;
      case 4:
        this.gran = "936000"
        this.timeInterval = "1Y"
        this.multiplier = 30
        break;
      default:
        alert("smth wng")
    }

    this.stop()
    this.getData(this.URL + "&i="+this.gran+"&p="+this.timeInterval, value)
    this.setState({timeStampDetail: this.timeInterval})
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
            <b 
              style={{float: "right", color: this.state.prcChange > 0 ? "red":"green", marginTop: "12px"}}
            >{String(-this.state.prcChange*100).substring(0, 5)+ "%"}
            </b>
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
    </Card>
    );
  }
}

  
