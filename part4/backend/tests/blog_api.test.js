const assert = require('node:assert')
const { test, after, beforeEach, describe } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
const Blog = require('../models/blog')
const User = require('../models/user')

const api = supertest(app)

describe('blog api tests', () => {
  let token

  beforeEach(async () => {
    await Blog.deleteMany({})
    await User.deleteMany({})

    const user = {
      username: 'testuser',
      name: 'Test User',
      password: 'testpassword'
    }

    const userResponse = await api
      .post('/api/users')
      .send(user)
      .expect(201)

    const blogs = helper.initialBlogs.map(blog => ({
      ...blog,
      user: userResponse.body.id
    }))
    const savedBlogs = await Blog.insertMany(blogs)

    await User.findByIdAndUpdate(userResponse.body.id, {
      blogs: savedBlogs.map(blog => blog._id)
    })

    const loginResponse = await api
      .post('/api/login')
      .send({ username: user.username, password: user.password })
      .expect(200)

    token = loginResponse.body.token
  })

  describe('when there is initially some blogs saved', () => {
    test('blogs are returned as json', async () => {
      await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)
    })

    test('all blogs are returned', async () => {
      const response = await api.get('/api/blogs')

      assert.strictEqual(response.body.length, helper.initialBlogs.length)
    })

    test('a specific blog is within the returned blogs', async () => {
      const exampleBlog = helper.initialBlogs[0]
      const response = await api.get('/api/blogs')

      const titles = response.body.map(blog => blog.title)
      assert(titles.includes(exampleBlog.title))
    })

    test('verify that the unique identifier property of the blog posts is named id', async () => {
      const response = await api.get('/api/blogs')
      assert(response.body[0].id)
      assert(!response.body[0]._id)
    })

  })

  describe('addition of a new blog', () => {
    test('test user can log in', () => {
      assert(token)
    })

    test('succeeds with valid data', async () => {

      const blogsAtStart = await helper.blogsInDb()

      const newBlog = {
        _id: '5a422aa71b54a676234d17f8',
        title: 'Go To Statement Considered Harmful',
        author: 'Edsger W. Dijkstra',
        url: 'https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf',
        likes: 5,
        __v: 0
      }

      await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const blogsAtEnd = await helper.blogsInDb()

      assert.strictEqual(blogsAtEnd.length, blogsAtStart.length + 1)

    })

    test('likes default to 0', async () => {
      const blogsAtStart = await helper.blogsInDb()

      const newBlog =
        {
          _id: '5a422ba71b54a676234d17fb',
          title: 'TDD harms architecture',
          author: 'Robert C. Martin',
          url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
          __v: 0
        }


      await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const blogsAtEnd = await helper.blogsInDb()

      assert.strictEqual(blogsAtEnd.length, blogsAtStart.length + 1)
      assert.strictEqual(blogsAtEnd[blogsAtEnd.length - 1].likes, 0)
    })

    test('url is missing', async () => {

      const blogsAtStart = await helper.blogsInDb()

      const newBlog =
        {
          _id: '5a422b891b54a676234d17fa',
          title: 'First class tests',
          author: 'Robert C. Martin',
          likes: 12,
          __v: 0
        }


      await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(400)


      const blogsAtEnd = await helper.blogsInDb()

      assert.strictEqual(blogsAtEnd.length, blogsAtStart.length)
    })

    test('title is missing', async () => {
      const blogsAtStart = await helper.blogsInDb()

      const newBlog =
        {
          _id: '5a422bc61b54a676234d17fc',
          author: 'Robert C. Martin',
          url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
          likes: 2,
          __v: 0
        }

      await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(400)

      const blogsAtEnd = await helper.blogsInDb()

      assert.strictEqual(blogsAtEnd.length, blogsAtStart.length)
    })

    test('fails with status code 401 if token is not provided', async () => {
      const newBlog = {
        _id: '5a422aa71b54a676234d17f8',
        title: 'Go To Statement Considered Harmful',
        author: 'Edsger W. Dijkstra',
        url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
        likes: 12,
      }

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(401)

    })

  })

  describe('deletion of a blog', () => {
    test('succeeds with status code 204 if id is valid', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToDelete = blogsAtStart[0]
      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, blogsAtStart.length - 1)
      const titles = blogsAtEnd.map(blog => blog.title)
      assert(!titles.includes(blogToDelete.title))
    })

    test('fails with status code 404 if blog does not exist', async () => {
      const validNonexistingId = await helper.nonExistingId()
      const blogsAtStart = await helper.blogsInDb()

      await api
        .delete(`/api/blogs/${validNonexistingId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404)
      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, blogsAtStart.length)
    })
  })

  describe('updating a blog', () => {
    test('succeeds with status code 200 if id is valid', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToUpdate = blogsAtStart[0]
      const updatedBlogData = { ...blogToUpdate, likes: blogToUpdate.likes + 1 }

      await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updatedBlogData)
        .expect(200)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, blogsAtStart.length)
      assert.strictEqual(blogsAtEnd.find(blog => blog.id === blogToUpdate.id).likes, updatedBlogData.likes)
    })

    test('fails with status code 404 if blog does not exist', async () => {
      const validNonexistingId = await helper.nonExistingId()
      const blogsAtStart = await helper.blogsInDb()
      const updatedBlogData = { ...blogsAtStart[0], likes: blogsAtStart[0].likes + 1 }

      await api
        .put(`/api/blogs/${validNonexistingId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updatedBlogData)
        .expect(404)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, blogsAtStart.length)
    })

  })

})

after(async () => {
  await mongoose.connection.close()
})
