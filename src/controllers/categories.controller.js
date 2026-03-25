const { all } = require("../db")

async function listCategories(req, res) {
    try {
        const categories = await all("SELECT id, name FROM categories ORDER BY name")
        res.json(categories)
    } catch (err) {
        res.status(500).json({ error: "Erro ao listar categorias" })
    }
}

module.exports = {
    listCategories
}