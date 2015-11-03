
// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
Parse.Cloud.define("hello", function(request, response) {
  response.success("Hello world!");
});

Parse.Cloud.afterSave("Review", function(request) {
  query = new Parse.Query("Review");
  query.equalTo("homeService",request.object.get("homeService"));
  query.find({
    success: function(results) {
    	var average = 0;
	    for (var i = 0; i < results.length; i++) {
	      	var object = results[i];
	      	average = average + object.get("numStars");

	      	
	    }
	    average = average / results.length;
	    console.log(request.object.get("homeService").id);
	    //alert(average);

		query = new Parse.Query("HomeServices");
		  query.get(request.object.get("homeService").id, {
		    success: function(post) {
		      post.set("stars",average);
		      post.set("comments",results.length);
		      post.save();
		       console.error("SAVED");
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
});
