const handleNotFoundRequest = (req,res) => {
    res.status(404).json({message:"Not Found"})
}

module.exports=handleNotFoundRequest