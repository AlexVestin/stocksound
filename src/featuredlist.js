import React, { Component } from 'react';
import './style/App.css';

import TickerCard from "./card/tickercard"
import NotePlayer from './util/soundplayer'
import AutoCompleteExampleSimple from "./searchbar"
import Snackbar from 'material-ui/Snackbar';

let featuredStocks = [
  {
      name: "Snap Inc",
      ticker: "SNAP",
      exchange: "NYSE" 
  },
  {
      name: "Apple Inc",
      ticker: "AAPL",
      exchange: "NASDAQ"
  },
  {
    name: "Boeing Co",
    ticker: "BA",
    exchange: "NYSE"
  },
  {
      name: "Micron Technology Inc",
      ticker: "MU",
      exchange: "NASDAQ"
  },
  {
    name: "Facebook Inc",
    ticker: "FB",
    exchange: "NASDAQ"
  },
  {
      ticker: "AMD",
      name: "Advanced Micro Devices Inc",
      exchange: "NASDAQ"
  },
  {
    name: "SPDR S&P 500",
    ticker: "SPY",
    exchange: "NYSEARCA"
  },
]

class FeaturedList extends Component {
  constructor(props){
    super(props)
    this.dataAdded = (i) => { this.tickerClasses[this.currentTicker].addData(i)}
    
    this.soundPlayer = new NotePlayer(this.dataAdded, this.handleError)
    this.state = {tickers: featuredStocks, sample: "pianos", displayError: false}
    this.tickerClasses = {}
    this.errorMessage = ""
  }

  handleError = (err) => {
    this.errorMessage = String(err)
    this.setState({displayError: true})
  }

  addTicker = (ticker, name, exchange) => {
    if(this.state.tickers.find(t => {return t.ticker === ticker}) !== undefined){
      this.errorMessage = ticker + " is already added to the list"
      this.setState({displayError: true})
    }else{
      this.setState({tickers:  [{name: name, ticker, exchange}, ...this.state.tickers]})
    }
  }

  play(buffer, ticker){
    this.currentTicker = ticker
    this.tickerClasses[ticker].clearData()
    this.soundPlayer.play(buffer)
  }
  stop(ticker){
    this.soundPlayer.stop()
    this.tickerClasses[ticker].clearData()
  }

  render() {
    return (
      <div className="center-column-wrapper">
        <AutoCompleteExampleSimple
          setSample={(sample) => this.soundPlayer.sample = sample} 
          addTicker={this.addTicker}
          handleRequestError={this.handleError}
          >
        </AutoCompleteExampleSimple>

        <div className="tickerlist">
          {this.state.tickers.map((stock)=> 
            <TickerCard
              ref={(input) => { this.tickerClasses[stock.ticker] = input }} 
              key={stock.ticker} 
              ticker={stock.ticker} 
              x={stock.exchange} 
              name={stock.name}
              play={this.play.bind(this)} 
              stop={this.stop.bind(this)}
              handleRequestError={this.handleError}
              ></TickerCard>
          )}
          </div>

          <Snackbar
            style={{textAlign: "center"}}
            open={this.state.displayError}
            message={String(this.errorMessage)}
            autoHideDuration={2500}
            onRequestClose={() => this.setState({displayError: false})}
        />
        </div>
    );
  }
}

export default FeaturedList;

