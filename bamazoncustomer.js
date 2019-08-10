const mysql = require("mysql");
const inquirer = require("inquirer");

let connection = mysql.createConnection({
    host: "localhost",

    port: 3306,
    
    user: "root",

    password: "galaxy24",

    database: "bamazon"
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("Welcome To Bamazon!!");

    // my starting function that prompts the user
    start();
});

function start() {
    connection.query("SELECT * FROM products", function(err, res) {
        if(err) throw err;
        for(let i = 0; i < res.length; i++) {
            console.log(res[i].item_id + " | " + res[i].product_name + " | " + res[i].department_name + " | " + res[i].price + " | " + res[i].stock_quantity);
        };
        console.log("---------------------------------------------------");
        

        inquirer.prompt([
            {
                name: "item",
                type: "input",
                message: "What is the number of the item you would like to purchase?"
            },
            {
                name: "quantity",
                type: "input",
                message: "How many would you like?"
            }
        ]).then(function (answer) {
            
         let numLeft;
         let chosenItem;
         let total;
         for(let i = 0; i < res.length; i++) {
            if(res[i].item_id === parseInt(answer.item)) {
                chosenItem = res[i];
            };
         };

         if(chosenItem.stock_quantity - answer.quantity === 0 || chosenItem.stock_quantity === 0) {

            console.log("Insufficient quantity!");

            round2();
         } else {
            numLeft = chosenItem.stock_quantity - answer.quantity;
            total = chosenItem.price * answer.quantity;

            connection.query("UPDATE products SET ? WHERE ?", 
            [
                {
                    stock_quantity: numLeft
                },
                {
                    item_id: chosenItem.item_id
                }
            ], function(err) {
                if(err) throw err;

                console.log(`Your total today is ${total}`);
                round2();
            }
         );
            
        };

        });
    });
};

function round2() {
    inquirer.prompt({
        name: "options",
        type: "list",
        message: "What would you like to do next?",
        choices: ["Checkout", "Keep shopping", "Exit"]
    })
    .then(function(answer) {
        if(answer.options === "Checkout") {
            console.log("Thank you for your purchase please come again soon!");
            connection.end();
        } else if(answer.options === "Keep shopping") {
            start();
        } else {
            console.log("Thank you for shopping at Bamazon!");
            connection.end();
        };
    });
};