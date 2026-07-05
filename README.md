# 个人电商网站模板

这是一个最小的电商个人网站模板，包含静态前端和一个用 Express 实现的简单后端 API（用于返回产品列表和模拟结账）。

特性
- 商品展示、加入购物车、修改数量
- 本地存储购物车（localStorage）
- 后端模拟结账，订单将追加到 orders.json

运行
1. 安装依赖：
   ```
   npm install
   ```
2. 启动服务：
   ```
   npm start
   ```
   或开发时使用自动重启：
   ```
   npm run dev
   ```
3. 打开浏览器访问 http://localhost:3000

部署建议
- 简单部署：可以部署到 Heroku / Railway / Render 等（把 node 启动命令设为 `npm start`）。
- 若需要真支付：集成 Stripe/PayPal 等支付网关，并在后端完成安全验证。
- 数据持久化：当前订单写入本地 orders.json，仅用于演示。生产环境请替换为数据库（Postgres / MongoDB 等）。

如何自定义
- 修改 products.json 添加/替换商品。
- 修改 public/styles.css 调整样式。
- 扩展后端：在 server.js 中添加用户、订单查询等 API。

许可证
MIT
