$("#updateProfile").on("click", function(){
	$("#profile-info-update").removeClass("hide");
	$("#updateProfile").addClass("hide");
});

$("#update-profile").on("submit", function(e){
	e.preventDefault();
	

var username_ = $("#profile-username").val().trim();
var fullname_ = $("#profile-name").val().trim();
var location_ = $("#profile-location").val().trim();


var profileData = {
		username: null,
		fullname: null,
		location: null
	}

	if(username_.legth === 0){
		console.log("inside if username");
		profileData.username = $("#profile-username").attr("data-defualt-username");
	} else{
		profileData.username = $("#profile-username").val().trim();
	}

	if(fullname_.legth === 0){
		console.log("inside if name");
		profileData.fullname = $("#profile-name").attr("data-defualt-name");
	} else{
		profileData.fullname = $("#profile-name").val().trim();
	}

	if(location_.legth === 0){
		console.log("inside if location");
		profileData.location = $("#profile-location").attr("data-defualt-location");
	} else{
		profileData.location = $("#profile-location").val().trim();
	}

console.log("result ", profileData);


	// var route = "/account/profile";
 //  route += "?_method=PUT";
 //  $.post(route, profileData, function(response) {
 //    if(response) {
 //      console.log(response);
 //    }
 //  })
 $.ajax({
        type: "PUT",
        url: "/account/profile",
        dataType: "json",
        data: profileData
    }).done(function(data){
    	console.log(data);
    	window.location.reload();
    })
});
