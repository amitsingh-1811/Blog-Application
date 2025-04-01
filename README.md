# Blog Application

A full-featured blog application with user authentication, content management, and caching capabilities.

## Table of Contents
- [Features](#features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
  - [User Management](#user-management)
  - [Blog Management](#blog-management)
- [Redis Implementation](#redis-implementation)

## Features

### User Management
- Two-step verification registration process
- Email verification system
- Secure login and logout functionality
- JWT-based authentication

### Blog Management
- Create, read, update, and delete blog posts
- User-specific blog management
- Authentication middleware for protected routes
- Redis caching for improved performance

## Architecture

The application is divided into two main modules:

1. **User Module**: Handles user registration and authentication
2. **Blog Module**: Manages blog creation, editing, deletion, and viewing

Each module has its own:
- Controllers
- Models
- Routes

## Prerequisites

- Docker and Docker Compose
- Node.js (for local development)
- MongoDB
- Redis

## Installation

### Using Docker (Recommended)

1. Clone the repository:
```bash
git clone https://github.com/yourusername/blog-application.git
cd blog-application
```

2. Build and start the Docker containers:
```bash
docker-compose up -d
```

This will set up three containers:
- Node.js application
- MongoDB database
- Redis cache

3. The application should now be running at `http://localhost:3000`

### Manual Installation (Development)

1. Clone the repository:
```bash
git clone https://github.com/yourusername/blog-application.git
cd blog-application
```

2. Install dependencies:
```bash
npm install
```

3. Make sure MongoDB and Redis are running on your machine

4. Start the application:
```bash
npm run dev
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# Application
PORT=4000

# MongoDB
MONGO_URI=mongodb://root:example@mongodb:27017/blog-application?authSource=admin

# Redis
REDIS_PASSWORD = <set your redis password>
CACHE_EXPIRATION = 600
CACHE_KEY = <set your own cache key>
CACHE_INDEX_KEY = <set your own cache index key>
BLOG_FREQ_KEY = <set your own blog freq key>

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRY=5d

# Email

MAIL_USERNAME = <your_mailusername@gmail.com>
MAIL_PASSWORD = <app password>
```

For Docker deployment, these variables are already configured in the `docker-compose.yml` file.

## API Documentation

### User Management

#### Register User
```
POST /api/register
```
- Creates a new user account
- Sends a verification email to the provided email address
- User must verify email before being able to log in

**Request Body:**
```json
{
  "username": "user123",
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
    "success": true,
    "user": {
        "name": "Amit singh2",
        "email": "your_registered_email",
        "password": "your_encrypted_password",
        "isVerified": false,
        "_id": "object_id",
        "__v": 0
    },
    "token": "jwt_token"
}
```

#### Verify Email
```
GET /api/verify-email/:token
```
- Verifies user's email address using the token sent via email
- Redirects to login page on success

#### Login
```
POST /api/login
```
- Authenticates user and returns JWT token

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "username": "user123",
    "email": "user@example.com",
    "password": "your_password",
    "isVerified": true,
  }
}
```

#### Logout
```
POST /api/logout
```
- Invalidates the current JWT token
- Requires authentication

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Blog Management

#### Create Blog
```
POST /api/blog/new
```
- Creates a new blog post
- Requires authentication

**Request Body:**
```json
{
  "title": "My First Blog Post",
  "description": "This is the content of my first blog post."
}
```

**Response:**
```json
{
  "success": true,
  "blog": {
    "id": "blog_id",
    "title": "My First Blog Post",
    "description": "This is the content of my first blog post.",
    "user": "user_id",
    "createdAt": "2023-01-01T12:00:00Z"
  }
}
```

#### Update Blog
```
PUT /api/blogs/:id
```
- Updates an existing blog post
- Requires authentication
- Only the author can update their own posts

**Request Body:**
```json
{
  "title": "Updated Blog Post Title",
  "description": "Updated content of my blog post."
}
```

**Response:**
```json
{
  "success": true,
  "blog": {
    "id": "blog_id",
    "title": "Updated Blog Post Title",
    "description": "Updated content of my blog post.",
    "user": "user_id",
    "updatedAt": "2023-01-02T12:00:00Z"
  }
}
```

#### Delete Blog
```
DELETE /api/blogs/:id
```
- Deletes a blog post
- Requires authentication
- Only the author can delete their own posts

```

**Response:**
```json
{
  "success": true,
  "message": "Blog post deleted successfully"
}
```

#### Get All Blogs
```
GET /api/blogs
```
- Retrieves all blog posts
- Supports pagination, filtering, and sorting

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Number of blogs per page (default: 10)
- `tag`: Filter by tag
- `user`: Filter by user
- `sort`: Sort by field (default: createdAt)
- `order`: Sort order (asc/desc, default: desc)

**Response:**
```json
{
  "success": true,
  "count": 20,
  "pages": 2,
  "blogs": [
    {
      "id": "blog_id_1",
      "title": "Blog Post 1",
      "user": "<author_object_id>",
      "createdAt": "2023-01-01T12:00:00Z"
    },
    // More blog posts...
  ]
}
```

#### Get Single Blog
```
GET /api/blogs/:id
```
- Retrieves a single blog post by ID

**Response:**
```json
{
  "success": true,
  "blog": {
    "id": "blog_id",
    "title": "My Blog Post",
    "content": "Full content of the blog post...",
    "user": "<author_object_id>",
    "createdAt": "2023-01-01T12:00:00Z",
    "updatedAt": "2023-01-01T12:00:00Z"
  }
}
```

## Redis Implementation

The application uses Redis for:

1. **Caching blog posts**: Frequently accessed blogs are cached to reduce database load
2. **Rate limiting**: Prevents abuse of the API
3. **Session management**: Stores user session data

Key Redis operations:
- `GET` and `SET` for blog caching
- `EXPIRE` for setting TTL on cached items
- `DEL` for invalidating cache on updates

Example implementation in the code:
```javascript
// When fetching a blog
 const key = `${CACHE_KEY}:${blogId}`;
  const cachedBlog = await redis.get(key);
  return cachedBlog ? JSON.parse(cachedBlog) : null;

// When no cache exists
  const blog = await Blog.findById(blogId);
  const key = `${CACHE_KEY}:${blog._id}`
  await redis.set(key, JSON.stringify(blog), "EX", CACHE_EXPIRATION)
```

## Docker Deployment

The application uses Docker Compose to set up three containers:

1. **Node.js Application**:
   - Built from the Dockerfile in the project root
   - Exposes port 4000
   - Connects to MongoDB and Redis containers

2. **MongoDB**:
   - Uses the official MongoDB image
   - Persists data using a Docker volume
   - Exposes port 27017

3. **Redis**:
   - Uses the official Redis image
   - Configures persistence
   - Exposes port 6379

