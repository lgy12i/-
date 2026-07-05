(async function(){
  const productsEl = document.getElementById('products');
  const cartButton = document.getElementById('cart-button');
  const cartCountEl = document.getElementById('cart-count');
  const cartDrawer = document.getElementById('cart-drawer');
  const closeCart = document.getElementById('close-cart');
  const cartItemsEl = document.getElementById('cart-items');
  const cartTotalEl = document.getElementById('cart-total');
  const checkoutButton = document.getElementById('checkout-button');
  const toast = document.getElementById('toast');

  let products = [];
  let cart = JSON.parse(localStorage.getItem('cart') || '[]');

  function showToast(msg, ms=2000){
    toast.textContent = msg;
    toast.classList.remove('hidden');
    setTimeout(()=>toast.classList.add('hidden'), ms);
  }

  function saveCart(){
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartUI();
  }

  function updateCartUI(){
    cartCountEl.textContent = cart.reduce((s,i)=>s+(i.quantity||1),0);
    renderCartItems();
  }

  function addToCart(id){
    const p = products.find(x=>x.id===id);
    if(!p) return;
    const existing = cart.find(i=>i.id===id);
    if(existing) existing.quantity = (existing.quantity||1) + 1;
    else cart.push({ id, quantity: 1 });
    saveCart();
    showToast('已加入购物车');
  }

  function removeFromCart(id){
    cart = cart.filter(i=>i.id!==id);
    saveCart();
  }

  function changeQuantity(id, delta){
    const item = cart.find(i=>i.id===id);
    if(!item) return;
    item.quantity = Math.max(1, (item.quantity||1) + delta);
    saveCart();
  }

  function renderProducts(){
    productsEl.innerHTML = '';
    products.forEach(p=>{
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <img src="${p.image}" alt="${p.name}" />
        <div class="card-body">
          <h3 class="card-title">${p.name}</h3>
          <div class="card-desc">${p.description}</div>
          <div class="card-footer">
            <div>¥${p.price.toFixed(2)}</div>
            <button class="btn add-btn">加入</button>
          </div>
        </div>
      `;
      card.querySelector('.add-btn').addEventListener('click', ()=>addToCart(p.id));
      productsEl.appendChild(card);
    });
  }

  function renderCartItems(){
    cartItemsEl.innerHTML = '';
    let total = 0;
    cart.forEach(ci=>{
      const p = products.find(x=>x.id===ci.id);
      if(!p) return;
      const itemEl = document.createElement('div');
      itemEl.className = 'cart-item';
      itemEl.innerHTML = `
        <img src="${p.image}" alt="${p.name}" />
        <div class="meta">
          <div style="font-weight:600">${p.name}</div>
          <div style="color:#666">¥${p.price.toFixed(2)} × ${ci.quantity}</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:6px">
          <button class="btn secondary dec">-</button>
          <button class="btn secondary inc">+</button>
        </div>
      `;
      itemEl.querySelector('.dec').addEventListener('click', ()=>{ changeQuantity(ci.id, -1); });
      itemEl.querySelector('.inc').addEventListener('click', ()=>{ changeQuantity(ci.id, 1); });
      cartItemsEl.appendChild(itemEl);
      total += p.price * (ci.quantity || 1);
    });
    cartTotalEl.textContent = total.toFixed(2);
  }

  cartButton.addEventListener('click', ()=>{
    cartDrawer.classList.toggle('hidden');
  });
  closeCart.addEventListener('click', ()=>cartDrawer.classList.add('hidden'));

  checkoutButton.addEventListener('click', async ()=>{
    if(cart.length === 0){ showToast('购物车为空'); return; }
    checkoutButton.disabled = true;
    try{
      const resp = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart, customer: { name: '匿名', email: '' } })
      });
      const data = await resp.json();
      if(resp.ok && data.success){
        cart = [];
        saveCart();
        showToast('支付成功，订单号：' + data.orderId, 3000);
        cartDrawer.classList.add('hidden');
      } else {
        showToast(data.error || '结账失败');
      }
    } catch(e){
      showToast('网络错误');
    } finally {
      checkoutButton.disabled = false;
    }
  });

  // load products
  try{
    const r = await fetch('/api/products');
    products = await r.json();
    renderProducts();
    updateCartUI();
  } catch(e){
    productsEl.innerHTML = '<p>加载产品失败，请稍后重试</p>';
  }
})();
