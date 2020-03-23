const express = require('express');
const Admin = require('../model/User');
const bcrypt = require('bcrypt');
const Employee = require('../model/Employee');
const config = require('../config/config');
const jwt = require('jsonwebtoken');
// const verification = require('./verification');

const app = express();
var fs = require('fs');

function verification(req, res, next) {
    if (req.headers["authorization"] !== undefined) {
        jwt.verify(req.headers["authorization"], config.secretKey);
        next();
    } else {
        res.statusCode = (403);
        res.json({msg: `Admin not Logged In`});
        res.end();
    }
}

// to login Admin
app.route('/login')
    .post( (req, res) => {

        Admin.findOne({email: req.body.email})
        .then((user) => {
            
            if (!user) {
                res.statusCode = (404);
                res.json({msg: `Email/Password incorrect.`});
                res.end();
            } else {
                bcrypt.compare(req.body.password, user.password)
                .then((result) => {
                    if (result) {
                        var token = jwt.sign({email: req.body.email}, config.secretKey, {expiresIn: '24h'});
                        res.statusCode = (200);
                        res.json({msg: token});
                        res.end();
                    } else {
                        res.statusCode = (404);
                        res.json({msg: `Email/Password incorrect.`});
                        res.end();
                    }
                })
                .catch((err) => {
                    res.statusCode = (404);
                    res.json({msg: `Error occurred: ${err}`});
                    res.end();
                })
            }
        })
        .catch((err)=>{
            res.statusCode = (404);
            res.json({msg: `Error occurred: ${err}`});
            res.end();
        });
    });

// to register Admin
app.route('/register')
    .post( (req, res) => {

        var newAdmin = new Admin({
            name: req.body.name,
            email: req.body.email
        })

        Admin.findOne({email: req.body.email})
        .then((data) => {
            // console.log(data)
            if (data !== null) {
                res.statusCode = (404);
                res.json({msg: `${newAdmin.email} already exists`});
                res.end();
            } else {
                bcrypt.hash(req.body.password, 10)
                .then((hash) => {
                    newAdmin.password = hash;
                    newAdmin.save((err, data) => {
                        if (err) {
                            res.statusCode = (404);
                            res.json({msg: `Error occurred`});
                            res.end();
                        } else {
                            res.statusCode = (200);
                            res.json({msg: `Admin registered`});
                            res.end();
                        }
                    });
                })
                .catch((err) => {
                    res.statusCode = (404);
                    res.json({msg: `Error occurred while hashing: ${err}`});
                    res.end();
                });
            }
        })
        .catch((err)=>{
            res.statusCode = (404);
            res.json({msg: `Error occurred: ${err}`});
            res.end();
        });
    });

// to delete Admin
app.route('/delete')
    .post( (req, res) => {
        Admin.findOneAndDelete({email: req.body.email})
        .then((user) => {
            if (user) {
                res.statusCode = (200);
                res.json({msg: `Admin deleted`});
                res.end();
            } else {
                res.statusCode = (404);
                res.json({msg: `Admin not found`});
                res.end();
            }
        })
        .catch((err)=>{
            res.statusCode = (404);
            res.json({msg: `Error occurred: ${err}`});
            res.end();
        });
    });

// to add an employee
app.route('/addemployee')
    .post(verification, (req, res) => {

        var newEmployee = new Employee({
            name: req.body.name,
            email: req.body.email,
            hourlyRate: req.body.hourlyRate
        });

        Employee.findOne({email: req.body.email})
        .then((user) => {
            if (user !== null) {
                res.statusCode = (404);
                res.json({msg: `${newEmployee.email} already exists`});
                res.end();
            } else {
                newEmployee.save((err) => {
                    if (err) {
                        res.statusCode = (404);
                        res.json({msg: `Error occurred: ${err}`});
                        res.end();
                    } else {
                        res.statusCode = (200);
                        res.json({msg: `Employee saved`});
                        res.end();
                    }
                });
            }
        })
        .catch((err) => {
            res.statusCode = (404);
            res.json({msg: `Error occurred: ${err}`});
            res.end();
        });
    });

// app.route('/changehourlyrate')
//     .post((req, res) => {

