import React, {Component} from 'react';
import AutoComplete from 'material-ui/AutoComplete';
import RaisedButton from 'material-ui/RaisedButton/RaisedButton';

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

  handleUpdateInput = (value) => {
    if(value !== ""){
      fetch("https://hidden-island-42423.herokuapp.com/stocks/"+ value).then((response) => { return response.json()})
        .then( (response) =>  {
            let l = response.map(a => a[0])
            this.setState({dataSource: l}); 
            this.searchResult = response
          }
        )
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
      this.state = {active: 1}
  }
  handleClick = (e) => {
    this.setState({active: samples.indexOf(e.target.innerHTML)})
    this.props.setVal(e.target.innerHTML)
  }
  render(){
      return(
          <div>            
              <RaisedButton onClick={this.handleClick} secondary={this.state.active === 0}>piano</RaisedButton>
              <RaisedButton onClick={this.handleClick} secondary={this.state.active === 1}>synth</RaisedButton>
          </div>
      )
  }
}