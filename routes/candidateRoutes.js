const express = require("express");
const router = express.Router();
const { jwtAuthMiddleware, generateToken } = require("./../jwt");
const Candidate = require("../models/candidates");
const User = require("../models/user");

const checkAdminRole = async (userId) => {

    try {
        const user = await User.findById(userId);
        return user.role === 'admin'
        
    } catch (error) {
        return false;
    }
}

router.post("/", jwtAuthMiddleware,async (req, res) => {
  try {
    if( ! await checkAdminRole(req.user.id))
        res.status(403).json({ error: "user does has not admin role!", status: 403 });
 
    const data = req.body;
    const newCandidate = new Candidate(data);
    const response = await newCandidate.save();
    console.log("Data saved:", response);
    res.status(200).json({ response: response , message : "candiidate added successfully"  , status : 200 });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "internal server error", status: 500 });    
  }
});



router.put("/:candidateId",jwtAuthMiddleware, async (req, res) => {
  try {

    if(!checkAdminRole(req.user.id))
        res.status(403).json({ error: "user does has not admin role!", status: 403 });
    
    const candidateId = req.params.candidateId;
    const updatedCandidateData = req.body;
    const data = await Candidate.findByIdAndUpdate(candidateId,updatedCandidateData, {
        new:true , 
        runValidators:true
    })
    if (!data) {
        return res.status(404).json({ message: 'candiidate Not found' , status:404});
    }
    console.log("candiidate updated");
    res.status(200).json( {data, status:200 , message:"candiidate  updated successfully" });        


  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "internal server error", status: 500 });
  }
});




router.delete("/:candidateId",jwtAuthMiddleware, async (req, res) => {
    try {
  
      if(!checkAdminRole(req.user.id))
          res.status(403).json({ error: "user does has not admin role!", status: 403 });
      
      const candidateId = req.params.candidateId;
      const data = await Candidate.findByIdAndDelete(candidateId);
      if (!data) {
          return res.status(404).json({ message: 'candiidate Not found' , status:404});
      }
      console.log("candiidate deleted successfully");
      res.status(200).json( {data, status:200 , message:"candiidate  deleted successfully" });        
  
  
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "internal server error", status: 500 });
    }
  });



// llets start voting
 router.post('/vote/:candidateID', jwtAuthMiddleware, async (req, res)=>{
    // no admin can vote
    // user can only vote once
    
    candidateID = req.params.candidateID;
    userId = req.user.id;

    try{
        // Find the Candidate document with the specified candidateID
        const candidate = await Candidate.findById(candidateID);
        if(!candidate){
            return res.status(404).json({ message: 'Candidate not found' });
        }

        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({ message: 'user not found' });
        }
        if(user.role == 'admin'){
            return res.status(403).json({ message: 'admin is not allowed'});
        }
        if(user.isVoted){
            return res.status(400).json({ message: 'You have already voted' });
        }

        // Update the Candidate document to record the vote
        candidate.votes.push({user: userId})
        candidate.voteCount++;
        await candidate.save();

        // update the user document
        user.isVoted = true
        await user.save();

        return res.status(200).json({ message: 'Vote recorded successfully' });
    }catch(err){
        console.log(err);
        return res.status(500).json({error: 'Internal Server Error'});
    }
});

// vote count 
router.get('/vote/count', async (req, res) => {
    try{
        // Find all candidates and sort them by voteCount in descending order
        const candidate = await Candidate.find().sort({voteCount: 'desc'});

        // Map the candidates to only return their name and voteCount
        const voteRecord = candidate.map((data)=>{
            return {
                party: data.party,
                count: data.voteCount
            }
        });

        return res.status(200).json(voteRecord);
    }catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
});

module.exports = router;
