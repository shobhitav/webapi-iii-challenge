const express = require('express');
const postDb = require('./posts/postDb.js');
const userDb = require('./users/userDb.js');


const server = express();
// request method, request url, and a timestamp
server.use(express.json());  //parse request body as JSON

server.use(logger);


server.get('/', (req, res) => {
  res.send(`<h2>Let's write some middleware!</h2>`)
});

// 1. GET for /api/users
server.get('/api/users',(request,response) => 
    {
        userDb
        .get()
        .then(users => response.status(200).json(users))
        .catch(err => response.status(500).json({sucess:false,err}))
    }
)

// 2. GET for /api/users/id
server.get('/api/users/:id',validateUserId,(request,response) =>
    {
      response.status(200).json(request.user)
    }
) 
// 3. POST for /api/users
server.post('/api/users',validateUser,(request,response) => 
    {
        const usersInfo = request.body;

        userDb
        .insert(usersInfo)
        .then(users => response.status(201).json({sucess:true,users}))
        .catch(err => response.status(500).json({sucess:false,err}))
    }
) 

// 4. POST for /api/posts
server.post('/api/posts', validatePost, (request,response) => 
    {
        const postInfo = request.body;
 console.log(postInfo);
        postDb
        .insert(postInfo)
        .then(posts => response.status(201).json({sucess:true,posts}))
        .catch(err => response.status(500).json({sucess:false,err}))
    }
) 

// 5. GET for /api/posts
server.get('/api/posts',(request,response) => 
    {
        postDb
        .get()
        .then(posts => response.status(200).json(posts))
        .catch(err => response.status(500).json({sucess:false,err}))
    }
)

// 6. DELETE for /api/users
server.delete('/api/users/:id',validateUserId, (request,response) => {
    const {id}= request.params;
    userDb.remove(id)
    .then( deleted => {
        if (deleted){
        response.status(204).end();
        } else{
        response.status(404).json({sucess:false,message:" Could not find the user you were looking for !"})        }
    })
    .catch(err => response.status(500).json({sucess:false,err}))
})

// 7. UPDATE for /api/users
server.put('/api/users/:id',validateUserId, (request,response) => {
 const {id}= request.params;
 const usersInfo = request.body;
 console.log(usersInfo);

 userDb.update(id,usersInfo)
   .then(updated => {
     if (updated){
   response.status(200).json({sucess:true,updated})
     }else{
        response.status(404).json({sucess:false,message:" Could not find the user you were looking for !"})  
     }
   })
   .catch(err => response.status(500).json({sucess:false,err}))
 
 })

//%%%%%%%%%%%%%%%%%%%%%   CUSTOM MIDDLEWARE  %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// 1. logger
function logger(req, res, next) {
  let mytime = new Date();
  console.log(`${req.method},${req.path},${mytime} ) `)
  next();
};

// 2. validateUserId
async function validateUserId(req,res,next) {
 const  {id}= req.params;
 const user= await userDb.getById(id);
 if (user){
 req.user=user;
 next();
 } else{
 res.status(400).json({message:"invalid user id"})
 }
}

// 3. validateUser
function validateUser(req,res,next) {
  if(req.body.constructor === Object && Object.keys(req.body).length === 0) {
    res.status(400).json({ message: "missing user data" });
  } else {
    if(req.body.name) {
      next();
    } else {
      res.status(400).json({ message: "missing required name field" });
    }
  }
}

// 4. validatePost()
function validatePost(req,res,next) {
  if(req.body.constructor === Object && Object.keys(req.body).length === 0) {
    res.status(400).json({ message: "missing post data" });
  } else {
    if(req.body.text) {
      // console.log(postInfo);
      next();
    } else {
      res.status(400).json({ message: "missing required text field" });
    }
  }
}

module.exports = server;
