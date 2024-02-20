const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{
  let userExist = users.filter((user)=>{
    return user.username === username
  });
  if(userExist.length>0){
    return true;
  } else {
    return false;
  }
}

const authenticatedUser = (username,password)=>{
  let permitusers = users.filter((users)=>{
    return (users.username ===username && users.password === password)
  });
  if(permitusers.length > 0){
    return true;
  } else {
    return false;
  }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if(!username || !password){
    return res.status(400).json({message:"Error logging in"});
  } 

  if(authenticatedUser(username,password)){
    let accessToken = jwt.sign({
      data:password
    },'access',{expiresIn:60*60});

    req.session.authorization = {
      accessToken,username
    }
    return res.status(200).send("User successfully logged in");
  } else{
    return res.status(401).json({message: "Invalid Login. Check username and password"});
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res)=> {
  const { isbn } = req.params;
  const { username, comment } = req.body;

  if(!books[isbn]){
    return res.status(404).send("Book not exist");
  }

  if(!req.session || !req.session.authorization || !req.session.authorization.username){
    return res.status(403).send("Please login to give a review");
  }
  if( req.session.authorization.username !== username) {
    return res.status(403).send("You only allowed add or update your own reviews");
  }

  const bookReviews = books[isbn].reviews;
  bookReviews[username]=comment;

  return res.status(200).json({message:"Review added/updated successfully"});
});

regd_users.delete("/auth/reviewdelete/:isbn", (req,res)=>{
  const { isbn } = req.params;
  
  if(!books[isbn]){
    return res.status(404).send("Book not exist");
  }

  if(!req.session || !req.session.authorization || !req.session.authorization.username){
    return res.status(403).send("Please login");
  }

  const username = req.session.authorization.username;
  const bookReviews = books[isbn].reviews;

  if(!bookReviews[username]){
    return res.status(404).send("Review not found");
  }

  
  delete bookReviews[username]

  return res.status(200).json({message:"Review deleted successfully"});
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
