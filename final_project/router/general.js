const express = require('express');
let books = require("./booksdb.js");
const { resolve } = require('path');
const { promises } = require('dns');
const { rejects } = require('assert');
const { error } = require('console');
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
async function fetchBooksAsync() { 
  return new Promise ((resolve) =>{
    setTimeout(()=>{
      resolve(books);
    },2000);
  });
}

public_users.get('/', async(req,res)=>{
  try {
    const booklist = await fetchBooksAsync();
    res.json(booklist);
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to fetch the Book!');
  }
});


// Get book details based on ISBN
function findBookByISBN (isbn){
  return new Promise ((resolve,reject)=>{
    const book = books[isbn];

    if(book){
      resolve(book);
    } else {
      reject(new Error("Book not found!"));
    }
  });
}

public_users.get('/isbn/:isbn',function (req, res){
  const isbn = req.params.isbn;

  findBookByISBN (isbn)
  .then(book =>{
    res.json(book);
  })
  .catch(error =>{
    console.error(error);
    res.status(404).send(error.message);
  });
});


  
// Get book details based on author
function findBookByAuthor (authorTofind) {
  return new Promise ((resolve,reject)=>{
    let matchingAuthor = [];

    for (let id in books){
      if(books[id].hasOwnProperty('author') && books[id].author === authorTofind){
        
        matchingAuthor.push(books[id]);
      }
    }
    if(matchingAuthor.length >0){
      resolve(matchingAuthor);
    }
    else {
      reject (new Error ('No Book Found For this Author!'));
    }
  });
}

public_users.get('/author/:author',function (req, res) {
  const authorTofind = req.params.author;

  findBookByAuthor (authorTofind)
  .then(matchingAuthor =>{
    res.send(JSON.stringify(matchingAuthor,null,4));
  })
  .catch(error =>{
    console.error(error)
    res.status(404).send(error.message);
  })
});


// Get all books based on title
function findBookByTitle (titleTofind){
  return new Promise((resolve,reject)=>{
    let matchingTitle = [];

    for(let id in books) {
      if(books[id].hasOwnProperty('title') && books[id].title === titleTofind) {
        matchingTitle.push(books[id]);
      }
    }
    if(matchingTitle.length > 0) {
        resolve(matchingTitle);
    }
      else {
        reject (new Error('Book not found on the title'));
    }
  });
}

public_users.get('/title/:title',function (req, res){
  const titleTofind = req.params.title;

  findBookByTitle(titleTofind)
  .then(matchingTitle =>{
    res.send(JSON.stringify(matchingTitle,null,4));
  })
  .catch(error =>{
    console.error(error)
    res.status(404).send(error.message);
  })
});

//  Get book review
function findBookReview (isbn){
  return new Promise ((resolve,reject) =>{
    const book = books[isbn];

    if(book) {
      resolve(book);
    }
    else {
      reject(new Error('The book not found on this ISBN'));
    }
  });
}

public_users.get('/review/:isbn',function (req, res){
  const isbn = req.params.isbn;

  findBookReview(isbn)
  .then(book =>{
    res.json(book);
  })
  .catch((error)=>{
    console.error(error);
    res.status(404).send(error.message);
  })
});




module.exports.general = public_users;
