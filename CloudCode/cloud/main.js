
// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
/*Parse.Cloud.define("hello", function(request, response) {
  response.success("Hello world!");
});*/

Parse.Cloud.afterSave("Review", function(request) {
	query = new Parse.Query("HomeServiceRequest");
	query.include("homeService");
	query.get(request.object.get("homeServiceRequest").id, {
		success: function(post) {
			post.set("wasRated",true);
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
