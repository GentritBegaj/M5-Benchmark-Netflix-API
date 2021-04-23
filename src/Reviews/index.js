import e, { Router } from "express";
import { getMedias, writeMedias } from "../controllers/media.js";
import axios from "axios";
import uniqid from "uniqid";
import { memoryStorage } from "multer";

const router = Router();

router.get("/:imdbID", async (req, res, next) => {
  try {
    let medias = await getMedias();
    let media = medias.find((media) => media.imdbID === req.params.imdbID);
    if (media) {
      if (media.hasOwnProperty("reviews")) {
        res.send(media.reviews);
      } else {
        res.send({ message: `This media has no reviews` });
      }
    } else {
      res.status(404).send({ message: `No media with this imdbID is found` });
    }
  } catch (err) {
    console.log(err);
    const error = new Error(err.message);
    error.httpStatusCode = 500;
    next(error);
  }
});

router.get("/:imdbID/:id", async (req, res, next) => {
  try {
    let medias = await getMedias();
    let media = medias.find((media) => media.imdbID === req.params.imdbID);
    if (media) {
      if (media.hasOwnProperty("reviews")) {
        let reviews = media.reviews;
        let review = reviews.find((review) => review.id === req.params.id);
        if (review) {
          res.send(review);
        } else {
          res.status(404).send({ message: `Review is not found` });
        }
      } else {
        res.send({ message: `This media has no reviews` });
      }
    } else {
      res.status(404).send({ message: `No media with this imdbID is found` });
    }
  } catch (err) {
    console.log(err);
    const error = new Error(err.message);
    error.httpStatusCode = 500;
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    let medias = await getMedias();
    let media = medias.find((media) => media.imdbID === req.body.imdbID);
    if (media) {
      const newReview = {
        ...req.body,
        id: uniqid(),
        createdAt: new Date(),
      };
      if (media.reviews) {
        media.reviews = [...media.reviews, newReview];
      } else {
        media.reviews = [newReview];
      }
      medias = medias.filter((media) => media.imdbID !== req.body.imdbID);
      medias.push(media);
      await writeMedias(medias);
      res.send(newReview);
    } else {
      res.status(404).send("No media with this imdbID is found");
    }
  } catch (err) {
    console.log(err);
    const error = new Error(err.message);
    error.httpStatusCode = 500;
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    let medias = await getMedias();
    let media = medias.find((media) => media.imdbID === req.body.imdbID);
    if (media) {
      if (media.reviews) {
        let reviews = media.reviews;
        let review = reviews.find((review) => review.id === req.params.id);
        reviews = reviews.filter((review) => review.id !== req.params.id);

        const newReview = {
          ...review,
          ...req.body,
          updatedAt: new Date(),
        };
        media.reviews = [...reviews, newReview];
        medias.push(media);
        await writeMedias(medias);
        res.send(newReview);
      } else {
        res.send(404).send({ message: `No reviews found for this media` });
      }
    } else {
      res.status(404).send("No media with this imdbID is found");
    }
  } catch (err) {
    console.log(err);
    const error = new Error(err.message);
    error.httpStatusCode = 500;
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    let medias = await getMedias();
    let media = medias.find((media) => media.imdbID === req.body.imdbID);

    if (media) {
      if (media.reviews) {
        let reviews = media.reviews;
        let review = reviews.find((review) => review.id === req.params.id);
        if (review) {
          reviews = reviews.filter((review) => review.id !== req.params.id);
          media.reviews = [...reviews];
          medias = medias.filter((media) => media.imdbID !== req.body.imdbID);
          medias.push(media);
          await writeMedias(medias);
          res.send(reviews);
        } else {
          res.status(404).send({ message: `Review not found` });
        }
      } else {
        res.send(404).send({ message: `No reviews found for this media` });
      }
    } else {
      res.status(404).send("No media with this imdbID is found");
    }
  } catch (err) {
    console.log(err);
    const error = new Error(err.message);
    error.httpStatusCode = 500;
    next(error);
  }
});

export default router;
