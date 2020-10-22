// setup server
// YOUR CODE
const cors = require('cors');
const express = require('express')
const lowdb = require('lowdb')
const filesync = require('lowdb/adapters/FileSync')
const bodyparser = require('body-parser')
const path = require('path')

const app = express()
app.use(cors());
app.options('*', cors());
const port = 3000

// setup data store
// YOUR CODE
var db = lowdb(new filesync('./db.json'))

// required data store structure
// YOUR CODE
/*
{ 
    accounts:[
        {name        : '',
         email       : '',
         balance     : 0,
         password    : '',
         transactions: []}
    ] 
}
*/
db.defaults(
    { 
        accounts:[
            {name        : '',
             email       : '',
             balance     : 0,
             password    : '',
             transactions: []}
        ] 
    }
).write();

app.use(bodyparser.json())

// setup directory used to serve static files
// YOUR CODE

app.use(express.static('public'))

app.get('/account/create/:name/:email/:password', function (req, res) {

    // YOUR CODE
    // Create account route
    // return success or failure string
    let name = req.params.name
    let email = req.params.email
    let password = req.params.password
    let allaccounts = db.get("accounts")
    console.log(`name is: ${name}, email is ${email}, password is ${password}`)

    let duplicateaccount = allaccounts.find({"email": email}).value(); //check for duplicate account based on email.
    console.log("duplicateaccount: ",duplicateaccount)

    if (duplicateaccount == undefined) {
        allaccounts.push({
            "name" : name,
            "email" : email,
            "password" : password,
            "balance":0,
            "transactions": []
        }).write();
    
        console.log("Sending response to the UI")
        res.json('Account successfully created!')
        console.log("Sent response to the UI")
    
        return;
    }

    if (duplicateaccount != null || duplicateaccount != "") {
        res.json('{"status":0, "message":"Account already exists! Please Login."}')
        return;
    }
    

    allaccounts.push({
        "name" : name,
        "email" : email,
        "password" : password,
        "balance":0,
        "transactions": []
    }).write();

    console.log("Sending response to the UI")
    res.json('Account successfully created!')
    console.log("Sent response to the UI")

    return
});

app.get('/account/login/:email/:password', function (req, res) {

    // YOUR CODE
    // Login user - confirm credentials
    // If success, return account object    
    // If fail, return null

    let email = req.params.email
    let password = req.params.password
    let allaccounts = db.get("accounts")
    console.log(`email is ${email}, password is ${password}`)

    let account = allaccounts.find({"email": email,"password":password}).value(); //check for account based on email and password.
    console.log("account: ",account)

    if (account = undefined || account == null || account == "") {
        res.json(null)
        return;
    }


    res.json(account)
    return;
});

app.get('/account/get/:email', function (req, res) {

    // YOUR CODE
    // Return account based on email
    let email = req.params.email
    let allaccounts = db.get("accounts")

    console.log(`email is ${email}`)

    let account = allaccounts.find({"email": email}).value(); //check for account based on email.
    console.log("account: ",account)


    if (account == undefined || account == null || account == "") {
        res.json(null)
        return;
    }
    
    res.json(account)
    return;
});

app.get('/account/deposit/:email/:amount', function (req, res) {

    // YOUR CODE
    // Deposit amount for email
    // return success or failure string
    let email = req.params.email
    let amount = req.params.amount
    console.log("amount: ",amount)
    try {
        amount = parseInt(amount)
    } catch (error) {
        res.json(`{"status":0, "message":${error.message}}`)
        return;
    }
    console.log("Amount: ",amount)
    if (Number.isNaN(amount) == true) {
        res.json(`{"status":0, "message":"Please check your input and enter a valid integer amount."}`)
        return;
    } 
    let allaccounts = db.get("accounts")

    console.log(`email is ${email}, amount is ${amount}`)

    let account = allaccounts.find({"email": email}).value(); //check for account based on email.
    console.log("account: ",account)
    
    if (account == undefined || account == null || account == "") {
        res.json('{"status":0, "message":"Account doesnt exist! Please create an account and try again."}')
        return;
    }
    account = allaccounts.find({"email": email})
    transaction = account.value().transactions
    final_balance = account.value().balance + amount

    transaction.push(`Deposited amount ${amount} $. Balance => ${final_balance} $ at ${new Date(new Date().toUTCString().slice(0, -3))
    }`)
    console.log("final_amount: ",final_balance)
    account.assign({'balance': final_balance, 'transactions':transaction}).write()
    res.json(`{"status":1, "message":"Successfully deposited ${amount}$."}`)
    return;
});

app.get('/account/withdraw/:email/:amount', function (req, res) {

    // YOUR CODE
    // Withdraw amount for email
    // return success or failure string
    let email = req.params.email
    let amount = req.params.amount
    console.log("amount: ",amount)
    try {
        amount = parseInt(amount)
    } catch (error) {
        res.json(`{"status":0, "message":${error.message}}`)
        return;
    }
    console.log("Amount: ",amount)
    if (Number.isNaN(amount) == true) {
        res.json(`{"status":0, "message":"Please check your input and enter a valid integer amount."}`)
        return;
    } 
    let allaccounts = db.get("accounts")

    console.log(`email is ${email}, amount is ${amount}`)

    let account = allaccounts.find({"email": email}).value(); //check for account based on email.
    console.log("account: ",account)
    
    if (account == undefined || account == null || account == "") {
        res.json('{"status":0, "message":"Account doesnt exist! Please create an account and try again."}')
        return;
    }
    account = allaccounts.find({"email": email})
    transaction = account.value().transactions
    final_balance = account.value().balance - amount
    if (final_balance < 0) {
        res.json(`{"status":0, "message":"Your balance is low. Please check your balance and try again."}`)
        return;
    } 

    transaction.push(`Withdrawn amount ${amount} $. Balance => ${final_balance} $ at ${new Date(new Date().toUTCString().slice(0, -3))
    }`)
    console.log("final_amount: ",final_balance)
    account.assign({'balance': final_balance, 'transactions':transaction}).write()
    res.json(`{"status":1, "message":"Successfully withdrawn ${amount}$."}`)
    return;
});

app.get('/account/transactions/:email', function (req, res) {

    // YOUR CODE
    // Return all transactions for account

    let email = req.params.email
    let allaccounts = db.get("accounts")

    console.log(`email is ${email}`)

    let account = allaccounts.find({"email": email}).value(); //check for account based on email.
    console.log("account: ",account)


    if (account == undefined || account == null || account == "") {
        res.json(`{"status":0, "transactions":[]}`)
        return;
    }
    
    res.json(`{"status":1, "transactions":${JSON.stringify(account.transactions)}}`)
    return;
});

app.get('/account/all', function (req, res) {

    // YOUR CODE
    // Return data for all accounts
    let allaccounts = db.get("accounts").value()
    output_list = []
    for(let i = 0; i < allaccounts.length; i++) {
        console.log("allaccounts[i]: ",allaccounts[i])
        for (let j = 0; j < allaccounts[i].transactions.length; j++) {
            output_list.push({"name":allaccounts[i].name, "balance": allaccounts[i].balance, "email":allaccounts[i].email, "password":allaccounts[i].password,"transaction": allaccounts[i].transactions[j]})
        }
    }
    res.json(JSON.stringify(output_list))
});


app.listen(port, () => {
    console.log(`Bankapp listening at http://localhost:${port}`)
})