fetch('data.json').then(res => res.json()).then(data => initialize(data));

var comments;
var curUser;
var commentsDivArray = Array();
let body = document.querySelector('body');
var district=0;

function createContainer(comment){
  let containerDiv = document.createElement("div");
  containerDiv.setAttribute("class", "container");
  let commentDiv = document.createElement("div");
  commentDiv.setAttribute("class", "comment");
  let replyDiv = document.createElement("div");
  replyDiv.setAttribute("class", "no-reply");
  let repliesDiv = document.createElement("div");
  repliesDiv.setAttribute("class", "replies");
  
  //commentDiv
  let infoDiv = document.createElement("div");
  infoDiv.setAttribute("class", "info");
  let userImg = document.createElement("img");
  userImg.setAttribute("src", comment.user.image.png);
  let nameDiv = document.createElement("div");
  nameDiv.setAttribute("class", "name");
  nameDiv.innerHTML = comment.user.username;
  let createdAtDiv = document.createElement("div");
  createdAtDiv.setAttribute("class", "createdAt");
  createdAtDiv.innerHTML = comment.createdAt;
  infoDiv.appendChild(userImg);
  infoDiv.appendChild(nameDiv);
  if(comment.user.username==curUser.username){
    let youDiv = document.createElement("div");
    youDiv.setAttribute("class", "you");
    youDiv.innerHTML="you";
    infoDiv.appendChild(youDiv);
  }
  infoDiv.appendChild(createdAtDiv);
  let scoreDiv = document.createElement("div");
  scoreDiv.setAttribute("class", "score");
  let plusDiv = document.createElement("div");
  plusDiv.setAttribute("class", "plus");
  let numDiv = document.createElement("div");
  numDiv.setAttribute("class", "num");
  numDiv.innerHTML=comment.score;
  let minusDiv = document.createElement("div");
  minusDiv.setAttribute("class", "minus");
  scoreDiv.appendChild(plusDiv);
  scoreDiv.appendChild(numDiv);
  scoreDiv.appendChild(minusDiv);
  let textDiv = document.createElement("div");
  textDiv.setAttribute("class", "text");
  if(comment.replyingTo){
    textDiv.innerHTML = "<span>@"+comment.replyingTo+"</span>"+comment.content;
  }
  else{
    textDiv.innerHTML = comment.content;
  }
  commentDiv.appendChild(infoDiv);
  commentDiv.appendChild(scoreDiv);
  if(comment.user.username!=curUser.username){
    let replyBtnDiv = document.createElement("div");
    replyBtnDiv.setAttribute("class", "reply-btn");
    let replyBtnImg = document.createElement("img");
    replyBtnImg.setAttribute("src", "images/icon-reply.svg");
    replyBtnDiv.appendChild(replyBtnImg);
    replyBtnDiv.appendChild(document.createTextNode("Reply"));
    commentDiv.appendChild(replyBtnDiv);
    replyBtnDiv.addEventListener("click", function(){
      if(replyDiv.getAttribute("class")=="reply") replyDiv.setAttribute("class", "no-reply");
      else replyDiv.setAttribute("class", "reply");  
    });
  }
  else{
    let delEditDiv = document.createElement("div");
    delEditDiv.setAttribute("class", "del-edit");
    let delDiv = document.createElement("div");
    delDiv.setAttribute("class", "delete");
    let delImg = document.createElement("img");
    delImg.setAttribute("src", "images/icon-delete.svg");
    delDiv.appendChild(delImg);
    delDiv.appendChild(document.createTextNode("Delete"));
    let editDiv = document.createElement("div");
    editDiv.setAttribute("class", "edit");
    let editImg = document.createElement("img");
    editImg.setAttribute("src", "images/icon-edit.svg");
    editDiv.appendChild(editImg);
    editDiv.appendChild(document.createTextNode("Edit"));
    editDiv.addEventListener("click", function(){
      commentDiv.style.display="none";
      let editingDiv = document.createElement("div");
      editingDiv.setAttribute("class", "reply");
      let curUserImg = document.createElement("img");
      curUserImg.setAttribute("src", curUser.image.png);
      let textArea = document.createElement("textarea");
      textArea.value = comment.content;
      let updateBtn = document.createElement("button");
      updateBtn.innerHTML = "UPDATE";
      editingDiv.appendChild(curUserImg);
      editingDiv.appendChild(textArea);
      editingDiv.appendChild(updateBtn);
      containerDiv.prepend(editingDiv);
      updateBtn.addEventListener("click", function(){
        comment.content = textArea.value;
        containerDiv.removeChild(editingDiv);
        if(comment.replyingTo){
          textDiv.innerHTML = "<span>@"+comment.replyingTo+"</span>"+comment.content;
        }
        else{
          textDiv.innerHTML = comment.content;
        }
        commentDiv.style.display="grid";
      });
    });
    delDiv.addEventListener("click", function(){
      document.querySelector(".modal-background").style.display="flex";
      document.querySelector(".no-del").addEventListener("click", function(){
        document.querySelector(".modal-background").style.display="none";
      });
      document.querySelector(".yes-del").addEventListener("click", function(){
        if(comment.isDelete==true) return;
        comment.isDelete=true;
        document.querySelector(".modal-background").style.display="none";
        let parReplies = containerDiv.parentNode;
        let parentComment = comment.parent;
        if(parentComment==""){
          commentsDivArray.splice(commentsDivArray.indexOf(containerDiv), 1);
          comments.splice(comments.indexOf(comment), 1);
        }
        else{
          parentComment.replies.splice(parentComment.replies.indexOf(comment), 1);
        }
        parReplies.removeChild(containerDiv);
        containerDiv=null;
      });
    });
    delEditDiv.appendChild(delDiv);
    delEditDiv.appendChild(editDiv);
    commentDiv.appendChild(delEditDiv);
  }
  commentDiv.appendChild(textDiv);

  //replyDiv
  let curUserImg = document.createElement("img");
  curUserImg.setAttribute("src", curUser.image.png);
  let textArea = document.createElement("textarea");
  textArea.setAttribute("placeholder", "Add a reply...");
  let replyBtn = document.createElement("button");
  replyBtn.innerHTML = "REPLY";
  replyDiv.appendChild(curUserImg);
  replyDiv.appendChild(textArea);
  replyDiv.appendChild(replyBtn);

  containerDiv.appendChild(commentDiv);
  containerDiv.appendChild(replyDiv);
  containerDiv.appendChild(repliesDiv);

  // for score
  plusDiv.addEventListener("click", function(){
    numDiv.innerHTML=Number(numDiv.innerHTML)+1;
    comment.score++;
    reordering();
  });
  minusDiv.addEventListener("click", function(){
    numDiv.innerHTML=Number(numDiv.innerHTML)-1;
    comment.score--;
    reordering();
  });
  // for add reply
  replyBtn.addEventListener("click", function(){
    console.log(comment);
    let newReply={content: textArea.value, parent: comment, createdAt: "today", score: 0, replyingTo: comment.user.username, replies: [], user: curUser};
    comment.replies.push(newReply);
    repliesDiv.appendChild(createComment(newReply));
    replyDiv.setAttribute("class", "no-reply");
  });
  return containerDiv;
}

