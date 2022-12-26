const { Router } = require("express");
const express = require("express");
const router = express.Router();
var fetchuser = require("../middleware/fetchuser");
const Note = require("../models/Note");
const { body, validationResult } = require("express-validator");

//Route:1 to fetch all notes using GET:"/api/auth/getuser" : Login Required
router.get("/fetchallnotes", fetchuser, async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user.id });
        res.json(notes);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});
//Route:2 to add a new notes using POST:"/api/notes/addnote" : Login Required
router.post(
  "/addnote",
  fetchuser,
  [
    body("title", "Enter a valid title").isLength({ min: 3 }),
    body("description", "description must be at least 5 characters").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    try {
        const { title, description, tag } = req.body;
    //If there  are error return the bad requet
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const note = new Note({
      title,
      description,
      tag,
      user: req.user.id
    });
    const savedNote = await note.save()
    res.json(savedNote)
  }
 catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
    } 
});
//Route:3 update  a new notes using PUT:"/api/notes/updatenote" : Login Required
router.put(
    "/updatenote/:id",
    fetchuser,async (req, res) => {
        const {title, description, tag} = req.body;
        try {
            //Create a newnote object
        const newNote={};
        if(title){newNote.title=title};
        if(description){
            newNote.description=description
        };
        if(tag){
            newNote.tag=tag;
        };
        //find a newnote and update to it
        let note = await Note.findById(req.params.id);
        if(!note){
            res.status(404).send("Not found")
        }
        if(note.user.toString()!=req.user.id)
        {
           return res.status(401).send("Not Allowed");
        }
        note = await Note.findByIdAndUpdate(req.params.id,{$set:newNote},{new:true})
        res.json({note});
        } catch (error) {
            console.error(error.message);
            res.status(500).send("Internal Server Error");
        } 
    })
    //Route:4 delete  an existing  notes using DELETE:"/api/notes/deletenote" : Login Required
router.delete(
    "/deletenote/:id",
    fetchuser,async (req, res) => {
        try {
             //find the note to be deleted  and delete it
        let note = await Note.findById(req.params.id);
        if(!note){
            res.status(404).send("Not found")
        }
        //Allow anly if user owns this note
        if(note.user.toString()!=req.user.id)
        {
           return res.status(401).send("Not Allowed");
        }
        note = await Note.findByIdAndDelete(req.params.id)
        res.json({"Success":"Note has be deleted",note:note});
        } catch (error) {
            console.error(error.message);
            res.status(500).send("Internal Server Error");
        }
    })
module.exports = router;
