const express = require("express")
require("dotenv").config()

const { initDb } = require("./db")

const categoriesRoutes = require("./routes/categories.routes")
const productsRoutes = require("./routes/products.routes")

const app = express()

app.use(express.json())

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