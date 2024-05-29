process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../app");
const db = require("../db");

let testBook;

beforeEach(async () => {
  await db.query("DELETE FROM books");
  const result = await db.query(`
    INSERT INTO books (isbn, amazon_url, author, language, pages, publisher, title, year)
    VALUES ('0691161518', 'http://a.co/eobPtX2', 'Matthew Lane', 'english', 264, 'Princeton University Press', 'Power-Up: Unlocking the Hidden Mathematics in Video Games', 2017)
    RETURNING isbn, amazon_url, author, language, pages, publisher, title, year
  `);
  testBook = result.rows[0];
});

afterEach(async () => {
  await db.query("DELETE FROM books");
});

afterAll(async () => {
  await db.end();
});

describe("POST /books", function () {
  test("Creates a new book", async function () {
    const newBook = {
      isbn: "1234567890",
      amazon_url: "http://a.co/example",
      author: "John Doe",
      language: "english",
      pages: 100,
      publisher: "Example Publisher",
      title: "Example Book",
      year: 2021
    };
    const resp = await request(app).post("/books").send(newBook);
    expect(resp.statusCode).toBe(201);
    expect(resp.body.book).toHaveProperty("isbn");
  });

  test("Prevents creating book without required fields", async function () {
    const resp = await request(app).post("/books").send({});
    expect(resp.statusCode).toBe(400);
  });
});

describe("GET /books", function () {
  test("Gets a list of books", async function () {
    const resp = await request(app).get("/books");
    expect(resp.statusCode).toBe(200);
    expect(resp.body.books.length).toBe(1);
    expect(resp.body.books[0]).toHaveProperty("isbn");
  });
});

describe("GET /books/:isbn", function () {
  test("Gets a single book by ISBN", async function () {
    const resp = await request(app).get(`/books/${testBook.isbn}`);
    expect(resp.statusCode).toBe(200);
    expect(resp.body.book).toHaveProperty("isbn");
    expect(resp.body.book.isbn).toBe(testBook.isbn);
  });

  test("Responds with 404 if can't find book", async function () {
    const resp = await request(app).get("/books/0");
    expect(resp.statusCode).toBe(404);
  });
});

describe("DELETE /books/:isbn", function () {
  test("Deletes a single book", async function () {
    const resp = await request(app).delete(`/books/${testBook.isbn}`);
    expect(resp.statusCode).toBe(200);
    expect(resp.body).toEqual({ message: "Book deleted" });
  });

  test("Responds with 404 if book to delete is not found", async function () {
    const resp = await request(app).delete("/books/0");
    expect(resp.statusCode).toBe(404);
  });
});
