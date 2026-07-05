const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const PRODUCTS_FILE = path.join(__dirname, 'products.json');
const ORDERS_FILE = path.join(__dirname, 'orders.json');

app.get('/api/products', (req, res) => {
  fs.readFile(PRODUCTS_FILE, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: '无法读取产品数据' });
    try {
      const products = JSON.parse(data);
      res.json(products);
    } catch (e) {
      res.status(500).json({ error: '产品数据格式错误' });
    }
  });
});

app.post('/api/checkout', (req, res) => {
  const { cart, customer } = req.body;
  if (!cart || !Array.isArray(cart) || cart.length === 0) {
    return res.status(400).json({ error: '购物车为空' });
  }

  fs.readFile(PRODUCTS_FILE, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: '无法读取产品数据' });
    let products;
    try {
      products = JSON.parse(data);
    } catch (e) {
      return res.status(500).json({ error: '产品数据格式错误' });
    }

    let total = 0;
    for (const item of cart) {
      const p = products.find(x => x.id === item.id);
      if (!p) return res.status(400).json({ error: `产品 ${item.id} 不存在` });
      total += p.price * (item.quantity || 1);
    }

    const order = {
      id: `ORD-${Date.now()}`,
      createdAt: new Date().toISOString(),
      total,
      items: cart,
      customer: customer || {}
    };

    // append order to ORDERS_FILE (create if not exists)
    fs.readFile(ORDERS_FILE, 'utf8', (e, ordersData) => {
      let orders = [];
      if (!e) {
        try { orders = JSON.parse(ordersData); } catch (err) { orders = []; }
      }
      orders.push(order);
      fs.writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2), () => {
        // ignore write errors for simplicity
        res.json({ success: true, orderId: order.id, total });
      });
    });
  });
});

// fallback for SPA or index
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
