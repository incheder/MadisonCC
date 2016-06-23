Parse.Cloud.define("sendServiceCompletedPush", function(request, response) {
  var userQuery = new Parse.Query(Parse.User);
  userQuery.equalTo("objectId",request.params.userId ); 

  var query = new Parse.Query(Parse.Installation);
  query.equalTo('channels', 'Client');
  //query.equalTo("user", request.params.client);
  query.matchesQuery('user', userQuery);
  Parse.Push.send({
      where: query, // Set our Installation query
      data: {
        alert: "Servicio Completo",
        homeServiceRequest: request.params.requestId,
        isComplete: true,
        homeServiceName: request.params.homeServiceName,
        attendedByAvatar: request.params.avatarUrl

      }
  }, {
      success: function() {
      // Push was successful
        console.log("Push was successful");
        response.success("Push was successful");
      },
      error: function(error) {
      // Handle error
      console.error("Push error: " + error.code + " : " + error.message);
      response.error("Push error: " + error.code + " : " + error.message);
      }
  });
});

Parse.Cloud.define("sendCancelServicePushToUser", function(request, response) {
  var userQuery = new Parse.Query(Parse.User);
  userQuery.equalTo("objectId",request.params.userId ); 

      //response.success("Push was successful");

      Parse.Push.send({
        where: userQuery, // Set our Installation query
        data: {
        alert: "El servicio ha sido cancelado " + post.get('homeService').get('name') 
        //homeServiceRequest: request.params.requestId
          //homeServiceRequest: request.params.requestId
          }
        },  {
        success: function() {
          // Push was successful
            console.log("Push was successful");
            response.success("Push was successful");
        },
          error: function(error) {
          // Handle error
          console.error("Push error: " + error.code + " : " + error.message);
          response.error("Push error: " + error.code + " : " + error.message);
        }
      });
  
    },
    error: function(error) {
         console.error("Got an error canceling service" + error.code + " : " + error.message);
          response.error("Got an error canceling service: " + error.code + " : " + error.message);
    }
  });
 
});
 