import React, { Component } from 'react';
import './App.css';

import TickerCard from "./tickercard"
import NotePlayer from './soundplayer'
import AutoCompleteExampleSimple from "./searchbar"

let featuredStocks = [
  {
      name: "Apple",
      ticker: "AAPL",
      exchange: "NASDAQ"
  },
  {
      name: "Micron",
      ticker: "MU",
      exchange: "NASDAQ"
  },
  {
      name: "AMD",
      ticker: "AMD",
      exchange: "NASDAQ"
  },
  {
    name: "S&P 500",
    ticker: "SPY",
    exchange: "NYSEARCA"
  },
]

class FeaturedList extends Component {
  constructor(props){
    super(props)

    this.dataAdded = (i) => { this.tickerClasses[this.currentTicker].addData(i);}
    
    this.soundPlayer = new NotePlayer(this.dataAdded)
    this.state = {tickers: featuredStocks, sample: "pianos"}
    this.tickerClasses = {}
  }

  addTicker = (ticker, name, exchange) => {
    this.setState({tickers:  [{name: name, ticker, exchange}, ...this.state.tickers]})
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
              addTicker={this.addTicker}>
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
                  ></TickerCard>
              )}
              </div>
            </div>
    );
  }
}

export default FeaturedList;

