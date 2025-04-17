function get_forecast(mountain_name){
  var query = `select mountains.forecast_office as mtn_forecast_office,
       mountains.grid_x as mtn_grid_x, mountains.grid_y as mtn_grid_y, forecasts.* from mountains
        left join forecasts
         on mountains.forecast_office = forecasts.forecast_office
          and mountains.grid_x = forecasts.grid_x
          and mountains.grid_y = forecasts.grid_y
        where mountain_name = $1 order by generation_time desc, period_number asc;`
 
  var values = [mountain_name];
  db.any(query, values) // This will be an array of forecast information for each upcoming period
    .then(data => {
      if (!data[0].generation_time){ // no previous observations for this zone
        var diffInMs = Infinity;
      } else {
        var generation_time = new Date(data[0].generation_time);
        var current_time = new Date();
        console.log(generation_time);
        console.log(current_time);
        var diffInMs = Math.abs(current_time.getTime() - generation_time.getTime());
      }
      if (diffInMs > 1000*60*60){  // stored data is outdated, update it first
        var grid_x = data[0].mtn_grid_x;
        var grid_y = data[0].mtn_grid_y;
        var forecast_office = data[0].mtn_forecast_office;  // https://api.weather.gov/gridpoints/TOP/31,80/forecast 
        axios({  
          url: 'https://api.weather.gov/gridpoints/' + forecast_office + '/' + grid_x + ',' + grid_y + '/forecast',
          method: 'GET'
        }).then(results => {
          // Now update forecasts table
          var forecast = results.data.properties;
          var generation_time = forecast.generatedAt;
          var forecast_array = forecast.periods;
          
          var values_str = ''
          for (let i = 0; i < forecast_array.length; i++) {
            period_forecast = forecast_array[i];
          if ('number' in period_forecast){
            var period_number = period_forecast.number;
          } else {
            var period_number = null;
          }
          if ('name' in period_forecast){
            var period_name = period_forecast.name;
          } else {
            var period_name = null;
          }
          if ('temperature' in period_forecast){
            var temperature = period_forecast.temperature;
          } else {
            var temperature = null;
          }
          if ('temperatureUnit' in period_forecast){
            var temperatureUnit = period_forecast.temperatureUnit;
          } else {
            var temperatureUnit = null;
          }
          if ('windSpeed' in period_forecast){
            var windSpeed = period_forecast.windSpeed;
          } else {
            var windSpeed = null;
          }
          if ('windDirection' in period_forecast){
            var windDirection = period_forecast.windDirection;
          } else {
            var windDirection = null;
          }
          if ('icon' in period_forecast){
            var icon = period_forecast.icon;
          } else {
            var icon = null;
          }
          if ('shortForecast' in period_forecast){
            var shortForecast = period_forecast.shortForecast;
          } else {
            var shortForecast = null;
          }
          if ('probabilityOfPrecipitation' in period_forecast){
            var probabilityOfPrecipitation = period_forecast.probabilityOfPrecipitation.value;
          } else {
            var probabilityOfPrecipitation = null;
          }
          values_str = values_str + `('${forecast_office}', ${grid_x}, ${grid_y}, '${generation_time}', ${period_number}, '${period_name}', '${temperatureUnit}',
          ${temperature}, '${windSpeed}', '${windDirection}', '${icon}', '${shortForecast}', ${probabilityOfPrecipitation})`
          if (i < forecast_array.length - 1){
            values_str = values_str + ','
          }
        }

        // Delete all old data for this location and insert new forecast
        var query = `DELETE from forecasts where forecast_office = $1 and grid_x = $2 and grid_y = $3;
           INSERT INTO forecasts
          (forecast_office, grid_x, grid_y, generation_time, period_number, period_name, temperatureUnit,
          temperature, windSpeed, windDirection, icon, shortForecast, probabilityOfPrecipitation)
         VALUES ` + values_str + ` returning *`
         values = [forecast_office, grid_x, grid_y];
      db.any(query, values)
      .then(results => {
        return results;
      })
      .catch(err => {
        return [];
      });
          
        })
        .catch(err => {
         return [];
        });
      } else {  // stored weather data in db is up to date, return it
        return data;
      }
    })
    .catch(err => {
      return [];
  });
}