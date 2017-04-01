"use strict";

require('dotenv').config();

const PORT        = process.env.PORT || 8080;
const ENV         = process.env.ENV || "development";
const express     = require("express");
const bodyParser  = require("body-parser");
const sass        = require("node-sass-middleware");
const app         = express();

const knexConfig  = require("./knexfile");
const knex        = require("knex")(knexConfig[ENV]);
const morgan      = require('morgan');
const knexLogger  = require('knex-logger');

// Seperated Routes for each Resource
const usersRoutes = require("./routes/users");

//Mailgun Setup
var api_key = 'key-0f03ad929654bb6136772d628a456f98';
var domain = 'sandbox0229991348f842509ff15dab0913c399.mailgun.org';
var mailgun = require('mailgun-js')({apiKey: api_key, domain: domain});

// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
//         The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
app.use(morgan('dev'));

// Log knex SQL queries to STDOUT as well
app.use(knexLogger(knex));

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/styles", sass({
  src: __dirname + "/styles",
  dest: __dirname + "/public/styles",
  debug: true,
  outputStyle: 'expanded'
}));
app.use(express.static("public"));

// Mount all resource routes
app.use("/api/users", usersRoutes(knex));


//////////////// GET PAGES ///////////////


app.get("/", (req, res) => {
  res.redirect("/polls");
});

app.get("/polls", (req, res) => {
  res.status(200).render("index");
});

app.get("/polls/result/:id", (req, res) => {
  res.status(200).render("result");
});

app.get("/polls/:id", (req, res) => {
  res.status(200).render("vote");
});


/////////////POST REQUESTS//////////////////

app.post('/polls', (req, res) => {
  console.log(req.body);
  /////Decision Table///////
  let email_subject = req.body.title;
  let email_text = req.body.message;
  let email_admin = req.body.admin_email;
  let rem_time = req.body.time;

  /////MAILGUN EMAIL/////
  // let text_voter = 'A poll is available at localhost8080:' + req.body.admin_url;
  let text_admin = 'Thank you for using Decision Maker. Your administration and user link are as follows: ' + req.body.admin_url + 'voter link: localhost8080:' + req.body.admin_url;


    //////////////// INSERT INFORMATION INTO TABLES ///////////////////
////////////////WORKING TEMPLATE/////////////////////////

  console.log(req.body.votersArray);

  knex('decisions')
    .returning('id')
    .insert({
      title: email_subject,
      time: rem_time,
      message: email_text,
      admin_email: email_admin,
      admin_name: req.body.admin_name,
      admin_url: req.body.admin_url
    })
    .then(function([decisionId]) {
      const votersPromises = req.body.votersArray.map(voter => knex('voters').returning('id').insert({voter_email: voter.voter_email, voter_url: voter.voter_url, decision_id: decisionId}));
      const emailsPromises = req.body.optionsArray.map(option => knex('options').returning('id').insert({title: option.title, description: option.description, decision_id: decisionId, total_rank: 0}));
      return Promise.all(votersPromises.concat(emailsPromises))
    });
      // console.log(decisionId);
      //   return Promise.all([

      //       knex('voters')
      //         .returning('id')
      //         .insert({
      //           // voter_name: req.body.votersArray[0].voter_name,
      //           voter_email: req.body.votersArray[0].voter_email,
      //           voter_url: req.body.votersArray[0].voter_url,
      //           decision_id: decisionId
      //       })
      //     knex('options')
      //       .returning('id')
      //       .insert({
      //         title: req.body.optionsArray[0].title,
      //         description: req.body.optionsArray[0].description,
      //         decision_id: decisionId,
      //         total_rank: 0
      //       })
      //   ]);
      // // }
      // })
      // .then(function([[voterId], [optionId]]) {
      //   return knex('polls')
      //   .insert({
      //     voter_id: voterId,
      //     option_id: optionId,
      //     base_rank: 0
      //   })
      /////Also insert into polls table for each and ends here.
    // }).finally(knex.destroy);

  ///VOTER EMAIL///
  req.body.votersArray.forEach(function(email) {
    let url_voter = email_text + ' A poll is available for you at localhost8080: ' + email.voter_url;
    var voterEmail = {
      from: 'Decision Maker <postmaster@sandbox0229991348f842509ff15dab0913c399.mailgun.org>',
      to: email.voter_email,
      subject: email_subject,
      text: email_text
    }

    mailgun.messages().send(voterEmail, function (error, body) {
      console.log(body);
    });
  });

  // /ADMIN EMAIL///
  var adminEmail = {
      from: 'Decision Maker <postmaster@sandbox0229991348f842509ff15dab0913c399.mailgun.org>',
      to: email_admin,
      subject: email_subject,
      text: text_admin
    }

    mailgun.messages().send(adminEmail, function (error, body) {
      console.log(body);
    });

});


app.post('/polls/:id', (req, res) => {
})


app.listen(PORT, () => {
  console.log("Example app listening on port " + PORT);
});
