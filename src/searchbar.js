import React, {Component} from 'react';
import AutoComplete from 'material-ui/AutoComplete';
import RaisedButton from 'material-ui/RaisedButton/RaisedButton';
import {getText} from './util/networking'

const samples = [
  "piano",
  "synth",
]

export default class AutoCompleteExampleSimple extends Component {
  constructor(props){
    super(props)
    this.searchResult = []
  }
  state = {
    dataSource: [],
  };

  handleNewRequest = (value) => {
    this.searchResult.forEach(stock => {
      if(value === stock[0])
        this.props.addTicker(stock[0], stock[1], stock[2]) 
    })
  }

  handleResponse = (response) => {
    let l = response.map(a => a[0])
    this.setState({dataSource: l}); 
    this.searchResult = response
  }

  handleUpdateInput = (value) => {
    if(value !== ""){
      getText("https://hidden-island-42423.herokuapp.com/stocks/"+ value, this.handleResponse, this.props.handleRequestError)
    }else{
      this.setState({dataSource: []})
    }
  }

  render() {
    return (
      <div className="searchbar-wrapper">
        <AutoComplete
          className="searchbar"
          hintText="Search ticker"
          filter={AutoComplete.noFilter}
          dataSource={this.state.dataSource}
          onUpdateInput={this.handleUpdateInput}
          onNewRequest={this.handleNewRequest}
          style = {{width: 110}}
        />
        <div className="header-buttons">
            <ButtonGroup setVal={(val) => this.props.setSample(val)}></ButtonGroup>
        </div> 
      </div>
    );
  }
}
class ButtonGroup extends React.Component {
  constructor(props){
      super(props)
      this.state = {active: 0}
  }
  handleClick = (e) => {
    this.setState({active: samples.indexOf(e)})
    this.props.setVal(e)
  }
  render(){
      return(
          <div>            
              <RaisedButton onClick={() => this.handleClick("piano")} secondary={this.state.active === 0}>piano</RaisedButton>
              <RaisedButton onClick={() => this.handleClick("synth")} secondary={this.state.active === 1}>synth</RaisedButton>
          </div>
      )
  }
}