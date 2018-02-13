
/*
    dont look inisde here
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
      switch(timeInterval){
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

export function parseResponse(response, timeInterval, gran){
    var priceData = []
    var timestamps = []

    let lines = response.split('\n')
    lines.splice(0, 7)   
    let prev = -1
    lines.forEach((line, i) => {
      if(i % 4 ===  0){
        if(line.indexOf("TIMEZONE_OFFSET") === -1){
          let d = line.split(",")
          if(d[0].length > 10){
            prev = Number(d[0].slice(1))* 1000 
            timestamps.push(new Date(prev))
          }else{
            prev += gran*1000
            timestamps.push(new Date(prev))
          }
          priceData.push(d[1])
        }  
      } 
    })

    priceData.pop()
    timestamps.pop()

    return [priceData, timestamps]
}

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