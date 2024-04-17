# API Gateway Microservices Architecture Docker Container Project

This project implements an API Gateway microservices architecture using Express.js and Node.js. It utilizes various dependencies such as Helmet, Axios, Cookie-parser, Dotenv, Jsonwebtoken, Morgan, and Cors. The features include authorization using JWT, circuit breaker, rate limiting, and service discovery.

## Setup

To set up the project, follow these steps:

1. Clone the repository:
    ```bash
    git clone https://github.com/soyas07/api-gateway.git
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Create a `.env` file and configure environment variables.

4. Build the project:
    ```bash
    npm run build
    ```

5. Start the server:
    ```bash
    npm start
    ```

## REST APIs

### 1. Login a User

**POST** `https://api.soyaslimbu.com/api/v1/user/login`

**Request Body:**
```json
{
    "email": "john@admin.com",
    "password": "test@123"
}
```

**Response**
```json
{
    "message": "ok"
}
```
**Also, Attach refresh token and token in the HTTP-only cookies**

### 2. Create a User

**POST** `https://api.soyaslimbu.com/api/v1/user/register`

**Request Body:**
```json
{
    "username": "william",
    "email": "william@test.com",
    "password": "test@123",
    "roles": "user"
}
```

**Response**
```json
{
    "message": "ok"
}
```
**Also, Attach refresh token and token in the HTTP-only cookies**

### 3. Renew a token

**GET** `https://api.soyaslimbu.com/api/v1/user/renewToken`
**Must be refresh token on the http-only cookies**

**Response**
```json
{
    "message": "ok"
}
```
**Also, Attach refresh token and token in the HTTP-only cookies**

## Dependencies
- ***Express.js:*** Web application framework for Node.js.
- ***Node.js:*** JavaScript runtime.
- ***Helmet:*** Helps secure Express apps by setting various HTTP headers.
- ***Axios:*** Promise-based HTTP client for the browser and Node.js.
- ***Cookie-parser:*** Parse cookie header and populate req.cookies.
- ***Dotenv:*** Loads environment variables from a .env file into process.env.
- ***Jsonwebtoken:*** JSON Web Token implementation for Node.js.
- ***Morgan:*** HTTP request logger middleware for Node.js.
- ***Cors:*** Middleware for enabling Cross-Origin Resource Sharing.

## Contributors
- Soyas Limbu

## License
- This project is licensed under the MIT License.
