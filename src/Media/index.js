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
    // const medias = await getMedias();
    // medias = medias.filter((media) =>
    //   media[req.query].toLowerCase().includes(req.query)
    // );
    // res.send(medias);
    // let medias = await getMedias()

    if (req.query.id) {
      const response = await axios({
        method: "get",
        url: `http://www.omdbapi.com/?i=${req.query.id}&apikey=${process.env.OMDB_API_KEY}`,
      });
      res.send(response.data);
    } else if (req.query.title) {
      const response = await axios({
        method: "get",
        url: `http://www.omdbapi.com/?s=${req.query.title}&apikey=${process.env.OMDB_API_KEY}`,
      });
      let data = response.data;
      if (req.query.year && req.query.type) {
        data = data.filter((movie) => movie.Year === req.query.year);
        data = data.filter((movie) => movie.type === req.query.type);
      } else if (req.query.year) {
        data = data.filter((movie) => movie.Year === req.query.year);
      } else if (req.query.type) {
        data = data.filter((movie) => movie.Type === req.query.type);
      }
      res.send(medias);
    }
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
        throw new Error("Data is undefined");
      }
    }
  } catch (err) {
    console.log(error);
    const error = new Error(err.message);
    error.httpStatusCode = 500;
    next(error);
  }
});

// router.get("/sort", async (req, res, next) => {
//   try {
//     if (req.query.by) {
//       if (req.query.by === "rating") {
//         let medias = await getMedias();
//         medias.forEach((media) => {
//           let reviews = media.reviews;
//           media.Rating =
//             reviews.reduce((acc, cv) => acc + cv.rate, 0) / reviews.length;
//         });
//         medias.sort((a, b) => a.Rating - b.Rating);
//         res.send(medias);
//       } else if (req.query.by === "title") {
//         let medias = await getMedias();
//         medias.sort((a, b) => (a.Title > b.Title ? 1 : -1));
//         res.send(medias);
//       } else if (req.query.by === "genre") {
//         let medias = await getMedias();
//         medias.sort((a, b) => (a.Genre > b.Genre ? 1 : -1));
//         res.send(medias);
//       } else if (req.query.by === "year") {
//         let medias = await getMedias();
//         medias.sort((a, b) => (a.Year > b.Year ? 1 : -1));
//         res.send(medias);
//       } else {
//         const error = new Error(`Sorting by ${req.query.by} is not available`);
//         next(error);
//       }
//     } else {
//       const error = new Error("Query parameter missing");
//       next(error);
//     }
//   } catch (err) {
//     console.log(err);
//     const error = new Error(err.message);
//     error.httpStatusCode = 500;
//     next(error);
//   }
// });

router.get("/catalogue/export", async (req, res, next) => {
  try {
    if (req.query.title) {
      const response = await axios({
        method: "get",
        url: `http://www.omdbapi.com/?s=${req.query.title}&apikey=${process.env.OMDB_API_KEY}`,
      });
      const data = response.data;
    }
  } catch (err) {
    console.log(err);
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
