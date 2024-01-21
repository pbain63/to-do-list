//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-prodip:deepqwe@cluster0.6lbsiw4.mongodb.net/todolistDB"); //

const itemsSchema = new mongoose.Schema({
  // new mongoose.Schema() cut in the video
  name: String,
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to todolist!",
});

const item2 = new Item({
  name: "Custom your list: localhost:3000/customList",
});

const item3 = new Item({
  name: "Check in the box to delete the item!",
});

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema],
});

const List = mongoose.model("List", listSchema);


app.get("/", function (req, res) {
  async function myItems() {
    const foundItems = await Item.find({}); //"await" should use in "async func()"
    if (foundItems.length === 0) {
      const res = await Item.insertMany(defaultItems); // commented for repeat item added in array
      //console.log("Successfully saved default items to DB");

      res.redirect("/");
    } else {
      //console.log(foundItems);

      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }
  }
  myItems();
});

app.get("/:customListName", function (req, res) {
  customListName = _.capitalize(req.params.customListName);

  async function myLists() {
    const foundList = await List.findOne({ name: customListName }).exec();
    //console.log(foundList);
    if (!foundList) {
      //Create a new list
      const list = new List({
        name: customListName,
        items: defaultItems,
      });
      list.save().then(() => console.log("list added: " + customListName));
      res.redirect("/" + customListName);
    } else {
      //Show an existing list
      res.render("list", {
        listTitle: foundList.name,
        newListItems: foundList.items,
      });
    }
  }
  myLists();
});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName,
  });

  if (listName === "Today") {
    item.save().then(() => console.log("Item added: " + itemName));
    res.redirect("/");
  } else {
    async function myLists() {
      const foundList = await List.findOne({ name: listName }).exec();
      foundList.items.push(item);
      foundList.save().then(() => console.log("list added: " + customListName));
      res.redirect("/" + listName);
    }
    myLists();
  }
});

app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  async function myDeletes() {
    if (listName === "Today") {
      const deleteItem = await Item.findOneAndDelete({ _id: checkedItemId }); 

      console.log("Deleted item: " + deleteItem.name);
      res.redirect("/"); /////////////////////////
    } else {
      const foundList = await List.findOneAndUpdate(
        { name: listName },
        { $pull: { items: { _id: checkedItemId } } }
      );
      res.redirect("/" + listName);
    }
    
  }
  
  myDeletes();
});

app.listen(3000, function () {
  console.log("Server is running on port 3000");
});
