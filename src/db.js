const fs = require("fs")
const path = require("path")
const sqlite3 = require("sqlite3").verbose()

require("dotenv").config()

const dbPath = process.env.DB_PATH || "./data/catalogo.sqlite"

// garante que a pasta do db exista
const dbDir = path.dirname(dbPath)
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true })
}

const db = new sqlite3.Database(dbPath)

// helpers prometificados
function run(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) return reject(err)
            resolve({ lastID: this.lastID, changes: this.changes })
        })
    })
}

function get(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) return reject(err)
            resolve(row)
        })
    })
}

function all(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) return reject(err)
            resolve(rows)
        })
    })
}

async function initDb() {
    const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf-8")

    await new Promise((resolve, reject) => {
        db.exec(schema, err => {
            if (err) return reject(err)
            resolve()
        })
    })

    // seed: só cria dados se ainda não existir nada
    const categoryCount = await get("SELECT COUNT(*) AS total FROM categories")
    if (categoryCount.total === 0) {
        await run("INSERT INTO categories (name) VALUES (?)", ["Eletrônicos"])
        await run("INSERT INTO categories (name) VALUES (?)", ["Acessórios"])
        await run("INSERT INTO categories (name) VALUES (?)", ["Casa"])

        const cats = await all("SELECT * FROM categories")
        const eletronicos = cats.find(c => c.name === "Eletrônicos").id
        const acessorios = cats.find(c => c.name === "Acessórios").id
        const casa = cats.find(c => c.name === "Casa").id

        await run(
            "INSERT INTO products (name, description, price, stock, category_id) VALUES (?, ?, ?, ?, ?)",
            ["Mouse Gamer", "Mouse USB com 6 botões", 129.9, 15, acessorios]
        )
        await run(
            "INSERT INTO products (name, description, price, stock, category_id) VALUES (?, ?, ?, ?, ?)",
            ["Teclado Mecânico", "Switch blue, padrão ABNT2", 249.9, 8, acessorios]
        )
        await run(
            "INSERT INTO products (name, description, price, stock, category_id) VALUES (?, ?, ?, ?, ?)",
            ["Headset", "Áudio estéreo com microfone", 199.9, 12, acessorios]
        )
        await run(
            "INSERT INTO products (name, description, price, stock, category_id) VALUES (?, ?, ?, ?, ?)",
            ["Lâmpada Smart", "Wi-Fi, controle por app", 89.9, 20, casa]
        )
        await run(
            "INSERT INTO products (name, description, price, stock, category_id) VALUES (?, ?, ?, ?, ?)",
            ["Mini Projetor", "Portátil, entrada HDMI", 399.9, 5, eletronicos]
        )
    }
}

module.exports = {
    db,
    run,
    get,
    all,
    initDb
}