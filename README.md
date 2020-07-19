# Runtopia

This app uses the fitbit API to store and chart your weekly fitness levels over time as well as provide recommendations regarding your current level.

## Stack

- Express
- React
- Nedb

## About
This app draws inpiration from Strava's relative effort chart (a paid user feature). What is relative effort? Relative effort is essentially the sum of your minutes recorded at various heartrate levels. These fitness scores are then combined for a given week and graphed to illustrate whether your are below or above your average fitness range. Depending whether the average is above or below your trailing 4 week average, there is color coding and a message to help guide your recovery or training plan. 

## Challenges

- Understanding which database integration to use.

- Organizing the package.json files for easy dpeloyment on Heroku.

- Structuring the flow of data from the fitbit api to the database, then back to the front end.

## Future Features

Bringing in more fitbit data such as sleep scores, gps recordings.