//         Employee.findOneAndUpdate({email: req.body.email}, {$set: {hourlyRate: req.body.hourlyRate}})
//         .then((user) => {
//             if (user === null) {
//                 res.statusCode = (404);
//                 res.json({msg: `Employee not found.`});
//                 res.end();
//             } else {
//                 res.statusCode = (200);
//                 res.json({msg: `Hourly rate updated.`});
//                 res.end();
//             }
//         })
//         .catch((err) => {
//             res.statusCode = (400);
//             res.json({msg: `Error occurred: ${err}`});
//             res.end();
//         });
//     });

app.route('/addtotalhours')
    .post(verification, (req, res) => {

        let allowance = req.body.allowance? req.body.allowance: 0;
        let deduction = req.body.deduction? req.body.deduction: 0;
        console.log(allowance, deduction);

        var time = {
            hours: req.body.hours,
            deduction: deduction,
            year: req.body.year,
            month: req.body.month,
            allowance: allowance,
        }
        console.log(time)

        Employee.findOne({email: req.body.email, sheet: {$elemMatch: { year: req.body.year, month: req.body.month }}})
        .then((user) => {
            
            if (user === null) {
                Employee.updateOne({email: req.body.email}, {$push: {sheet: time}})
                .then((data) => {
                    // console.log(data);
                    res.statusCode = (200);
                    res.json({msg: `PaySlip added.`});
                    res.end();
                })
                .catch((err) => {
                    res.statusCode = (400);
                    res.json({msg: `Error occurred: ${err}`});
                    res.end();
                });
            } else {
                res.statusCode = (404);
                res.json({msg: `Pay Slip already exists`});
                res.end();
            }
        })
        .catch((err) => {
            res.statusCode = (400);
            res.json({msg: `Error occurred: ${err}`});
            res.end();
        });
    });

app.route('/edittotalhours')
    .post(verification, (req, res) => {

        Employee.findOne({email: req.body.email, "sheet.year": req.body.year, "sheet.month": req.body.month}, (err, user) => {
            // console.log(user);
            // var arr = JSON.parse(JSON.stringify(user.sheet));
            // console.log( arr.length);
            if(err) {
                res.statusCode = (200);
                res.json({msg: `Updated`});
                res.end();
            } else if(user === null) {
                res.statusCode = (404);
                res.json({msg: `Null`});
                res.end();
            } else {
                var temp = [];

                for (var i=0; i<JSON.parse(JSON.stringify(user.sheet)).length; i++) {

                    if (JSON.parse(JSON.stringify(user.sheet))[i].year === req.body.year && JSON.parse(JSON.stringify(user.sheet))[i].month === req.body.month) {
                        var obj = JSON.parse(JSON.stringify(user.sheet))[i];
                        obj.hours = req.body.hours;
                        temp.push(obj);
                        // temp.push({"year": req.body.year, "hours": req.body.hours, "month": req.body.month, "allowance": JSON.parse(JSON.stringify(user.sheet))[i].allowance, "deduction": JSON.parse(JSON.stringify(user.sheet))[i].deduction});
                    } else {
                        temp.push(JSON.parse(JSON.stringify(user.sheet))[i])
                    }
                }
                
                Employee.updateOne({email: req.body.email, "sheet.year": req.body.year, "sheet.month": req.body.month}, {$set: {sheet: temp}})
                .then( (user) => {
                    // console.log(user)
                    if (user === null) {
                        res.statusCode = (404);
                        res.json({msg: `Employee/Payslip not found.`});
                        res.end();
                    } else {
                        res.statusCode = (200);
                        res.json({msg: `Monthly Hours updated for ${req.body.month}, ${req.body.year}.`});
                        res.end();
                    }
                })
                .catch((err) => {
                    res.statusCode = (400);
                    res.json({msg: `Error occurred: ${err}`});
                    res.end();
                });
            }
        });
    });

