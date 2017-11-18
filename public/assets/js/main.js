
$(document).ready(function() {

   var getLoc = window.location.href;
   var currentLocarr = getLoc.split("33");
   var currentLoc = currentLocarr[1];
 
   $("#currentLocation1, #currentLocation2").attr("value", currentLoc);



  $('#user-password, #confirm-password').on('keyup', function () {
    if ($('#user-password').val() == $('#confirm-password').val()) {
        $('#password-message').html('√').css('color', 'green');
        $('#signup-submit').removeAttr('disabled');
        $('#signup-submit').removeClass('disabled')
  } else 
      $('#password-message').html('X').css('color', 'red');
      $('#signup-submit').attr("disabled");
      $('#signup-submit').removeClass('disabled');
  });
 


  $("#signup-btn").on("click", showSignupForm);
  function showSignupForm(){
    $("#signup-form, #signin-form").trigger("reset");
    $("#signinWap").addClass("hide");
    $("#signupWrap").removeClass("hide");
  }

  $("#accountModal .close").on("click", resetAccountModal);
  function resetAccountModal(){
    $("#signup-form, #signin-form").trigger("reset");
    $("#signinWap").removeClass("hide");
    $("#signupWrap").addClass("hide");
  }
});

