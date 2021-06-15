const express = require('express')
const exphbs = require('express-handlebars')
const path = require('path')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const redis = require('redis')

const app = express();

// Create Redis client
const client =  redis.createClient();

client.on('connect',function(){
    console.log('conneted to redis..')
})

// Handlebars
app.engine('handlebars', exphbs({defaultLayout:'main'}));
app.set('view engine', 'handlebars');

// Body parser
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

// method override
app.use(methodOverride('_method'));


app.get('/',function(req,res){
    res.render('searchUsers')
})



// searh users in the homepage
app.post('/user/search',function(req,res,next){
    let id  = req.body.id;

    client.hgetall(id,function(err,obj){

        if(!obj){
            res.render('searchUsers',{
                error:'User does not exist'
            })
        }else{
            obj.id = id;
            res.render('details',{
                user:obj
            })
        }

    })
})


app.get('/user/add',function(req,res) {
    res.render('adduser')
})

app.post('/user/add',function(req,res,next) {
    
    let id = req.body.id
    let first_name = req.body.first_name
    let last_name = req.body.last_name
    let email = req.body.email
    let phone = req.body.phone

    client.hmset(id,[
        'first_name',first_name,
        'last_name',last_name,
        'email',email,
        'phone',phone
    ],function(err,reply){
        if(err){
            console.log(err)
        }

        console.log(reply)
        res.redirect('/')
    })

})

// Delete User
app.delete('/user/delete/:id',function(req,res,next){
    client.del(req.params.id)
    res.redirect('/')
})


const port = process.env.PORT || 3000

app.listen(port,() => console.log(`Server conneted at ${port}`))