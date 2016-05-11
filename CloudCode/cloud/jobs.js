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
      var addedTime = new Date();
      //console.log(request.get('dateForService'));
      var attendedTime = new Date(request.get('dateForService'));
      addedTime = addedTime.setHours(attendedTime.getHours() + 1);
      if(now >= addedTime){
        users.push(request.get('attendedBy'));
        status.message(request.get('attendedBy')  + " user processed.");
        console.log(request.get('attendedBy')  + " user processed.");
        console.log('users size: ' +users.length);
      }
      // Update to plan value passed in
      //user.set("plan", request.params.plan);
      //if (counter % 100 === 0) {
        // Set the  job's progress status
      
      //}
      //counter += 1;
      //return user.save();
  }).then(function() {
    // Set the job's success status
    console.log('users size: ' +users.length);
    status.success("Migration completed successfully." + users);
  }, function(error) {
    // Set the job's error status
    status.error("Uh oh, something went wrong.");
  });
});