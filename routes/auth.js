const router = require("express").Router()
const User = require("../models/User")
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken")

router.post("/register", async (req, res) => {
    const newUser = new User({
        username: req.body.username,
        password: CryptoJS.AES.encrypt(req.body.password, process.env.SECRET_KEY).toString(),
        email: req.body.email
    })
    try {
        const savedUser = await newUser.save()
        res.status(201).json(savedUser)
    } catch (error) {
        res.status(500).json(error)
    }



})

router.post("/login", async (req, res) => {
    try {
        const user = await User.findOne({ username: req.body.username })
        !user && res.status(401).json("wrong credentials")

        const hashedpassword = CryptoJS.AES.decrypt(user.password, process.env.SECRET_KEY);
        const originalPassword = hashedpassword.toString(CryptoJS.enc.Utf8)

        originalPassword !== req.body.password && res.status(401).json("wrong credentials")

        const accessToken = jwt.sign({
            id: user._id,
            isAdmin: user.isAdmin
        }, 
        process.env.JWT_KEY,
         { expiresIn: "10d" }
         )

        const { password, ...others } = user._doc

        res.status(200).json({...others, accessToken })

    } catch (error) {
        res.status(500).json(error)

    }
})


module.exports = router