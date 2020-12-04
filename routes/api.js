/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

const expect = require('chai').expect;
const mongodb = require('mongodb');
const mongoose  = require('mongoose');
var ObjectId = require('mongodb').ObjectID;


module.exports = function (app) {

  mongoose.connect(process.env.MONOGO_URI || 'mongodb://localhost/issue-tracker', { useNewUrlParser: true }, { useUnifiedTopology: true } );

  const complaintSchema = new mongoose.Schema({
    issue_title: {type: String, required: true},
    issue_text: {type: String, required: true},
    created_by: {type: String, required: true},
    assigned_to : String,
    status_text : String,
    open: {type: Boolean, required: true},
    created_on: {type: Date, required: true},
    updated_on: {type: Date, required: true},
    project: String
  });
  
  let Complaint = mongoose.model('Complaint', complaintSchema);
  
  app.route('/api/issues/:project')
  
    .get(function (req, res){
      var project = req.params.project;
    let filterObj = Object.assign(req.query);
    filterObj['project'] = project;
    Complaint.find(
     // {project: project},
      filterObj,
      (error, results) => {
        if(!error && results) {
         return res.json(results) 
        }
      }
    )
    })
    
    .post(function (req, res){
      var project = req.params.project;
    
      if(!req.body.issue_title || !req.body.issue_text || !req.body.create_by){
        return res.json({error: 'Required fields are missing from the request'})
      }
      let newComplaint = Complaint({
         issue_title: req.body.issue_title,
         issue_text: req.body.issue_text,
         created_by: req.body.created_by,
         assigned_to: req.body.assigned_to || '',
        status_text: req.body.status_text || '',
        open: true,
        created_on: new Date().toUTCString(),
        updated_on: new Date().toUTCString(),
        project: project
      })
      
      newComplaint.save((error, data) => {
        if(!error && data){
          
          return res.json(data);
        }
      })
    })
    
    .put(function (req, res){
      var project = req.params.project;
    
    let updateObj = {};
    
    Object.keys(req.body).forEach((key) => {
      
      if(req.body[key] != ''){
        updateObj[key] = req.body[key];
        }
      })
    if(Object.keys(updateObj).length < 2){
      return res.json('No updated fields sent');
    }
     updateObj['updated_on'] = new Date().toUTCString(); 
    Complaint.findByIdAndUpdate(
      req.body._id,
      updateObj,
      {new: true},
      (err, data) => {
        if(!err && data){
          return res.json('successfully updated')
        } else if(!data){
          return res.json('no update field sent '+ req.body._id)
        }
      }
                                
    )
    })
    
    .delete(function (req, res){
      var project = req.params.project;
      if(!req.body._id){
        return res.json('id error')
      } 
     Complaint.findByIdAndRemove(req.body._id, (err, data) => {
       if(!err && data){
         res.json('deleted '+ data.id)
       }else if(!data){
         res.json('could not delete '+ req.body._id)
       }
     })
    });
    
};
