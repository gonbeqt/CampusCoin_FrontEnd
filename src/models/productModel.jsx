// src/models/productModel.js
class ProductModel {
  constructor() {
    this.baseURL = 'http://localhost:5000/api/products';
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
      return { success: false, error: 'Network error. Please try again.' };
    }
  }
   async getProducts(token, page = 1, limit = 9) {
    try {
      const url = new URL(`${this.baseURL}/product_list`)
      if (page) url.searchParams.set('page', String(page))
      if (limit) url.searchParams.set('limit', String(limit))

      const response = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      })

  const data = await response.json()

      if (!response.ok) {
        return { success: false, error: data?.message || data?.error || 'Failed to fetch products' }
      }

      const pagination = data?.pagination || {}
      const totalProducts =
        typeof data?.totalProducts === 'number'
          ? data.totalProducts
          : Array.isArray(data?.products)
          ? data.products.length
          : 0

      const resolvedPage =
        typeof data?.page === 'number' ? data.page :
        typeof pagination?.page === 'number' ? pagination.page : page

      const backendLimit =
        typeof data?.limit === 'number' ? data.limit :
        typeof pagination?.limit === 'number' ? pagination.limit :
        typeof data?.pageSize === 'number' ? data.pageSize :
        typeof data?.perPage === 'number' ? data.perPage : undefined

      const resolvedLimit = typeof backendLimit === 'number' ? backendLimit : limit

      const totalPages =
        typeof data?.totalPages === 'number' ? data.totalPages :
        typeof pagination?.totalPages === 'number' ? pagination.totalPages :
        Math.max(1, Math.ceil((totalProducts || 0) / (resolvedLimit || 1)))

      // Infer hasNext/hasPrev if backend doesn't send them
      let hasNext
      if (typeof data?.hasNext === 'boolean') {
        hasNext = data.hasNext
      } else if (typeof pagination?.hasNext === 'boolean') {
        hasNext = pagination.hasNext
      } else if (typeof data?.totalPages === 'number' || typeof pagination?.totalPages === 'number') {
        hasNext = resolvedPage < totalPages
      } else if (Array.isArray(data?.products)) {
        // If we received a full page, assume there may be another page; if page size unknown, allow next and correct on fetch
        if (typeof resolvedLimit === 'number' && resolvedLimit > 0) {
          hasNext = data.products.length >= resolvedLimit
        } else {
          hasNext = data.products.length > 0
        }
      } else {
        hasNext = false
      }

      const hasPrev =
        typeof data?.hasPrev === 'boolean' ? data.hasPrev :
        typeof pagination?.hasPrev === 'boolean' ? pagination.hasPrev :
        resolvedPage > 1

      return {
        success: true,
        products: Array.isArray(data?.products) ? data.products : [],
        totalProducts,
        page: resolvedPage,
        limit: resolvedLimit,
        totalPages,
        hasNext,
        hasPrev,
      }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

   async editProduct(productId,data,token) {
  try {
    const res = await fetch(`${this.baseURL}/${productId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
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
          salesCount: data.salesCount || 0,
          avgOrder: data.avgOrder || 0,
          totalSalesProduct:
            Object.values(data.salesByCategory || {}).reduce(
              (sum, cat) => sum + (cat.totalSold || 0),
              0
            ) || 0,
          monthlySales: data.monthlySales || [],
          salesByCategory: data.salesByCategory || {},
        },
      };
    } catch (err) {
      return { success: false, error: 'Network error. Please try again.' };
    }
  }

  async getAllProducts(page = 1, limit = 9) {
    try {
      const token = localStorage.getItem('authToken');
      const url = new URL(`${this.baseURL}/all_products`)
      if (page) url.searchParams.set('page', String(page))
      if (limit) url.searchParams.set('limit', String(limit))

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data?.message || data?.error || 'Failed to fetch products' }
      }

      const pagination = data?.pagination || {}
      const resolvedPage = typeof pagination?.page === 'number' ? pagination.page : page
      const resolvedLimit = typeof pagination?.limit === 'number' ? pagination.limit : limit
      const totalProducts = typeof data?.totalProducts === 'number' ? data.totalProducts : (Array.isArray(data?.products) ? data.products.length : 0)
      const totalPages = typeof pagination?.totalPages === 'number' ? pagination.totalPages : Math.max(1, Math.ceil((totalProducts || 0) / (resolvedLimit || 1)))
      const hasNext = typeof pagination?.hasNext === 'boolean' ? pagination.hasNext : resolvedPage < totalPages
      const hasPrev = typeof pagination?.hasPrev === 'boolean' ? pagination.hasPrev : resolvedPage > 1

      return {
        success: true,
        products: Array.isArray(data?.products) ? data.products : [],
        totalProducts,
        page: resolvedPage,
        limit: resolvedLimit,
        totalPages,
        hasNext,
        hasPrev,
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  }

  async createOrder(productId, quantity) {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${this.baseURL}/order`, {
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

   async getUserOrders(page = 1, limit = 10) {
    try {
      const token = localStorage.getItem('authToken');
      const url = new URL(`${this.baseURL}/my-orders`)
      if (page) url.searchParams.set('page', String(page))
      if (limit) url.searchParams.set('limit', String(limit))

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        return { success: false, error: data?.message || data?.error || 'Failed to fetch user orders' }
      }

      const pagination = data?.pagination || {}
      const resolvedPage = typeof pagination?.page === 'number' ? pagination.page : page
      const resolvedLimit = typeof pagination?.limit === 'number' ? pagination.limit : limit
      const totalOrders = typeof data?.totalOrders === 'number' ? data.totalOrders : (Array.isArray(data?.orders) ? data.orders.length : 0)
      const totalPages = typeof pagination?.totalPages === 'number' ? pagination.totalPages : Math.max(1, Math.ceil((totalOrders || 0) / (resolvedLimit || 1)))
      const hasNext = typeof pagination?.hasNext === 'boolean' ? pagination.hasNext : resolvedPage < totalPages
      const hasPrev = typeof pagination?.hasPrev === 'boolean' ? pagination.hasPrev : resolvedPage > 1

      return {
        success: true,
        orders: Array.isArray(data?.orders) ? data.orders : [],
        totalOrders,
        page: resolvedPage,
        limit: resolvedLimit,
        totalPages,
        hasNext,
        hasPrev,
      }
    } catch (error) {
      console.error('ProductModel.getUserOrders error:', error);
      return { success: false, error: 'Network error' };
    }
   }
  async getAllOrders(token, page = 1, limit = 10) {
    try {
      const url = new URL(`${this.baseURL}/all_orders`)
      if (page) url.searchParams.set('page', String(page))
      if (limit) url.searchParams.set('limit', String(limit))

      const res = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.message || 'Failed to fetch orders' };
      }

      const pagination = data?.pagination || {}
      const resolvedPage = typeof pagination?.page === 'number' ? pagination.page : page
      const resolvedLimit = typeof pagination?.limit === 'number' ? pagination.limit : limit
      const totalOrders = typeof data?.totalOrders === 'number' ? data.totalOrders : (Array.isArray(data?.orders) ? data.orders.length : 0)
      const totalPages = typeof pagination?.totalPages === 'number' ? pagination.totalPages : Math.max(1, Math.ceil((totalOrders || 0) / (resolvedLimit || 1)))
      const hasNext = typeof pagination?.hasNext === 'boolean' ? pagination.hasNext : resolvedPage < totalPages
      const hasPrev = typeof pagination?.hasPrev === 'boolean' ? pagination.hasPrev : resolvedPage > 1

      return {
        success: true,
        orders: Array.isArray(data?.orders) ? data.orders : [],
        totalOrders,
        page: resolvedPage,
        limit: resolvedLimit,
        totalPages,
        hasNext,
        hasPrev,
      };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
  async cancelOrder(orderId, token) {
    try {
      const res = await fetch(`${this.baseURL}/cancel_order/${orderId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.message || 'Failed to cancel order' };
      }

      return {
        success: true,
        message: data.message,
        order: data.order,
      };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
}

export default ProductModel;
