Parse.Cloud.job("ratingPush", function(request, status) {
  var users = [];
  var innerQuery = new Parse.Query("HomeServiceRequest");
  innerQuery.equalTo("status",1);
  innerQuery.exists('attendedBy');
  innerQuery.include('user');
  innerQuery.include('homeService')
  innerQuery.each(function(request) {
      
      var now = new Date();
      var attendedTime = new Date(request.get('dateForService'));
      var addedTime = attendedTime;
      addedTime = addedTime.setHours(attendedTime.getHours() + 1);
      if(now.getTime() >= addedTime){
        users.push(request.get('user'));
      }

  }).then( function() {

    console.log('users size: ' +users.length);
    var userQuery = new Parse.Query(Parse.Installation);
    userQuery.containedIn('user',users);
    Parse.Push.send({
        where: userQuery, // Set our Installation query
        data: {
        alert: "Califica el servicio "
        //homeServiceRequest: request.params.requestId
        //homeServiceRequest: request.params.requestId
        }
    },{ success: function() {
          // Push was successful
            console.log("Push was successful");
            status.success("Push enviado");
      },error: function(error) {
          // Handle error
          console.error("Push error: " + error.code + " : " + error.message);
          status.error("Uh oh, something went wrong." + error.code + " : " + error.message);
        }
      });
    
  },function(error) {
    // Set the job's error status
    status.error("Uh oh, something went wrong." + error.code + " : " + error.message);
  });
});