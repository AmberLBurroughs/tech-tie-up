  $('[data-toggle="tooltip"]').tooltip();   


  var titleInput = $("#new-title");
  var bodyInput = $("#new-body");
  var postForm = $("#create-post");
  var postUser = $("#new-post-user");
  var postCategory = $("#new-post-category");

  $(".choice-bttn").on("click", toggleChoices);
  // add fade in 
  // toggle on cancel form "button"
  function toggleChoices(){
    $(".new-post-wrap").removeClass("hide");
    $(".user-choices-wrap").addClass("hide");
  }

  // create new post
$(postForm).on("submit", handlePostSubmit);
  function handlePostSubmit(e) {
    e.preventDefault();
    if (!titleInput.val().trim() || !bodyInput.val().trim()) {
      return;
    }

    var newPost = {
      title: titleInput
        .val()
        .trim(),
      body: bodyInput
        .val()
        .trim(),
      userId: postUser.attr("data-userId").trim(),
      categoryId: postCategory.attr("data-categoryId").trim(),
    };
    
    //console.log(newPost);

    $.post(`/user/${newPost.userId}/post`, newPost, function(data) {
      console.log("success", data);
      console.log(data.post);
      //console.log("success", data.success.username);
      var postHTML = `<div class="panel-group" data-postID="${data.post.id}" data-ownerId="${data.post.User.id}">
          <div class="panel panel-default">
            <div class="panel-heading">
            <div class="panel-title">
              <div class="row">
                <div class="col-md-2">
                    <div class="post-user-image">
                      <img src="${data.post.User.image}">
                    </div>
                    <h4><strong>${data.username}</strong></h4>
                </div>
                <div class="col-md-10">
                  <h4>${data.post.title}
                    <a data-toggle="collapse" href="#collapse${data.post.id}" class="post-toggle">+</a>
                  </h4>
                </div>
              </div>
            </div>
            </div>
            <div id="collapse${data.post.id}" class="panel-collapse collapse">
              <div class="panel-body">${data.post.body}</div>
            </div>
            <div class="panel-footer">
              <em>${data.post.createdAtStr}<em>
              <span class="hide post-extras">|<a class="upvote-counter" value=${data.post.likes}>${data.post.likes}&nbsp;⇪</a> | <a class="save-post">save post</a> | <a href="/post/${data.post.id}">view thread</a></span>
            </div>
          </div>
        </div>`


      // `<div class="panel-group" data-postID="${data.post.id}">
      //   <div class="panel panel-default">
      //     <div class="panel-heading">
      //       <h4 class="panel-title">
      //       ${data.post.title}<a data-toggle="collapse" href="#collapse${data.post.id}">+</a>
      //       </h4>
      //     </div>
      //     <div id="collapse${data.post.id}" class="panel-collapse collapse">
      //       <div class="panel-body">${data.post.body}</div>
      //     </div>
      //     <div class="panel-footer"><strong>${data.username}</strong> | <em>${data.post.createdAtStr}</em></div>
      //   </div>
      // </div>`


      /*

      */
     // console.log("\n", postHTML);
      $("form").trigger("reset");
      $(".new-post-wrap").addClass("hide");
      $(".user-choices-wrap").removeClass("hide");
      $("#post-feed").prepend(postHTML);
      $(".post-toggle").on("click", function(e){
        $(this).parents(".panel-group").find(".post-extras").toggleClass("hide");
      });
    });
}



// only target current post
$(".post-toggle").on("click", function(e){
  $(this).parents(".panel-group").find(".post-extras").toggleClass("hide");
});



  // like counter function


$(".upvote-counter").on("click", function() {
    //var postLikes = $(".upvote-counter");
    var postID = $(this).parents(".panel-group");

    //var postLikeButtonID;

    var postLikes = ($(this).text().trim()).split(" ");

    postLikes = parseInt(postLikes);
 


    console.log(postLikes);

    var someID = postID.attr("data-postID")
    var buttonClicked = this;
    $.ajax({
          type: "PUT",
          url: "/post/" + someID,
          dataType: "json",
          data: {likes: postLikes}
    }).done(function(data){
      console.log(data);
      var likeTotal = parseInt(postLikes) + parseInt(data);

      $(buttonClicked).text(likeTotal + " ⇪");
      $(buttonClicked).attr("value", likeTotal);
      //<a class="upvote-counter" value=${data.post.likes}>${data.post.likes}&nbsp;⇪</a>

    });

});








  // save post to user 
// $(".save-post").on("click", function(){
//   var postToSave = { post:$(this).parents(".panel-group").attr("data-postID")};
//   console.log(postToSave, currentUser);
//   var route = "api/user";
//     route += $(this).data("id");
//     route += "?_method=PUT";
//     $.post(route, postToSave, function(response) {
//       if(response) {
//         console.log(response);
//       }
//     })
// })