function createComment(comment){
  let containerDiv = createContainer(comment);
  let repliesDiv = containerDiv.lastChild;
  for(let i=0; i<comment.replies.length; i++){
    comment.replies[i].parent=comment;
    let replyContainerDiv = createComment(comment.replies[i]);
    repliesDiv.appendChild(replyContainerDiv);
  }
  return containerDiv;
}

function initialize(data){
  comments=data.comments;
  curUser=data.currentUser;
  document.querySelector('.add-img').setAttribute("src", curUser.image.png);
  document.querySelector('.send').addEventListener("click", function(){
    let content=document.querySelector('.add-text');
    let newComment={content: content.value, parent: "", createdAt: "today", score: 0, replyingTo: '', replies: [], user: curUser};
    content.value="";
    let div=createComment(newComment);
    comments.push(newComment);
    commentsDivArray.push(div);
    body.appendChild(div);
    console.log(comments);
    reordering();
  });
  for(let i=0; i<comments.length; i++){
    comments[i].parent="";
    let div=createComment(comments[i]);
    commentsDivArray.push(div);
    body.appendChild(div);
  }
  reordering();
  console.log(comments);
}

function reordering(){
  let data=[];
  for(let i=0; i<comments.length; i++){
    data.push([comments[i].score, i]);
  }
  data.sort(function(a, b){
    if(a[0]>b[0]) return -1;
    return 1;
  });
  for(let i=0; i<comments.length; i++){
    commentsDivArray[data[i][1]].style.order=i;
  }
}