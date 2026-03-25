const { all, get, run } = require("../db")

async function listProducts(req, res) {
  try {
    const products = await all(`
      SELECT
        p.id,
        p.name,
        p.description,
        p.price,
        p.stock,
        p.created_at,
        c.id AS category_id,
        c.name AS category_name
      FROM products p
      JOIN categories c ON c.id = p.category_id
      ORDER BY p.id DESC
    `)

    res.json(products)
  } catch (err) {
    res.status(500).json({ error: "Erro ao listar produtos" })
  }
}

async function getProductById(req, res) {
  try {
    const { id } = req.params

    const product = await get(
      `
      SELECT
        p.id,
        p.name,
        p.description,
        p.price,
        p.stock,
        p.created_at,
        c.id AS category_id,
        c.name AS category_name
      FROM products p
      JOIN categories c ON c.id = p.category_id
      WHERE p.id = ?
      `,
      [id]
    )

    if (!product) {
      return res.status(404).json({ error: "Produto não encontrado" })
    }

    res.json(product)
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar produto" })
  }
}

async function createProduct(req, res) {
  try {
    const { name, description, price, stock, category_id } = req.body

    if (!name || price === undefined || stock === undefined || !category_id) {
      return res.status(400).json({
        error: "Campos obrigatórios: name, price, stock, category_id"
      })
    }

    const category = await get("SELECT id FROM categories WHERE id = ?", [category_id])
    if (!category) {
      return res.status(400).json({ error: "category_id inválido" })
    }

    const result = await run(
      `
      INSERT INTO products (name, description, price, stock, category_id)
      VALUES (?, ?, ?, ?, ?)
      `,
      [name, description || null, price, stock, category_id]
    )

    const created = await getProduct(result.lastID)

    res.status(201).json(created)
  } catch (err) {
    res.status(500).json({ error: "Erro ao criar produto" })
  }
}

async function getProduct(productId) {
  return get(
    `
    SELECT
      p.id,
      p.name,
      p.description,
      p.price,
      p.stock,
      p.created_at,
      c.id AS category_id,
      c.name AS category_name
    FROM products p
    JOIN categories c ON c.id = p.category_id
    WHERE p.id = ?
    `,
    [productId]
  )
}

module.exports = {
  listProducts,
  getProductById,
  createProduct
}