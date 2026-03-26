const express = require("express")
const cors = require("cors")
require("dotenv").config()

const { initDb } = require("./db")

const categoriesRoutes = require("./routes/categories.routes")
const productsRoutes = require("./routes/products.routes")

const app = express()

app.use(express.json())

// CORS para o front (GitHub Pages -> Railway)
app.use(cors())

// Preflight (OPTIONS) sem usar app.options("*") ou app.options("/*") (isso crasha no Express 5)
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return res.sendStatus(204)
  }
  next()
})

app.get("/", (req, res) => {
  res.json({ status: "ok", name: "Catalogo API" })
})

app.use("/api/categories", categoriesRoutes)
app.use("/api/products", productsRoutes)

const port = process.env.PORT || 3000

initDb()
  .then(() => {
    app.listen(port, () => {
      console.log(`Catalogo API rodando na porta ${port}`)
    })
  })
  .catch(err => {
    console.error("Falha ao iniciar o banco:", err)
    process.exit(1)
  })