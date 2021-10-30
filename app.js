//jshint esversion:7


const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { json } = require("body-parser");
const _ = require("lodash");
const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-gajanan:pass123@cluster0.gurbg.mongodb.net/todolistDB");

const itemsSchema = {
  name: String,
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to the todo List!",
});

const item2 = new Item({
  name: "hit + to add new todo item!",
});

const item3 = new Item({
  name: "hit <-- to delete todo item!",
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = new mongoose.model("List", listSchema);

app.get("/", function (req, res) {
  Item.find({}, function (err, foundItem) {
    if (foundItem.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfuly Saved Data!");
        }
      });

      res.redirect("/");
    }else{
      res.render("list", { listTitle: "Today", newListItems: foundItem });

    }

  });
});

app.get("/:id", function(req, res){
  let pathUrl = _.capitalize(req.params.id);

  List.findOne({name: pathUrl}, function(err, result){
    if (!err) {
      if(!result){
        //if there is no result
        const list = new List({
          name: pathUrl,
          items: defaultItems
        });
      
        list.save();
        res.redirect("/"+pathUrl);
      }else{
        //if there is result found

        res.render("list", { listTitle: result.name, newListItems: result.items });
      }
    }
  });
  
  

});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  } else{
    List.findOne({name: listName}, function (err, foundList) { 
      foundList.items.push(item);
      foundList.save();

      res.redirect("/"+ listName);
     })
  }

  

  

  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});

app.post("/delete", function(req, res){
  const checkedId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedId, function (err) { 
      if(!err){
        console.log("successfully deleted that item");
        res.redirect("/");
      }
     })

  }else {
    List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedId}}}, function (err, foundList) {
      if(!err){
      res.redirect("/"+ listName);
    }
      });
  }


});




// app.get("/work", function (req, res) {
//   res.render("list", { listTitle: "Work List", newListItems: workItems });
// });

app.get("/about", function (req, res) {
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}


app.listen(port, function () {
  console.log("Server started Successfully!");
});
