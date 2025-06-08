"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  // sekmeler
  const [activeTab, setActiveTab] = useState("products"); // active default product sekmesi koydum, değiştirilebilir.
  const [products, setProducts] = useState([]); // ürün listesi burda tutuluyor
  const [orders, setOrders] = useState([]); // sipariş listesi burda tutuluyor. Şuan sadece frontend de, database dekini fetchleyemedim.

  // edit mode, (kaldırılabilir), database trafında kaydetmiyor, delete query si yazılmalı ya da edit !!!
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);

  // Form inputları, product için
  const [product, setProduct] = useState({
    id: "",
    name: "",
    price: "",
    description: "",
  });

  // Order form state
  const [order, setOrder] = useState({
    product_id: "",
    quantity: "",
  });

  // Edit order state
  const [editOrder, setEditOrder] = useState({
    product_id: "",
    quantity: "",
  });

  const [notification, setNotification] = useState({ message: "", type: "" });

  // ürünleri backendden alıyoruz. Sayfa ilk defa yüklenmeye başlandığında /productsa istek gider.
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("http://localhost:8000/products");
        setProducts(response.data);
      } catch (error) {
        console.error("Ürünler alınamadı:", error);
      }
    };

    fetchProducts();
  }, []);

  // bildirimler, 3 saniyelik
  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: "", type: "" }), 3000);
  };

  // Ürün ekleme
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      const formattedProduct = {
        ...product,
        id: Number(product.id),
        price: Number(product.price),
      };

      // Try to send to backend !!!
      try {
        await axios.post("http://localhost:8000/add-product", formattedProduct);
      } catch (error) {
        console.error("API error:", error);
      }

      // Updating
      setProducts([...products, formattedProduct]);

      // formu resetle
      setProduct({ id: "", name: "", price: "", description: "" });

      showNotification("Ürün başarıyla eklendi!");
    } catch (error) {
      showNotification("Ürün eklenirken hata oluştu.", "error");
    }
  };

  // sipariş ekleme
  // !!! Sipariş veritabanına ekleniyor ama GET ile alınmıyor; sadece frontend tarafında tutuluyor.
  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    try {
      const formattedOrder = {
        ...order,
        product_id: Number(order.product_id),
        quantity: Number(order.quantity),
      };

      try {
        await axios.post("http://localhost:8000/add-order", formattedOrder);
      } catch (error) {
        console.error("API error:", error);
      }

      // Update local state with yeni eklenen infolar ile
      const newOrder = {
        ...formattedOrder,
        id: Date.now(),
        date: new Date(),
      };
      setOrders([...orders, newOrder]);

      // formu resetlemeyi unutma
      setOrder({ product_id: "", quantity: "" });

      showNotification("Sipariş başarıyla oluşturuldu!");
    } catch (error) {
      showNotification("Sipariş eklenirken hata oluştu.", "error");
    }
  };

  // siparişi düzenlemek için, database le entegre değil, belki çıkartılabilir
  const handleEditOrder = (orderToEdit) => {
    setEditingOrder(orderToEdit);
    setEditOrder({
      product_id: orderToEdit.product_id.toString(),
      quantity: orderToEdit.quantity.toString(),
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    const updatedOrder = {
      ...editingOrder,
      product_id: Number(editOrder.product_id),
      quantity: Number(editOrder.quantity),
    };

    setOrders(
      orders.map((order) =>
        order.id === editingOrder.id ? updatedOrder : order
      )
    );

    setShowEditModal(false);
    setEditingOrder(null);
    showNotification("Sipariş başarıyla güncellendi!");
  };

  // kullanıcı siparişi silmek isterse diye ekledim, tekarda database ile entegre değil, ayarlanmalı
  const handleDeleteOrder = (orderId) => {
    setOrders(orders.filter((order) => order.id !== orderId));
    showNotification("Sipariş başarıyla silindi!");
  };

  const getProductName = (productId) => {
    const product = products.find((p) => p.id === productId);
    return product ? product.name : "Bilinmeyen Ürün";
  };

  const getProductPrice = (productId) => {
    const product = products.find((p) => p.id === productId);
    return product ? product.price : 0;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateTotal = (productId, quantity) => {
    const price = getProductPrice(productId);
    return (price * quantity).toFixed(2);
  };

  return (
    <div className="app">
      {/* Notification */}
      {notification.message && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <header className="header">
        <h1>Ürün ve Sipariş Yönetimi</h1>
        <p>Ürünleri ekleyin ve siparişleri yönetin</p>
      </header>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === "products" ? "active" : ""}`}
          onClick={() => setActiveTab("products")}
        >
          Ürünler
        </button>
        <button
          className={`tab ${activeTab === "orders" ? "active" : ""}`}
          onClick={() => setActiveTab("orders")}
        >
          Siparişler
        </button>
        <button
          className={`tab ${activeTab === "manage" ? "active" : ""}`}
          onClick={() => setActiveTab("manage")}
        >
          Sipariş Düzenle
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Ürünler*/}
        {activeTab === "products" && (
          <div className="products-section">
            <div className="grid">
              {/* Ürün formu, ekleme kısmı */}
              <div className="card">
                <div className="card-header">
                  <h2>Yeni Ürün Ekle</h2>
                  <p>
                    Ürün bilgilerini girerek envantere yeni bir ürün ekleyin.
                  </p>
                </div>
                <form onSubmit={handleProductSubmit} className="form">
                  <div className="form-group">
                    <label htmlFor="product-id">Ürün ID</label>
                    <input
                      id="product-id"
                      type="number"
                      placeholder="Ürün ID"
                      value={product.id}
                      onChange={(e) =>
                        setProduct({ ...product, id: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="product-name">Ürün Adı</label>
                    <input
                      id="product-name"
                      placeholder="Ürün adı"
                      value={product.name}
                      onChange={(e) =>
                        setProduct({ ...product, name: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="product-price">Fiyat (₺)</label>
                    <input
                      id="product-price"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={product.price}
                      onChange={(e) =>
                        setProduct({ ...product, price: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="product-description">Açıklama</label>
                    <textarea
                      id="product-description"
                      placeholder="Ürün açıklaması"
                      value={product.description}
                      onChange={(e) =>
                        setProduct({ ...product, description: e.target.value })
                      }
                      required
                    />
                  </div>

                  <button type="submit" className="btn btn-primary">
                    Ürün Ekle
                  </button>
                </form>
              </div>

              {/* Ürün listesi */}
              <div className="card">
                <div className="card-header">
                  <h2>Ürün Listesi</h2>
                  <p>Mevcut ürünlerin listesi</p>
                </div>
                <div className="card-content">
                  {products.length === 0 ? (
                    <p className="empty-state">Henüz ürün eklenmemiş</p>
                  ) : (
                    <table className="table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Ürün</th>
                          <th>Fiyat</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((product) => (
                          <tr key={product.id}>
                            <td>{product.id}</td>
                            <td>{product.name}</td>
                            <td>{product.price.toFixed(2)} ₺</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div className="orders-section">
            <div className="card order-form-card">
              <div className="card-header">
                <h2>Yeni Sipariş Oluştur</h2>
                <p>Ürün seçerek yeni bir sipariş oluşturun.</p>
              </div>

              {products.length === 0 ? (
                <div className="card-content">
                  <div className="alert alert-error">
                    <strong>Ürün bulunamadı</strong>
                    <p>Sipariş oluşturmak için önce ürün eklemelisiniz.</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleOrderSubmit} className="form">
                  <div className="form-group">
                    <label htmlFor="product-select">Ürün Seçin</label>
                    <select
                      id="product-select"
                      value={order.product_id}
                      onChange={(e) =>
                        setOrder({ ...order, product_id: e.target.value })
                      }
                      required
                    >
                      <option value="">Ürün seçin</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name} - {product.price.toFixed(2)} ₺
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="quantity">Miktar</label>
                    <input
                      id="quantity"
                      type="number"
                      min="1"
                      placeholder="Sipariş miktarı"
                      value={order.quantity}
                      onChange={(e) =>
                        setOrder({ ...order, quantity: e.target.value })
                      }
                      required
                    />
                  </div>

                  {order.product_id && order.quantity && (
                    <div className="order-summary">
                      <div className="summary-title">Sipariş Özeti</div>
                      <div className="summary-content">
                        <p>Ürün: {getProductName(Number(order.product_id))}</p>
                        <p>
                          Birim Fiyat:{" "}
                          {getProductPrice(Number(order.product_id)).toFixed(2)}{" "}
                          ₺
                        </p>
                        <p className="total">
                          Toplam:{" "}
                          {calculateTotal(
                            Number(order.product_id),
                            Number(order.quantity)
                          )}{" "}
                          ₺
                        </p>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={!order.product_id || !order.quantity}
                  >
                    Sipariş Oluştur
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Siparişleri görüntüle */}
        {activeTab === "manage" && (
          <div className="manage-section">
            <div className="card">
              <div className="card-header">
                <h2>Sipariş Listesi</h2>
                <p>Mevcut siparişleri görüntüleyin, düzenleyin veya silin</p>
              </div>
              <div className="card-content">
                {orders.length === 0 ? (
                  <p className="empty-state">Henüz sipariş bulunmuyor</p>
                ) : (
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Sipariş ID</th>
                        <th>Ürün</th>
                        <th>Miktar</th>
                        <th>Toplam</th>
                        <th>Tarih</th>
                        <th>İşlemler</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id}>
                          <td>{order.id}</td>
                          <td>{getProductName(order.product_id)}</td>
                          <td>{order.quantity}</td>
                          <td>
                            {calculateTotal(order.product_id, order.quantity)} ₺
                          </td>
                          <td>{formatDate(order.date)}</td>
                          <td>
                            <div className="action-buttons">
                              <button
                                className="btn btn-small btn-secondary"
                                onClick={() => handleEditOrder(order)}
                              >
                                Düzenle
                              </button>
                              <button
                                className="btn btn-small btn-danger"
                                onClick={() => handleDeleteOrder(order.id)}
                              >
                                Sil
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Siparişi düzenleme kısmı*/}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Sipariş Düzenle</h3>
              <button
                className="close-btn"
                onClick={() => setShowEditModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-content">
              <div className="form-group">
                <label htmlFor="edit-product">Ürün</label>
                <select
                  id="edit-product"
                  value={editOrder.product_id}
                  onChange={(e) =>
                    setEditOrder({ ...editOrder, product_id: e.target.value })
                  }
                >
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} - {product.price.toFixed(2)} ₺
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="edit-quantity">Miktar</label>
                <input
                  id="edit-quantity"
                  type="number"
                  min="1"
                  value={editOrder.quantity}
                  onChange={(e) =>
                    setEditOrder({ ...editOrder, quantity: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowEditModal(false)}
              >
                İptal
              </button>
              <button className="btn btn-primary" onClick={handleSaveEdit}>
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
