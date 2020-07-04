import React from 'react';
import './App.css';
import Chart from './Chart';
import moment from 'moment';
import _ from 'lodash';

class App extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      fitData:[],
      chartData: [],
    }
    this.grab = this.grab.bind(this);
    this.queryDb = this.queryDb.bind(this)
    
  }
  //populates chart with data currently in db
  componentDidMount(){
    this.queryDb()
  }

  grab(){
    let authcode = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyMkJNWloiLCJzdWIiOiI0NlE2N00iLCJpc3MiOiJGaXRiaXQiLCJ0eXAiOiJhY2Nlc3NfdG9rZW4iLCJzY29wZXMiOiJyc29jIHJhY3QgcnNldCBybG9jIHJ3ZWkgcmhyIHJwcm8gcm51dCByc2xlIiwiZXhwIjoxNjIzNjc1OTg4LCJpYXQiOjE1OTIxNDAwODZ9.UMHMIEvnqvMhQ5L4SE85zFRQtNXkWwZ3MbVY78EiSn0"
    const headers = {Accept: "application/x-www-form-urlencoded", Authorization:`Bearer ${authcode}`}
    let date = new Date().toISOString().substring(0, 10);
    return fetch(`https://api.fitbit.com/1/user/-/activities/list.json?beforeDate=${date}&sort=desc&offset=0&limit=100`, 
    //return fetch(`https://api.fitbit.com/1/user/-/activities/list.json?beforeDate=2019-07-13&sort=desc&offset=0&limit=100`, 
        {
          headers: headers,
        })
        .then(response => {
                return response.json() 
            })
            .then(data => {
                console.log(data)
                let runList =  data.activities.filter(activity => activity.heartRateZones)
                //narrow api response to just the fields needed
                //console.log(runList)
              let initial =  runList.map(activity => ({
                title : activity.activityName,
                date: activity.startTime,
                zones : activity.heartRateZones.reduce((a,b,i) => a + b.minutes*(i),0),          
              }));
            
              let sorted = initial.sort((a, b) => (a.date > b.date) ? 1 : -1)
            //convert date to timestamp then to week year
              let dateData = sorted.map((activity) => (
                {
                  weekYear: [moment(new Date(activity.date).getTime()).week(), moment(new Date(activity.date).getTime()).year()],
                  effort: activity.zones,
                  timestamp: new Date(activity.date),
                }))
              console.log(dateData)
          //groupby week and sum effort using lodash
              let sumData = _(dateData)
              .groupBy('weekYear')
              .map((v, k) => ({
                  weekYear: k,
                  effort: _.sumBy(v, 'effort'),
              })).value(); 
              console.log(sumData)
          //add highs and lows using summed effort
              let highLowData = sumData.map((activity,i,arr) => (
                  {
                    weekYear: activity.weekYear,
                    split: activity.weekYear.split(','),
                    effort: activity.effort,
                    high: i >= 3 ? ((arr[i-3].effort + arr[i-2].effort + arr[i-1].effort + arr[i].effort)/4)*1.2:
                          i === 2 ? ((arr[i-2].effort + arr[i-1].effort + arr[i].effort)/3)*1.3:
                          i === 1 ? ((arr[i-1].effort + arr[i].effort)/2)*1.5 :
                          arr[i].effort*2,
                    low: i >= 3 ? ((arr[i-3].effort + arr[i-2].effort + arr[i-1].effort + arr[i].effort)/4)*.5 :
                         i === 2 ? ((arr[i-2].effort + arr[i-1].effort + arr[i].effort)/3)*.4 :
                         i === 1 ? ((arr[i-1].effort + arr[i].effort)/2)*.3 :
                         arr[i].effort*.25,
                  }
              ))
              console.log(highLowData)
          //add color coding based on highs and lows
              let finalData = highLowData.map((activity) => (
                {
                  weekYear: activity.weekYear,
                  //parsing weekYear back into a date for the chart
                  date: moment().day('Monday').year(parseInt(activity.split[1])).week(parseInt(activity.split[0])).toDate(),
                  effort: activity.effort,
                  high: activity.high,
                  low: activity.low,
                  lineColor: (activity.effort > activity.high) ? '#92E2F9' : (activity.effort < activity.low) ? '#0E225E' : '#568BB3',
                  message1: (activity.effort > activity.high) ? 'Above Weekly Range,' : (activity.effort < activity.low) ? 'Below Weekly Range,' : 'Steady Progress,' ,
                  message2: (activity.effort > activity.high) ? 'Significant Increase.' : (activity.effort < activity.low) ? 'Lighter than Average.' : 'Good for Maintaining.',
                  
                }
              ))
              console.log(finalData)


            //set chart data to state
              this.setState({fitData:finalData}, this.post)
            })
            .catch(err => {console.error(err)});   

  }

  async post(){
    const options = {
      method: 'POST',
      headers: {
        'Content-Type' : 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(this.state.fitData)
    }
    const response = await fetch('/fitData', options);
    const data = await response.json()
    console.log(data)
    await this.queryDb()
  }

  async queryDb(){
    const response = await fetch('/chartData');
    const dbData = await response.json()
    let sorted = dbData.sort((a, b) => (a.date > b.date) ? 1 : -1)
    this.setState({chartData:sorted})
  }

  render() {
    return (
      <div className="grid-container">
      <div className="Top"></div>
      <div className="Title">
        <p className="runtopia">RUNTOPIA.</p> 
        <div>
          <button className="big-button" onClick= {this.grab}>Get Data</button>
        </div>          
      </div>
      <div className="Weekly">
        <Chart key={this.state.chartData} data={this.state.chartData} />
      </div>
      <div className="Bottom"></div>
    </div>
    );
  }
}

export default App;
