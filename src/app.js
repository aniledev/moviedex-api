// IMPORT REQUIRED LIBRARIES AND SECURITY PACKAGES
require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const winston = require("winston");
const { NODE_ENV, PORT } = require("./config");
const MOVIEDEX = require("./movies-data-small.json");

const app = express();

const morganOption = NODE_ENV === "production" ? "tiny" : "dev";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [new winston.transports.File({ filename: "info.log" })],
});

if (NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

//STANDARD MIDDLEWARE
app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());
// add a validation function here for the authorization token
app.use(express.json());

//ROUTES
const handleGetMovies = (req, res, next) => {
  let response = MOVIEDEX;

  // read the req.query object; provide default values for the ones that are required
  const { genre = "", country = "", avg_vote } = req.query;

  //validate genre if there is one; genre must be one of the valid types
  const validGenres = [
    "Animation",
    "Drama",
    "Romantic",
    "Comedy",
    "Crime",
    "Thriller",
    "Adventure",
    "Documentary",
    "Horror",
    "Action",
    "Western",
    "Spy",
    "Final Embrace",
    "History",
    "Biography",
    "Musical",
    "Fantasy",
    "War",
    "Grotesque",
  ];

  if (genre) {
    if (!validGenres.toString().toLowerCase().includes(genre.toLowerCase())) {
      // if genres is not one of the valid genres, then return a status of 400
      return res
        .status(400)
        .send(
          "Genre must either be animation, drama, romantic, comedy, crime, thriller, adventure, documentary, horror, action, western, final embrace, spy, history, biography, musical, fantasy, war, or grotesque."
        );
    } else {
      response = MOVIEDEX.filter((movie) =>
        movie["genre"].toLowerCase().includes(genre.toLowerCase())
      );
    }
  }

  // if there is a country, it must also be validated
  const validCountries = [
    "United States",
    "Italy",
    "Germany",
    "Israel",
    "Great Britain",
    "France",
    "Hungary",
    "China",
    "Canada",
    "Spain",
    "Japan",
  ];

  if (country) {
    if (
      !validCountries.toString().toLowerCase().includes(country.toLowerCase())
    ) {
      // if genres is not one of the valid genres, then return a status of 400
      return res
        .status(400)
        .send(
          "Country must either be United States, Italy, Germany, Israel, Great Britain, France, Hungary, China, Canada, Spain, or Japan."
        );
    } else {
      response = MOVIEDEX.filter((movie) =>
        movie["country"].toLowerCase().includes(country.toLowerCase())
      );
    }
  }

  // use the filter method to filter out searches that don't include country string\
  // let results = MOVIEDEX.filter((movie) =>
  //   movie["country"].toLowerCase().includes(country.toLowerCase())
  // );

  // let results = MOVIEDEX.filter((movie) =>
  //   movie["genre"].toLowerCase().includes(genre.toLowerCase())
  // );

  // for avg vote, use the filter method to filter out searches that dont include country string

  res.json(response);
};

app.get("/movie", handleGetMovies);

// CATCH ANY THROWN ERRORS AND THEN DEFINE THE ERROR AND KEEP THE APPLICATION RUNNING;
//STILL MIDDLEWARE
app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === "production") {
    response = { error: { message: "server error" } };
  } else {
    console.error(error);
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});

//PIPELINE ENDS
module.exports = app;
