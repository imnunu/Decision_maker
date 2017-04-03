// ----- VOTE STATUS PAGE


  //User is presented with
    // - Decision Admin Email; Decision Admin Name (optional); and Decision Title texts (not editable);
    // - List of Participants for the Poll

  // There is Auto Referesh Functionality Bult-In for Update every 5 seconds?

  // Page will display how many minutes / seconds are left for the poll to end.
  // If the poll has ended, the page will display that the poll has ended
  // This will be a Single Page Refresh Page that Will Make AJAX calls to the server every 5 seconds to update the number of Votes in the Poll
function determineProgressBarRank (inputArray, value) {
  rank = inputArray.length;
  for (var i=0; i < inputArray.length; i++) {
    if (inputArray[i] < value) {
      rank--;
    }
  }
  // console.log(inputArray, value, rank)
  return rank;
}


$(() => {


  setInterval(() => {
    console.log('Refreshed');

      $.ajax({
        method: 'GET',
        url: '/result/' + adminURL + '/json'
      }).done(function (voteChoices) {

        //DUMMY DATA To Test Front End Logic
        // var voteChoices = [
        //   {
        //     admin_email: "ben@mail.com",
        //     admin_image_path: null,
        //     admin_name: "Ben Li",
        //     admin_url: "4xsiqwy0v6efkervbb4u",
        //     decision_id: 22,
        //     decision_title: "How should I go home today?",
        //     description: "I could take the public bus",
        //     id: 18,
        //     message: "This is a poll to help Ben decide how he should go home today.",
        //     option_image_path: null,
        //     time: 1491172183,
        //     title: "Bus",
        //     total_rank: 1,
        //     voter_email: "vinay@mail.com",
        //     voter_image_path: null,
        //     voter_name: null,
        //     voter_url: "lgfr3xiziqt5c6bt3g1r"
        //   },
        //   {
        //     admin_email: "ben@mail.com",
        //     admin_image_path: null,
        //     admin_name: "Ben Li",
        //     admin_url: "4xsiqwy0v6efkervbb4u",
        //     decision_id: 22,
        //     decision_title: "How should I go home today?",
        //     description: "Should I take the Skytrain?",
        //     id: 20,
        //     message: "This is a poll to help Ben decide how he should go home today.",
        //     option_image_path: null,
        //     time: 1491172183,
        //     title: "Train",
        //     total_rank: 2,
        //     voter_email: "vinay@mail.com",
        //     voter_image_path: null,
        //     voter_name: null,
        //     voter_url: "lgfr3xiziqt5c6bt3g1r"
        //   },
        //   {
        //     admin_email: "ben@mail.com",
        //     admin_image_path: null,
        //     admin_name: "Ben Li",
        //     admin_url: "4xsiqwy0v6efkervbb4u",
        //     decision_id: 22,
        //     decision_title: "How should I go home today?",
        //     description: "I can bike if the weather is good",
        //     id: 21,
        //     message: "This is a poll to help Ben decide how he should go home today.",
        //     option_image_path: null,
        //     time: 1491172183,
        //     title: "Bike",
        //     total_rank: 3,
        //     voter_email: "vinay@mail.com",
        //     voter_image_path: null,
        //     voter_name: null,
        //     voter_url: "lgfr3xiziqt5c6bt3g1r"
        //   }

        // ];

        var voteArray = [];
        console.log('Connection to server via ajax Get reuqest was successful');
        for (var i=0; i<voteChoices.length; i++) {
          //console.log(voteChoices[i]);
            voteArray.push(voteChoices[i]);
          }


        var decisionObject = voteArray[0];


          var numberOfVoters = 0;
          var uniqueVoterURLArray = [];

          for (var i = 0; i < voteArray.length; i++) {
            if (uniqueVoterURLArray.includes(voteArray[i].voter_url) === false) {
              uniqueVoterURLArray.push(voteArray[i].voter_url);
              numberOfVoters++;
            }
          }


          var numberOfOptions = 0;
          var uniqueOptionIdArray = [];
          var optionObjectArray = [];

          for (var i = 0; i < voteArray.length; i++) {
            if (uniqueOptionIdArray.includes(voteArray[i].id) === false) {
              var optionObject = {
                option_id: voteArray[i].id,
                title: voteArray[i].title,
                total_rank: voteArray[i].total_rank
              };
              uniqueOptionIdArray.push(voteArray[i].id);
              optionObjectArray.push(optionObject);
              numberOfOptions++;
            }
          }

          var statusBarIncrement = 100 / numberOfOptions;

          $('.decision-admin-name-display').text(decisionObject.admin_name);
          $('.decision-admin-email-display').text(decisionObject.admin_email);
          $('.decision-title-display').text(decisionObject.decision_title);
          $('.decision-message-display').text(decisionObject.message);

          $('.voter-count').text(numberOfVoters);

          var resultWrapper = $('#resultWrapper');
          var rankValuesArray = [];

          for (var i=0; i < optionObjectArray.length; i++) {
            rankValuesArray.push(optionObjectArray[i].total_rank);
          }


          for (var i=0; i < optionObjectArray.length; i++) {
            console.log('Length of optionObjectArray is: ' + optionObjectArray.length);
            console.log(optionObjectArray[i]);

            var divClass = '"progress-bar progress-bar-info"';

            if ((determineProgressBarRank(rankValuesArray, optionObjectArray[i].total_rank)) === numberOfOptions) {
              divClass = '"progress-bar progress-bar-success"';
            }

            resultWrapper.append('<h3 class="option-title-display" id="' + optionObjectArray[i].id + '">' + optionObjectArray[i].title + '</h3><div class="progress progress-striped" style="margin-bottom: 9px;"><div class=' + divClass + ' style="width: ' + Math.round(determineProgressBarRank(rankValuesArray, optionObjectArray[i].total_rank)*statusBarIncrement) + '%"></div></div>');

          }

        //this is the code to make the ajax call with update poll status every 1 second
        // setInterval(() => {
        //   console.log('Refreshed');
        // }, 1000);

      });

  }, 1000);

});

