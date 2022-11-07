const router = require("express").Router();

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const auth = require("./VerifyToken");

//update user name and other info
router.post("/updateUser", auth, async (req, res) => {
  const { user } = req;
  const userObj = req.body;
  console.log(userObj);
  try {
    const updateUser = await prisma.user.update({
      where: {
        email: user.email,
      },
      data: {
        ...userObj,
      },
    });
    res.json({ ...updateUser });
  } catch (e) {
    console.log("Update user error", e);
    if (e.code === "P2002") {
      if (e.meta.target === "username_unique") {
        res.status(400).json({ message: "Username Already Exists" });
      }
    } else res.status(400).json({ message: e });
  }
});

router.get("/getUser", auth, async (req, res) => {
  try {
    const { user } = req;
    res.json({ ...user });
  } catch (e) {
    res.status(400).json({ message: e });
  }
});

module.exports = router;
