const bookSchema = {
    type: "object",
    properties: {
        isbn: { type: "string" },
        amazon_url: { type: "string", format: "url" },
        author: { type: "string" },
        language: { type: "string" },
        pages: { type: "integer", minimum: 1 },
        publisher: { type: "string" },
        title: { type: "string" },
        year: { type: "integer", minimum: 0, maximum: new Date().getFullYear() }
    },
    required: ["isbn", "amazon_url", "author", "language", "pages", "publisher", "title", "year"]};

    module.exports = bookSchema;
