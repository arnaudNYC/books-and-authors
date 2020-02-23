import React from 'react'
import PropTypes from 'prop-types'

function reducer(state, action) {
  const { type } = action

  switch (type) {
    case 'LOAD_AUTHORS_SUCCESS': {
      const { payload: authors } = action
      return {
        ...state,
        authors,
      }
    }

    case 'LOAD_BOOKS_SUCCESS': {
      const { payload: books } = action
      const lookupTable = books.reduce((acc, book) => {
        const { authorId, ...newBook } = book
        if (acc[authorId]) {
          acc[authorId].push(newBook)
        } else {
          acc[authorId] = [newBook]
        }
        return acc
      }, {})

      return {
        ...state,
        authors: state.authors.map(author => ({
          ...author,
          books: lookupTable[author.id] || [],
        })),
      }
    }

    case 'LOAD_BOOKS_BY_AUTHOR_SUCCESS': {
      const { payload } = action
      const { books, authorId } = payload
      return {
        ...state,
        authors: state.authors.map(author => {
          if (author.id === authorId) {
            return {
              ...author,
              books,
            }
          }
          return author
        }),
      }
    }

    default:
      return state
  }
}

function App() {
  const [state, dispatch] = React.useReducer(reducer, {
    authors: [],
  })

  const fetchAuthors = async () => {
    const response = await fetch('/authors')
    const authors = await response.json()
    dispatch({
      type: 'LOAD_AUTHORS_SUCCESS',
      payload: authors,
    })
  }

  const fetchBooks = async () => {
    const response = await fetch('/books')
    const books = await response.json()
    dispatch({
      type: 'LOAD_BOOKS_SUCCESS',
      payload: books,
    })
  }

  const fetchBooksByAuthorId = async authorId => {
    const response = await fetch(`/authors/${authorId}/books`)
    const books = await response.json()
    dispatch({
      type: 'LOAD_BOOKS_BY_AUTHOR_SUCCESS',
      payload: {
        authorId,
        books,
      },
    })
  }

  React.useEffect(() => {
    fetchAuthors()
  }, [])

  const { authors } = state
  return (
    <>
      <div>
        <Authors authors={authors} onClick={fetchBooksByAuthorId} />
        <input type="button" value="Load Authors" onClick={fetchAuthors} />
        <input type="button" value="Load Books" onClick={fetchBooks} />
      </div>
      <div>
        <Debug state={state} />
      </div>
    </>
  )
}

function Authors({ authors, onClick }) {
  return (
    <ul>
      {authors.map(author => (
        <Author key={author.id} author={author} onClick={onClick} />
      ))}
    </ul>
  )
}

function Author({ author, onClick }) {
  const { id, name, books } = author
  return (
    <li>
      {name}
      <input type="button" value="+" onClick={() => onClick(id)} />
      <Books books={books} />
    </li>
  )
}

function Books({ books }) {
  return books ? (
    <ul>
      {books.map(book => (
        <Book key={book.id} book={book} />
      ))}
    </ul>
  ) : null
}

function Book({ book }) {
  const { title } = book
  return <li>{title}</li>
}

function Debug({ state }) {
  const [show, setShow] = React.useState(false)
  const onChange = () => setShow(!show)

  return (
    <>
      <form>
        <label htmlFor="show">
          Show state
          <input
            type="checkbox"
            checked={show}
            id="show"
            name="show"
            onChange={onChange}
          />
        </label>
      </form>
      {show && <pre>{JSON.stringify(state, null, 2)}</pre>}
    </>
  )
}

export default App

// prop types

const bookShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
})

const authorShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  books: PropTypes.arrayOf(bookShape),
})

Authors.propTypes = {
  authors: PropTypes.arrayOf(authorShape),
  onClick: PropTypes.func.isRequired,
}

Authors.defaultProps = {
  authors: [],
}

Author.propTypes = {
  author: authorShape.isRequired,
  onClick: PropTypes.func.isRequired,
}

Books.propTypes = {
  books: PropTypes.arrayOf(bookShape),
}

Books.defaultProps = {
  books: [],
}

Book.propTypes = {
  book: bookShape.isRequired,
}

Debug.propTypes = {
  state: PropTypes.shape({
    authors: PropTypes.arrayOf(authorShape).isRequired,
  }).isRequired,
}
