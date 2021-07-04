const router = require("express").Router();

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const auth = require("./VerifyToken");

//update user name and other info
router.post("/update_user", auth, async (req, res) => {
  const { user } = req;
  const userObj = req.body;
  const updateUser = await prisma.user.update({
    where: {
      email: user.email,
    },
    data: {
      ...userObj,
    },
  });
  res.json({ ...updateUser });
});

module.exports = router;
