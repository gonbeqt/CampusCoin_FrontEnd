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
    const result = await this.model.addProduct(formData, token);

    if (!result.success) {
      return { success: false, error: result.error || 'Unable to add product' };
    }

    return {
      success: true,
      message: result.message,
      product: result.product,
    };
  }
  async getProducts(token, page = 1, limit = 9) {
    if (!token) return { success: false, error: 'Unauthorized' }

    const res = await this.model.getProducts(token, page, limit)
    if (!res?.success) return { success: false, error: res?.error || 'Failed to fetch products' }

    return {
      success: true,
      products: res.products || [],
      total: typeof res.totalProducts === 'number' ? res.totalProducts : (res.products?.length || 0),
      page: res.page,
      limit: res.limit,
      totalPages: res.totalPages,
      hasNext: res.hasNext,
      hasPrev: res.hasPrev,
    }
  }

  async editProduct(id, data, token) {
    if (!id || !data) return { success: false, error: 'Invalid product data' }

    const res = await this.model.editProduct(id, data,token)
    if (res.error) return { success: false, error: res.error }
    return { success: true, message: res.message, product: res.product }
  }

  async deleteProduct(id, token) {
    if (!id) return { success: false, error: 'Product ID required' }

    const res = await this.model.deleteProduct(id, token)
    if (res.error) return { success: false, error: res.error }
    return { success: true, message: res.message }
  }
 

  async getDashboardStats(token) {
    if (!token) {
      return { success: false, error: 'Authentication required. Please log in.' };
    }

    const result = await this.model.getDashboardStats(token);

    if (!result.success) {
      return { success: false, error: result.error || 'Unable to load dashboard stats' };
    }

    return {
      success: true,
      stats: result.stats,
    };
  }

  async getAllOrders(token, page = 1, limit = 10) {
        if (!token) return { success: false, error: 'Unauthorized' };

        const result = await this.model.getAllOrders(token, page, limit);
        if (!result.success) return { success: false, error: result.error };

        return {
          success: true,
          orders: result.orders,
          total: result.totalOrders,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
          hasNext: result.hasNext,
          hasPrev: result.hasPrev,
        };
      }
      async cancelOrder(orderId, token) {
      if (!orderId) return { success: false, error: 'Order ID required' };
      if (!token) return { success: false, error: 'Authentication required' };

      const result = await this.model.cancelOrder(orderId, token);

      if (!result.success) return { success: false, error: result.error };

      return {
        success: true,
        message: result.message,
        order: result.order,
      };
    }

  async getAllProducts(page = 1, limit = 9) {
    try {
      const result = await this.model.getAllProducts(page, limit);
      if (result.success) {
        return {
          success: true,
          products: result.products,
          totalProducts: result.totalProducts,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
          hasNext: result.hasNext,
          hasPrev: result.hasPrev,
        };
      } else {
        return { success: false, error: result.error || 'Failed to fetch products' };
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }

  }

  async cancelOrder(orderId, token) {
      if (!orderId) return { success: false, error: 'Order ID required' };
      if (!token) return { success: false, error: 'Authentication required' };

      const result = await this.model.cancelOrder(orderId, token);

      if (!result.success) return { success: false, error: result.error };

      return {
        success: true,
        message: result.message,
        order: result.order,
      };
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

    async getUserOrders(page = 1, limit = 10) {
    try {
      const result = await this.model.getUserOrders(page, limit);
      if (!result.success) {
        return { success: false, error: result.error || 'Failed to fetch user orders' };
      }
      return {
        success: true,
        orders: result.orders || [],
        totalOrders: result.totalOrders || 0,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
        hasNext: result.hasNext,
        hasPrev: result.hasPrev,
      };
    } catch (error) {
      console.error('ProductController.getUserOrders error:', error);
      return { success: false, error: 'Unexpected error occurred' };
    }
  }
}

const productController = new ProductController();
export default productController;
