const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const productsFilePath = path.join(__dirname, '../data/products.json');

const readProducts = () => {
    const data = fs.readFileSync(productsFilePath, 'utf8');
    return JSON.parse(data || '[]');
};

const writeProducts = (products) => {
    fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2));
};

// Rutas de productos
router.get('/', (req, res) => {
    const { limit } = req.query;
    const products = readProducts();
    if (limit) return res.json(products.slice(0, Number(limit)));
    res.json(products);
});

router.get('/:pid', (req, res) => {
    const { pid } = req.params;
    const products = readProducts();
    const product = products.find((p) => p.id == pid);
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(product);
});

router.post('/', (req, res) => {
    const { title, description, code, price, stock, category, thumbnails = [], status = true } = req.body;
    if (!title || !description || !code || !price || !stock || !category) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios excepto thumbnails' });
    }
    const products = readProducts();
    const id = products.length ? products[products.length - 1].id + 1 : 1;
    const newProduct = { id, title, description, code, price, stock, category, thumbnails, status };
    products.push(newProduct);
    writeProducts(products);
    res.status(201).json(newProduct);
});

router.put('/:pid', (req, res) => {
    const { pid } = req.params;
    const updates = req.body;
    const products = readProducts();
    const productIndex = products.findIndex((p) => p.id == pid);
    if (productIndex === -1) return res.status(404).json({ error: 'Producto no encontrado' });

    products[productIndex] = { ...products[productIndex], ...updates, id: products[productIndex].id };
    writeProducts(products);
    res.json(products[productIndex]);
});

router.delete('/:pid', (req, res) => {
    const { pid } = req.params;
    let products = readProducts();
    products = products.filter((p) => p.id != pid);
    writeProducts(products);
    res.json({ message: 'Producto eliminado' });
});

module.exports = router;
