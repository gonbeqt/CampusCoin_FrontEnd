// src/models/productModel.js

class ProductModel {
  constructor() {
    this.baseURL = 'http://localhost:5000/api/products'; // adjust if different
  }

  async addProduct(formData, token) {
    
    try {
      const response = await fetch(`${this.baseURL}/add`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`, 
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.message || 'Failed to add product' };
      }

      return { success: true, message: data.message, product: data.product };
    } catch (error) {
      console.error('ProductModel.addProduct error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  }
   async getProducts(token) {
    try {
      const res = await fetch(`${this.baseURL}/product_list`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      return await res.json()
    } catch (err) {
      return { error: err.message }
    }
  }

   async editProduct(productId,data,token) {
  try {
    const res = await fetch(`${this.baseURL}/${productId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`, // ✅ must include Bearer
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data),
    });

    return await res.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
}

  async deleteProduct(id, token) {
    try {
      const res = await fetch(`${this.baseURL}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      return await res.json()
    } catch (err) {
      return { error: err.message }
    }
  }
  async getDashboardStats(token) {
    try {
      const res = await fetch(`${this.baseURL}/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.message || 'Failed to fetch stats' };
      }

      return {
        success: true,
        stats: {
          totalProducts: data.totalProducts || 0,
          totalSales: data.totalSales || 0,
          totalRevenue: data.totalRevenue || 0,
        },
      };
    } catch (err) {
      console.error('SellerModel.getDashboardStats error:', err);
      return { success: false, error: 'Network error. Please try again.' };
    }
  }
}

export default new ProductModel();
