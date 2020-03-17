const express = require('express');

const app = express();
var fs = require('fs');

// get array
app.route('/coordinate')
    .get(get_coordinates);

function get_coordinates(req, res) {
    // console.log(req.query.restitution);
    res.json({"Coordinates array": ball_coordinate(req.query.restitution) });
}

// get past calculations
app.route('/history')
    .get(past_calculations);

function past_calculations() {
    if (fs.existsSync('./ball_history_data.json')) {
        
        fs.readFile('./ball_history_data.json', function (err, data) {
            var json = JSON.parse(data)
            if (req.query.calculation_number) {
                res.json({
                    data: json.array[req.query.calculation_number]
                });
            } else {
                res.json({
                    msg: `Calculation number ${req.query.calculation_number} does not exist.`
                });
            }

        })
    } else {
        res.json({
            msg: "No data on previous calulations"
        });
    }
}

function ball_coordinate(restitution) {
    

    if (fs.existsSync('./ball_history_data.json')) {
        
        fs.readFile('./ball_history_data.json', function (err, data) {
            var json = JSON.parse(data)
            json.array.push(coordinates_array)
        
            fs.writeFile('./ball_history_data.json', JSON.stringify(json), (err) => {
                if (err) {
                    console.log("Error write storing data: "+ err);
                }
            })
        })
    } else {
        fs.writeFile('./ball_history_data.json', JSON.stringify({"array": coordinates_array}), (err) => {
            if (err) {
                console.log("Error write storing data: "+ err);
            }
        });
    }
    
    return coordinates_array
}

module.exports = app;