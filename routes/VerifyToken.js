const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

module.exports = async function auth(req, res, next) {
  if (!req.header("Authorization"))
    return res.status(401).json({ message: "Access Denied" });
  const token = req.header("Authorization").replace(/^Bearer\s+/, "");
  if (!token) return res.status(401).json({ message: "Access Denied" });
  try {
    const verified = jwt.verify(token, process.env.TOKEN_SECRET);
    const currentUser = await prisma.user.findUnique({
      where: { id: verified._id },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        authType: true,
        username: true,
        merchantName: true,
        emailVerified: true,
      },
    });
    if (currentUser) {
      req.user = currentUser;
      next();
    } else {
      res.status(401).json({ message: "User Does Not Exist" });
    }
  } catch (err) {
    res.status(401).json({ message: "Invalid Token" });
  }
};
