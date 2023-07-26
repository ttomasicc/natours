![Natours](software/public/img/logo-green.png)

Natours is a full-stack web application built using Node.js that includes both a RESTful API (backend) and a server-side rendered website (frontend). This project aims to provide an online platform for booking and exploring exciting nature tours around the world.

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Web examples](#web-examples)
- [License](#license)

## Introduction

Natours allows users to browse and book various nature tours, each carefully curated to provide a unique and memorable experience. The backend provides a robust RESTful API that communicates with the frontend to handle user requests and manage tour bookings.

The frontend of Natours is built using server-side rendering, providing better SEO performance and a more efficient user experience. The combination of the API and the frontend website creates a seamless and intuitive platform for users to explore and book their dream nature tours.

## Features

- Browse through a list of nature tours from different locations.
    - Get top tours,
    - Get tours within your distance,
    - Get tours monthly plan,
    - Get all tours statistics
- View detailed information about each tour, including itinerary (map), difficulty level, duration, guides, and price.
- User authentication and authorization for booking tours and leaving reviews.
    - Features: signup, login, password reset (via Email)
    - Roles: user, guide, lead-guide, admin
- Secure payment processing for tour bookings.
- User dashboard to manage tours, bookings and account details.
- Administrator dashboard to manage tours, users, and bookings.

## Tech Stack

The Natours project utilizes the following technologies:

#### Core (backend API)

- **Node.js**: Backend environment for running JavaScript on the server.
- **Express.js**: Web application framework for building the API and handling routes.

#### Database

- **MongoDB**: NoSQL database for storing tour, user, review and booking data.
- **Mongoose**: MongoDB object modeling for Node.js.

#### Security

- **JWT**: JSON Web Tokens for user authentication and authorization.
- **Bcrypt**: Library for hashing and salting passwords.
- **Express Mongoose Sanitize**: Sanitizes user-supplied data to prevent MongoDB Operator Injection.
- **Express Rate Limit**: Basic rate-limiting middleware for Express - used to limit repeated requests to the API.
- **Helmet**: Helps secure Express apps by setting HTTP response headers.
- **HPP**: Express middleware to protect against HTTP Parameter Pollution attacks.
- **XSS Filters**: Library for output filtering, prevents XSS.

#### Website (front-end)

- **Pug**: Template engine for server-side rendering the frontend.
- **Leaflet**: Mapping API for displaying tour locations.

#### Other

- **Stripe**: Payment processing platform for secure payments.
- **Nodemailer**: Used for sending emails.
- **Multer**: Middleware for handling `multipart/form-data`, which is primarily used for uploading files.
- **Compression**: Compresses response bodies for all requests.
- **Sharp**: High speed Node.js module used for image manipulation.
- **Morgan**: HTTP request logger middleware for Node.js

## Installation

To set up the Natours project locally, follow these steps:

1. Clone the repository

```bash
git clone https://github.com/tttomasicc/natours.git
```

2. Navigate to the project directory

```bash
cd software/
```

3. Install the dependencies

```bash
npm install
```

## Usage

To start the development server, configure necessary [environment](software/environments) variables and run

1. MongoDB using Docker (Compose)

```bash
docker-compose up
```

2. Node.js Web app

```bash
npm run start:dev
```

Visit `http://localhost:3000` in your Web browser to access the Natours website.

## API Documentation

For detailed information about the API endpoints and how to interact with them, refer to
the [API documentation](docs/natours-api.postman_collection.json) file.

## Web examples

Web examples can be found in the [Documentation](docs)

## License

The Natours project is licensed under the [GNU General Public License v2.0](LICENSE). You are free to use, modify, and distribute this code as per the terms of the license.
