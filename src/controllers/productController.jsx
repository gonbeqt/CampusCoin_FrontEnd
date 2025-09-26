// src/controllers/productController.js
import ProductModel from '../models/productModel.jsx';
class ProductController {
  constructor() {
    this.model = new ProductModel();
  }

  async addProduct(formData, token) {
    
    if (!token) {
      return { success: false, error: 'Authentication required. Please log in.' };
    }

    // Delegate to model
    const result = await ProductModel.addProduct(formData, token);

    if (!result.success) {
      return { success: false, error: result.error || 'Unable to add product' };
    }

    return {
      success: true,
      message: result.message,
      product: result.product,
    };
  }
  async getProducts(token) {
    if (!token) return { success: false, error: 'Unauthorized' }

    const res = await ProductModel.getProducts(token)
    if (res.error) return { success: false, error: res.error }
    return { success: true, products: res.products || [], total: res.totalProducts || 0 }
  }

  async editProduct(id, data, token) {
    if (!id || !data) return { success: false, error: 'Invalid product data' }

    const res = await ProductModel.editProduct(id, data,token)
    if (res.error) return { success: false, error: res.error }
    return { success: true, message: res.message, product: res.product }
  }

  async deleteProduct(id, token) {
    if (!id) return { success: false, error: 'Product ID required' }

    const res = await ProductModel.deleteProduct(id, token)
    if (res.error) return { success: false, error: res.error }
    return { success: true, message: res.message }
  }
 

  async getDashboardStats(token) {
    if (!token) {
      return { success: false, error: 'Authentication required. Please log in.' };
    }

    const result = await ProductModel.getDashboardStats(token);

    if (!result.success) {
      return { success: false, error: result.error || 'Unable to load dashboard stats' };
    }

    return {
      success: true,
      stats: result.stats,
    };
  }

  async getAllProducts() {
    try {
      const result = await this.model.getAllProducts();
      if (result.success) {
        return { success: true, products: result.data.products, totalProducts: result.data.totalProducts };
      } else {
        return { success: false, error: result.error || 'Failed to fetch products' };
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  async createOrder(productId, quantity) {
    try {
      // Validate input
      if (!productId || !quantity || quantity < 1) {
        return { success: false, error: 'Invalid product ID or quantity' };
      }

      const result = await this.model.createOrder(productId, quantity);
      if (result.success) {
        return { 
          success: true, 
          message: 'Order created successfully',
          order: result.data.order 
        };
      } else {
        return { 
          success: false, 
          error: result.error || 'Failed to create order' 
        };
      }
    } catch (error) {
      console.error('Error creating order:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

}

const productController = new ProductController();
export default productController;
