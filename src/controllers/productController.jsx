import ProductModel from '../models/productModel';

class ProductController {
  constructor() {
    this.model = new ProductModel();
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

export default new ProductController();