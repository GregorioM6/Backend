const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const cartsFilePath = path.join(__dirname, '../data/carts.json');
const productsFilePath = path.join(__dirname, '../data/products.json');

const readData = (filePath) => JSON.parse(fs.readFileSync(filePath, 'utf8') || '[]');
const writeData = (filePath, data) => fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

router.post('/', (req, res) => {
    const carts = readData(cartsFilePath);
    const id = carts.length ? carts[carts.length - 1].id + 1 : 1;
    const newCart = { id, products: [] };
    carts.push(newCart);
    writeData(cartsFilePath, carts);
    res.status(201).json(newCart);
});

router.get('/:cid', (req, res) => {
    const { cid } = req.params;
    const carts = readData(cartsFilePath);
    const cart = carts.find((c) => c.id == cid);
    if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });
    res.json(cart.products);
});

router.post('/:cid/product/:pid', (req, res) => {
    const { cid, pid } = req.params;
    const carts = readData(cartsFilePath);
    const products = readData(productsFilePath);
    
    const cart = carts.find((c) => c.id == cid);
    const product = products.find((p) => p.id == pid);
    if (!cart || !product) return res.status(404).json({ error: 'Carrito o producto no encontrado' });
    
    const existingProduct = cart.products.find((p) => p.product === pid);
    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        cart.products.push({ product: pid, quantity: 1 });
    }
    
    writeData(cartsFilePath, carts);
    res.status(201).json(cart);
});

module.exports = router;
