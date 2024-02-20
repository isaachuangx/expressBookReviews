const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if(username && password){
    if(!isValid(username)){
      users.push({"username":username,"password":password});
      return res.status(200).json({message:"User successfully registred. Now you can login"})
    }else{
      return res.status(400).json({message: "User already exists!"})
    }
  }
  return res.status(400).json({message:"Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  return res.send(JSON.stringify(books,null,4))
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
      const isbn = req.params.isbn;
      const book = books[isbn];

      if(book){
        res.json(book);
      }else{
        res.status(404).send('Book not found!')
      }
    }
 );
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const authorTofind = req.params.author;
  let matchingAuthor = [];

  for (let id in books){
    if(books[id].hasOwnProperty('author') && books[id].author === authorTofind){
      matchingAuthor = books[id];
      break;
    }
  }
  if(matchingAuthor){
    //res.json(matchingAuthor);
    res.send(JSON.stringify(matchingAuthor,null,4));
  }
  else{
    return res.status(404).send("No Books Found For This Author!");
  }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const titleTofind = req.params.title;
  let matchingTitle = [];

  for (let id in books){
    if(books[id].hasOwnProperty('title') && books[id].title === titleTofind){
      matchingTitle= books[id];
      break;
    }
  }
  if(matchingTitle){
    res.send(JSON.stringify(matchingTitle,null,4));
  }
  else{
    return res.status(404).send("No Books Found On The Title!");
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  
  if(book){
    res.json(book.review)
  } else {
    res.status(404).send('Book not found!')
  }
});

module.exports.general = public_users;
