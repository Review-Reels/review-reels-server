const router = require("express").Router();

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
//sign in route
router.post("/signup", async (req, res) => {
  let userObj = req.body;
  try {
    const salt = await bcrypt.genSalt(10);
    userObj.password = await bcrypt.hash(userObj.password, salt);

    const user = await prisma.user.create({ data: userObj });

    res.json(user);
  } catch (e) {
    console.log(e.meta.target);
    res.status(400).json({ message: e.meta.target });
  }
});

//sign up route
router.post("/signin", async (req, res) => {
  const signIn = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: { email: signIn.email },
    });
    if (user) {
      if (bcrypt.compare(signIn.password, user.password)) {
        //create and assign a token
        const token = jwt.sign({ _id: user.id }, process.env.TOKEN_SECRET, {
          expiresIn: "24h",
        });

        res.json({ Authorization: token, ...user, password: null });
      } else res.json({ message: "Password wrong" });
    } else res.json({ message: "User does not exist" });
  } catch (e) {
    res.json({ message: "Something went wrong! Please try again later" });
  }
});

module.exports = router;
