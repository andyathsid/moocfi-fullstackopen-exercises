const _ = require('lodash')

// eslint-disable-next-line no-unused-vars
const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  const reducer = (sum, item) => {
    return sum + item
  }

  return blogs.length === 0
    ? 0
    : blogs.map(blog => blog.likes).reduce(reducer, 0)
}

const favoriteBlog = (blogs) => {

  return blogs.length === 0
    ? null
    : blogs.reduce((prev, current) => (prev && prev.likes > current.likes) ? prev : current)
}

const mostBlogs = (blogs) => {
  if (blogs.length === 0) {
    return null
  }

  const blogCount = _.countBy(blogs, 'author')
  const maxBlogs = _.max(_.values(blogCount))
  const authorWithMostBlogs = _.findKey(blogCount, (count) => count === maxBlogs)

  return {
    author: authorWithMostBlogs,
    blogs: maxBlogs
  }
}

const mostLikes = (blogs) => {
  if (blogs.length === 0) {
    return null
  }
  const likesByAuthor = _.groupBy(blogs, 'author')
  const likesCount = _.mapValues(likesByAuthor, (authorBlogs) => {
    return _.sumBy(authorBlogs, 'likes')
  })
  const maxLikes = _.max(_.values(likesCount))
  const authorWithMostLikes = _.findKey(likesCount, (count) => count === maxLikes)

  return {
    author: authorWithMostLikes,
    likes: maxLikes
  }
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}