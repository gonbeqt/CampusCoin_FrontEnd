const API_URL = 'http://localhost:5000';

class ProductModel {
  async getAllProducts() {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/api/products/all_products`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();
      return {
        success: response.ok,
        data: response.ok ? result : null,
        error: response.ok ? null : result.error || result.message,
      };
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  }

  async createOrder(productId, quantity) {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/api/products/order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, quantity }),
      });
      const result = await response.json();
      return {
        success: response.ok,
        data: response.ok ? result : null,
        error: response.ok ? null : result.error || result.message,
      };
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  }
}

export default ProductModel;