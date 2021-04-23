import { Router } from "express";
import { getMedias, writeMedias } from "../controllers/media.js";
import axios from "axios";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

const cloudStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "Strive-Netflix-API",
  },
});

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.API_SECRET,
});

const cloudMulter = multer({ storage: cloudStorage });

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const medias = await getMedias();
    res.send(medias);
  } catch (err) {
    console.log(error);
    const error = new Error(err.message);
    error.httpStatusCode = 500;
    next(error);
  }
});

router.get("/:imdbID", async (req, res, next) => {
  try {
    const medias = await getMedias();
    const media = medias.find((media) => media.imdbID === req.params.imdbID);
    if (media) {
      res.send(media);
    } else {
      res.status(404).send({ message: `No media with this imdbID was found` });
    }
  } catch (err) {
    console.log(error);
    const error = new Error(err.message);
    error.httpStatusCode = 500;
    next(error);
  }
});

router.post("/:imdbID", async (req, res, next) => {
  try {
    let medias = await getMedias();
    const response = await axios({
      method: "get",
      url: `http://www.omdbapi.com/?i=${req.params.imdbID}&apikey=${process.env.OMDB_API_KEY}`,
    });
    if (response.data.imdbID !== undefined) {
      let data = response.data;
      const newMedia = {
        Title: data.Title,
        Year: data.Year,
        Released: data.Released,
        Runtime: data.Runtime,
        Genre: data.Runtime,
        Plot: data.Plot,
        Poster: data.Poster,
        imdbRating: data.imdbRating,
        imdbID: data.imdbID,
      };
      medias.push(newMedia);
      await writeMedias(medias);
      res.send(newMedia);
    } else {
      res.send({ message: `Media with this imdbID is not found` });
    }
  } catch (err) {
    console.log(err);
    const error = new Error(err.message);
    error.httpStatusCode = 500;
    next(error);
  }
});

router.put("/:imdbID", async (req, res, next) => {
  try {
    let medias = await getMedias();
    let media = medias.find((media) => media.imdbID === req.params.imdbID);
    medias = medias.filter((media) => media.imdbID !== req.params.imdbID);
    if (media) {
      media = {
        ...media,
        ...req.body,
      };
      medias.push(media);
      await writeMedias(medias);
      res.send(medias);
    } else {
      console.log("No media with that imdbID found");
    }
  } catch (err) {
    console.log(err);
    const error = new Error(err.message);
    error.httpStatusCode = 500;
    next(error);
  }
});

router.delete("/:imdbID", async (req, res, next) => {
  try {
    let medias = await getMedias();
    let media = medias.find((media) => media.imdbID === req.params.imdbID);
    if (media) {
      medias = medias.filter((media) => media.imdbID !== req.params.imdbID);
      await writeMedias(medias);
      res.send(medias);
    } else {
      res.send({ message: `No media with that imdbID found` });
    }
  } catch (err) {
    console.log(err);
    const error = new Error(err.message);
    error.httpStatusCode = 500;
    next(error);
  }
});

router.post(
  "/:imdbID/upload",
  cloudMulter.single("picture"),
  async (req, res, next) => {
    try {
      console.log(req.file.path);
      let medias = await getMedias();
      let media = medias.find((media) => media.imdbID === req.params.imdbID);
      if (media) {
        media = {
          ...media,
          Picture: req.file.path,
          uploadedAt: new Date(),
        };
        medias = medias.filter((media) => media.imdbID !== req.params.imdbID);
        medias.push(media);
        await writeMedias(medias);
        res.send(media);
      } else {
        res.status(404).send("No media with this imdbID is found");
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

export default router;
