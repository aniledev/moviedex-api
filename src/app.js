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
  const { genre, country = "", avg_vote = "1" } = req.query;

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

  const validGenresString = validGenres.toString();

  if (genre) {
    if (!validGenresString.toLowerCase().includes(genre.toLowerCase())) {
      // if genres is not one of the valid genres, then return a status of 400
      logger.error(`Invalid query input for genre: ${genre}.`);
      return res
        .status(400)
        .send(
          "Genre must either be animation, drama, romantic, comedy, crime, thriller, adventure, documentary, horror, action, western, final embrace, spy, history, biography, musical, fantasy, war, or grotesque."
        );
    } else {
      response = response.filter((movie) =>
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
      logger.error(`Invalid query input for country: ${country}.`);
      return res
        .status(400)
        .send(
          "Country must either be United States, Italy, Germany, Israel, Great Britain, France, Hungary, China, Canada, Spain, or Japan."
        );
    } else {
      response = response.filter((movie) =>
        movie["country"].toLowerCase().includes(country.toLowerCase())
      );
    }
  }

  if (avg_vote) {
    // if avg_vote is not a number return a statement
    if (typeof Number(avg_vote) === "number") {
      response = response.filter((movie) => movie["avg_vote"] >= avg_vote);
    }
    if (Number(avg_vote) < 1 || Number(avg_vote) > 10) {
      logger.error(`invalid query input for avg_vote: ${avg_vote}.`);
      return res.status(400).send("Avg vote must be a number 1 through 10.");
    }

    // else make sure that the results are greater than or equal to the average cote
  }

  if (response.length < 1 || response == undefined) {
    return res.status(200).send("No matches found. Please try again.");
  }

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
