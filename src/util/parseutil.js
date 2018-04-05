
/**
 * Generates timestamps for use in the graph
 * @param timeStamps: Date-object array
 * @param timeInterval: window-size for datafetched, eg 1d or 3M
 */
export function generateTimeStamps(timestamps, timeInterval){
    let currentDay = ""
    let currentYear = ""

    return timestamps.map((date, index) => {
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      const day = date.getDate()
      const hours = date.getHours()            
      const minutes = date.getMinutes()
      let tickValue = "" 
      
      let newDay = currentDay !== day
      currentDay = day

      let getHM = () => {
        let tv=hours+":"+minutes
        if(tv.split(":")[1].length !== 2)tv+="0"
        return tv
      } 

      switch(timeInterval){
          case "1d":
          case "7d":
                return newDay ? day+"/"+month : getHM()
          case "1M":
          case "3M":
              return day+"/"+month
          case "1Y":
              if(currentYear !== year){
                  tickValue += String(year).slice(-2) + " " 
                  currentYear = year
              }
              return tickValue+day+"/"+month
          default:
              return ""
            }   
      })
}

/*
    Returns the closeprice from the last open day of trading
*/
export function parseClose(response){
    let today = new Date()
    let lines = response.split('\n')
    let close = [new Date("July 21, 1983 01:15:00"), 0]
    

    lines.splice(0, 7) 
    lines.forEach((line, i) => {
        let [timeStamp, price] = line.split(",")
        let date = new Date(Number(timeStamp.slice(1)) * 1000)
        if(date.getDate() !== today.getDate() && date.getHours() + (today.getTimezoneOffset() % 60)  === 22){
            if(Date.parse(date) > Date.parse(close[0])){
                close = [date, Number(price)]
            }
            
        }
    })


    return close
}

/*
    returns a list of prices and a list of timestamps from API request
    First seven lines are not data

    Data comes in format "Unixtimesamp,price\n"
    Disregards timezone offsets and add a datapoint every fourth sample
    Some lines have '1...n'instead of a UNIX timestamp so we keep track 
    of the previous and add the timeinterval of the points to the new data  
*/

export function parseResponse(response, timeInterval, gran){
    var priceData = []
    var timestamps = []

    let lines = response.split('\n')
    lines.splice(0, 7)   
    let prev = -1

    let spacing = 2
    lines.forEach((line, i) => {
      if((i % spacing === 0 || i === lines.length - 1)  && line.indexOf("TIMEZONE_OFFSET") === -1) {
          let [timeStamp, price] = line.split(",")
          if(timeStamp.length > 10){
            prev = Number(timeStamp.slice(1)) * 1000 
            timestamps.push(new Date(prev))
          }else{
            prev += gran*1000*spacing
            timestamps.push(new Date(prev))
          }
          
          priceData.push(Number(price))
      } 
    })


    priceData.pop()
    timestamps.pop()
    
    return [priceData, timestamps]
}

/*
    returns [time between datapoints in seconds, timeInterval, noteScaleMultiplier]
*/

export function setTimeInterval(value){
    switch(value){
        case 0:
          return ["300", "1d", 250]
        case 1:
            return ["2100", "7d", 150]
        case 2:
            return ["57600", "1M", 75]
        case 3:
            return ["86640", "3M", 50]
        case 4:
            return ["936000", "1Y", 20]
        default:
          alert("smth wng")
    }  
}