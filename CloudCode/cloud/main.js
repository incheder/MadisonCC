
// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
/*Parse.Cloud.define("hello", function(request, response) {
  response.success("Hello world!");
});*/

Parse.Cloud.define("sendPushToClient", function(request, response) {
  var query = new Parse.Query(Parse.Installation);
  query.equalTo('channels', 'Client');
  query.equalTo("user", request.params.client);
  Parse.Push.send({
  		where: query, // Set our Installation query
  		data: {
    		alert: "Confirmacion de servicio",
    		date: request.params.date
    		//homeServiceRequest: request.object.id
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
});


Parse.Cloud.afterSave("HomeServiceRequest", function(request) {
	var query = new Parse.Query(Parse.Installation);
	console.log(request.object.get("homeService"));
	query.equalTo('homeService', request.object.get("homeService"));
	//console.log("requestID: " + request.object.id);
	Parse.Push.send({
  		where: query, // Set our Installation query
  		data: {
    		alert: "Willie Hayes injured by own pop fly.",
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
  
});
