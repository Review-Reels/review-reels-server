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

router.get("/libraryOne/:id", auth, async (req, res) => {
  const { user, params } = req;

  try {
    const reviewLibrary = await prisma.reviewLibrary.findUnique({
      where: {
        id: params.id,
      },
    });
    console.log(reviewLibrary);
    const reviewResponses = await prisma.reviewResponse.findMany({
      where: {
        id: { in: reviewLibrary.libraryConfigJson },
      },
      orderBy: { createdAt: "desc" },
    });
    res.send({ reviewLibrary, reviewResponses });
  } catch (e) {
    console.log(e);
    res.status(400).json(e);
  }
});

router.post("/librarySave", auth, async (req, res) => {
  try {
    const { user, body } = req;

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

router.put("/libraryEdit/:id", auth, async (req, res) => {
  try {
    const { user, body, params } = req;

    const createdLibraryInstance = await prisma.reviewLibrary.update({
      where: {
        id: params.id,
      },
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