app.route('/deletetotalhours')
    .post(verification, (req, res) => {

        Employee.findOne({email: req.body.email, "sheet.year": req.body.year, "sheet.month": req.body.month}, (err, user) => {
            
            if(err) {
                res.statusCode = (200);
                res.json({msg: `Updated`});
                res.end();
            } else if(user === null) {
                res.statusCode = (404);
                res.json({msg: `Null`});
                res.end();
            } else {
                var temp = [];

                for (var i=0; i<JSON.parse(JSON.stringify(user.sheet)).length; i++) {

                    if (JSON.parse(JSON.stringify(user.sheet))[i].year === req.body.year && JSON.parse(JSON.stringify(user.sheet))[i].month === req.body.month) {
                        // temp.push({"year": req.body.year, "hours": req.body.hours, "month": req.body.month});
                    } else {
                        temp.push(JSON.parse(JSON.stringify(user.sheet))[i])
                    }
                }
                
                Employee.updateOne({email: req.body.email, "sheet.year": req.body.year, "sheet.month": req.body.month}, {$set: {sheet: temp}})
                .then( (user) => {
                    console.log(user)
                    if (user === null) {
                        res.statusCode = (404);
                        res.json({msg: `Employee/Employee Info not found.`});
                        res.end();
                    } else {
                        res.statusCode = (200);
                        res.json({msg: `Monthly Hours updated for ${req.body.month}, ${req.body.year}.`});
                        res.end();
                    }
                })
                .catch((err) => {
                    res.statusCode = (400);
                    res.json({msg: `Error occurred: ${err}`});
                    res.end();
                });
            }
        });
    });

app.route('/additional')
    .post(verification, (req, res) => {

        Employee.findOne({email: req.body.email, "sheet.year": req.body.year, "sheet.month": req.body.month}, (err, user) => {
            
            if(err) {
                res.statusCode = (200);
                res.json({msg: `Updated successfully`});
                res.end();
            } else if(user === null) {
                res.statusCode = (404);
                res.json({msg: `No information found`});
                res.end();
            } else {
                var temp = [];

                for (var i=0; i<JSON.parse(JSON.stringify(user.sheet)).length; i++) {

                    if (JSON.parse(JSON.stringify(user.sheet))[i].year === req.body.year && JSON.parse(JSON.stringify(user.sheet))[i].month === req.body.month) {
                        var obj = JSON.parse(JSON.stringify(user.sheet))[i];
                        // console.log(obj)
                        obj.allowance = req.body.allowance || obj.allowance;
                        obj.deduction = req.body.deduction || obj.deduction;
                        temp.push(obj);
                    } else {
                        temp.push(JSON.parse(JSON.stringify(user.sheet))[i])
                    }
                }
                
                Employee.updateOne({email: req.body.email, "sheet.year": req.body.year, "sheet.month": req.body.month}, {$set: {sheet: temp}})
                .then( (user) => {
                    if (user === null) {
                        res.statusCode = (404);
                        res.json({msg: `Employee/Employee info not found.`});
                        res.end();
                    } else {
                        res.statusCode = (200);
                        res.json({msg: `Monthly Hours updated for ${req.body.month}, ${req.body.year}.`});
                        res.end();
                    }
                })
                .catch((err) => {
                    res.statusCode = (400);
                    res.json({msg: `Error occurred: ${err}`});
                    res.end();
                });
            }
        });
    });

app.route('/salary')
    .get(verification, (req, res) => {

        Employee.findOne({email: req.query.email, "sheet.year": req.query.year, "sheet.month": req.query.month})
        .then((user) => {

            if (user === null) {
                res.statusCode = (404);
                res.json({msg: `No information found`});
                res.end();
            } else {
                var salary;
                for (var i=0; i<JSON.parse(JSON.stringify(user.sheet)).length; i++) {

                    if (JSON.parse(JSON.stringify(user.sheet))[i].year === Number(req.body.year) && JSON.parse(JSON.stringify(user.sheet))[i].month === req.body.month) {
                        var obj = JSON.parse(JSON.stringify(user.sheet))[i];
                        console.log(obj, user)
                        if (obj.allowance) {
                            salary += obj.allowance
                        }
                        if (obj.deduction) {
                            salary += obj.deduction
                        }
                        salary = obj.hours*user.hourlyRate;
                        break;
                    }
                }

                res.statusCode = (200);
                res.json({msg: salary});
                res.end();
            }
        })
        .catch((err) => {
            res.statusCode = (400);
            res.json({msg: `Error occurred: ${err}`});
            res.end();
        });
    });

module.exports = app;