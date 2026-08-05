# Simple TODO application

This is a simple TODO application meant for running in a MongoDB and NodeJS environment of choice. Meant for keeping track of your grocery shopping and such.

# Features

- Login with Google
- As many lists as you'd like
- Private lists

# Configuration

## Server

.env containing

- DB_CONNECTION The connection string for your MongoDB instance
- GOOGLE_CLIENT_ID The client id of your google application

## Client

.env containing

- VITE_GOOGLE_CLIENT_ID The client id of your google application
