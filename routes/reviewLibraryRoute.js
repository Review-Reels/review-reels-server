const router = require("express").Router();

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const auth = require("./VerifyToken");

router.get("/libraryList", auth, async (req, res) => {
  const { user } = req;

  try {
    const reviewLibrary = await prisma.reviewLibrary.findMany({
      where: {
        userId: user.id,
      },
      orderBy: { createdAt: "desc" },
    });
    res.send(reviewLibrary);
  } catch (e) {
    console.log(e);
    res.status(400).json(e);
  }
});

router.post("/librarySave", auth, async (req, res) => {
  try {
    const { user, body } = req;
    console.log(body);

    const createdLibraryInstance = await prisma.reviewLibrary.create({
      data: {
        ...body,
        userId: user.id,
      },
    });
    res.send(createdLibraryInstance);
  } catch (e) {
    console.log(e);
    res.status(400).json(e);
  }
});

router.delete("/libraryDelete/:id", auth, async (req, res) => {
  try {
    const { params } = req;
    const currentReviewRequest = await prisma.reviewLibrary.delete({
      where: {
        id: params.id,
      },
    });

    res.status(201).send({});
  } catch (e) {
    console.log(e);
    res.status(400).json(e);
  }
});

module.exports = router;
