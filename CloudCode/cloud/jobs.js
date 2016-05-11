Parse.Cloud.job("ratingPush", function(request, status) {
  var users = [];
  var innerQuery = new Parse.Query("HomeServiceRequest");
  innerQuery.equalTo("status",1);
  innerQuery.exists('attendedBy');
  
  // Set up to modify user data
  //Parse.Cloud.useMasterKey();
  //var counter = 0;
  // Query for all users
  //var query = new Parse.Query(Parse.User);
  innerQuery.each(function(request) {
      
      var now = new Date();
      var attendedTime = new Date(request.get('dateForService'));
      var addedTime = addedTime.setHours(attendedTime.getHours() + 1);
      if(now >= addedTime){
        users.push(request.get('attendedBy'));
      }
      // Update to plan value passed in
      //user.set("plan", request.params.plan);
      //if (counter % 100 === 0) {
        // Set the  job's progress status
      status.message(request.get('attendedBy')  + " user processed.");
      //}
      //counter += 1;
      //return user.save();
  }).then(function() {
    // Set the job's success status
    status.success("Migration completed successfully." + users);
  }, function(error) {
    // Set the job's error status
    status.error("Uh oh, something went wrong.");
  });
});