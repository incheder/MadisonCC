require('cloud/jobs');
require('cloud/cloudFunctions');
// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
/*Parse.Cloud.define("hello", function(request, response) {
  response.success("Hello world!");
});*/

//actuakizar el estado del request una vez respondido
Parse.Cloud.define("sendPushToEmployee", function(request, response) {
  var userQuery = new Parse.Query(Parse.User);
  userQuery.equalTo("objectId",request.params.employeeId ); 

  var query = new Parse.Query(Parse.Installation);
  query.equalTo('channels', 'Employee');
  //query.equalTo("user", request.params.client);
  query.matchesQuery('user', userQuery);
  Parse.Push.send({
      where: query, // Set our Installation query
      data: {
        alert: "Nueva solicitud de servicio",
        homeServiceRequest: request.params.requestId
        //homeServiceRequest: request.params.requestId
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


Parse.Cloud.define("sendPushToClient", function(request, response) {
  var userQuery = new Parse.Query(Parse.User);
  userQuery.equalTo("objectId",request.params.client ); 

  var query = new Parse.Query(Parse.Installation);
  query.equalTo('channels', 'Client');
  //query.equalTo("user", request.params.client);
  query.matchesQuery('user', userQuery);
  Parse.Push.send({
  		where: query, // Set our Installation query
  		data: {
    		alert: request.params.homeServiceName + " atenderá el servicio el " + request.params.date,
    		date: request.params.date,
        title: "Confirmación de servicio",
        problemDescription: request.params.problemDescription,
        imageUrl: request.params.imageUrl,
        attendedBy: request.params.attendedBy,
        homeServiceName: request.params.homeServiceName,
        attendedByAvatar: request.params.attendedByAvatar
    		//homeServiceRequest: request.params.requestId
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


Parse.Cloud.afterSave("HomeServiceRequest", function(request) {

  if(request.object.get("status") == 0){
        console.log("provider "+ request.object.get("serviceProvider"));
        var providerQuery = new Parse.Query(Parse.User);
        providerQuery.equalTo("objectId",request.object.get("serviceProvider") ); 


        var query = new Parse.Query(Parse.Installation);
        query.equalTo("channels","Partner");
        //console.log("request "+ request);
        //var mHomeService = Parse.Object.extend("HomeServices");
        //var mHomeService = request.object.get("homeService").get("name");
        //console.log("homeService "+mHomeService);
        //console.log("service provider "+ mHomeService.object.get("serviceProvider"));

        query.matchesQuery("user",providerQuery);
        //console.log("requestID: " + request.object.id);
        
        Parse.Push.send({
            where: query, // Set our Installation query
            data: {
              alert: "Nueva solicitud de servicio",
              homeServiceRequest: request.object.id
            }
        }, {
            success: function() {
            // Push was successful
              console.log("Push was successful");
            },
            error: function(error) {
            // Handle error
            console.error("Push error: " + error.code + " : " + error.message);
            }
        });

        }

});

Parse.Cloud.afterSave("Review", function(request) {
	query = new Parse.Query("HomeServiceRequest");
	query.include("homeService");
	query.get(request.object.get("homeServiceRequest").id, {
		success: function(post) {
			post.set("wasRated",true);
			post.set("rating",request.object.get("numStars"));
		    post.save();
		    console.log("REQUEST RATED");
		    averageRatings(post.get("homeService"));
        //averageRatingsForPartner(post.get("attendedBy"));
		},
		error: function(error) {
		     console.error("Got an error saving average" + error.code + " : " + error.message);
		}
	});


function averageRatings(homeServiceID){

  innerQuery = new Parse.Query("HomeServiceRequest");
  innerQuery.equalTo("homeService",homeServiceID);
  innerQuery.equalTo("wasRated",true)

  query = new Parse.Query("Review");
  query.matchesQuery("homeServiceRequest",innerQuery);
  //query.equalTo("homeService",homeServiceID);
  query.find({
    success: function(results) {
    	var average = 0;
	    for (var i = 0; i < results.length; i++) {
	      	var object = results[i];
	      	average = average + object.get("numStars");

	      	
	    }
	    //console.log(results);
	    average = average / results.length;
	   
		query = new Parse.Query("HomeServices");
		  query.get(homeServiceID.id, {
		    success: function(post) {
		      post.set("stars",average);
		      post.set("comments",results.length);
		      post.save();
		       console.log("STATS SAVED");
		    },
		    error: function(error) {
		      console.error("Got an error saving average" + error.code + " : " + error.message);
		    }
		  });

    },
    error: function(error) {
      console.error("Got an error getting reviews" + error.code + " : " + error.message);
    }
  });

}	

function averageRatingsForPartner(attendedBy){

 //var userQuery = new Parse.Query(Parse.User);
  //userQuery.equalTo("objectId",attendedBy); 

  query = new Parse.Query("Review");
  query.equalTo("attendedBy",attendedBy);
  //query.equalTo("homeService",homeServiceID);
  query.find({
    success: function(results) {
      var average = 0;
      for (var i = 0; i < results.length; i++) {
          var object = results[i];
          average = average + object.get("numStars");

          
      }
      //console.log(results);
      average = average / results.length;
     
    var userQuery = new Parse.Query(Parse.User);
    //userQuery.equalTo("objectId",attendedBy); 
      query.get(attendedBy, {
        success: function(post) {
          post.set("stars",average);
          //post.set("comments",results.length);
          post.save();
           console.log("STATS FOR PARTNER SAVED");
        },
        error: function(error) {
          console.error("Got an error saving average for partner" + error.code + " : " + error.message);
        }
      });

    },
    error: function(error) {
      console.error("Got an error getting reviews" + error.code + " : " + error.message);
    }
  });

} 
  
});

Parse.Cloud.define("sendCancelServicePushToEmployee", function(request, response) {
  var query = new Parse.Query("HomeServiceRequest");
  query.include("attendedBy");
  query.include("homeService.serviceProvider");
  query.get(request.params.requestId, {
      success: function(post) {
      var users = [];
       console.log("POST: " + post.get('homeService').get('serviceProvider').id);
      if(post.get('attendedBy').id){
          console.log("attendedBy found!!");
          users.push(post.get('attendedBy'));
      }
      if( post.get('homeService').get('serviceProvider').id) {
          console.log("service provider  found");
          users.push( post.get('homeService').get('serviceProvider'))
      }

      console.log("users: " + JSON.stringify(users));
      var userQuery = new Parse.Query(Parse.Installation);
      userQuery.containedIn('user',users);

      //response.success("Push was successful");

      Parse.Push.send({
        where: userQuery, // Set our Installation query
        data: {
        alert: "El usuario ha cancelado el servicio " + post.get('homeService').get('name') 
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


