const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const { userExtractor } = require('../utils/middleware')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
  response.json(blogs)
})

blogsRouter.post('/', userExtractor, async (request, response) => {
  const body = request.body
  const user = request.user

  if (!body.title || !body.url) {
    return response.status(400).end()
  }

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0,
    user: user._id
  })

  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', userExtractor, async (request, response) => {

  const user = request.user

  const blogToDelete = await Blog.findById(request.params.id)

  if (!blogToDelete) {
    return response.status(404).json({ error: 'Blog not found' })
  }

  if (blogToDelete && blogToDelete.user.toString() !== user._id.toString()) {
    return response.status(403).json({ error: 'You are not authorized to delete this blog' })
  }

  if (blogToDelete && blogToDelete.user.toString() === user._id.toString()) {
    await Blog.findByIdAndDelete(request.params.id)
    user.blogs = user.blogs.filter(blogId => blogId.toString() !== blogToDelete._id.toString())
    await user.save()
    response.status(204).end()
  }
})

blogsRouter.put('/:id', userExtractor, async (request, response) => {
  const user = request.user

  const blogToUpdate = await Blog.findById(request.params.id)

  if (!blogToUpdate) {
    return response.status(404).json({ error: 'Blog not found' })
  }

  if (blogToUpdate && blogToUpdate.user.toString() !== user._id.toString()) {
    return response.status(403).json({ error: 'You are not authorized to update this blog' })
  }

  const updatedBlog = await Blog.findByIdAndUpdate(
    request.params.id,
    request.body,
    { new: true}
  )
  response.status(200).json(updatedBlog)
})

module.exports = blogsRouter
