// controllers/productController.js
const productService = require('../services/productService');
const { NotFoundError, ValidationError } = require('../middleware/errors');

// GET /api/products
const getProducts = (req, res, next) => {
  try {
    let products = productService.getAllProducts();

    // Filter by category
    if (req.query.category) {
      const category = req.query.category.toLowerCase();
      products = products.filter(p => p.category.toLowerCase() === category);
    }

    // Search by name
    if (req.query.search) {
      const term = req.query.search.toLowerCase();
      products = products.filter(p => p.name.toLowerCase().includes(term));
    }

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || products.length; // default all
    const start = (page - 1) * limit;
    const end = start + limit;

    const paginated = products.slice(start, end);

    res.json({
      page,
      limit,
      total: products.length,
      data: paginated
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/products/:id
const getProduct = (req, res, next) => {
  try {
    const product = productService.getProductById(req.params.id);
    if (!product) throw new NotFoundError('Product not found');
    res.json(product);
  } catch (err) {
    next(err);
  }
};

// POST /api/products
const createProduct = (req, res, next) => {
  try {
    const { name, description, price, category, inStock } = req.body;
    if (!name || !description || price == null || !category) {
      throw new ValidationError('All fields are required');
    }

    const newProduct = productService.createProduct({ name, description, price, category, inStock });
    res.status(201).json(newProduct);
  } catch (err) {
    next(err);
  }
};

// PUT /api/products/:id
const updateProduct = (req, res, next) => {
  try {
    const updated = productService.updateProduct(req.params.id, req.body);
    if (!updated) throw new NotFoundError('Product not found');
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/products/:id
const deleteProduct = (req, res, next) => {
  try {
    const deleted = productService.deleteProduct(req.params.id);
    if (!deleted) throw new NotFoundError('Product not found');
    res.json({ message: 'Product deleted successfully', product: deleted });
  } catch (err) {
    next(err);
  }
};

// GET /api/products/stats
const getProductStats = (req, res, next) => {
  try {
    const products = productService.getAllProducts();
    const stats = {};

    products.forEach(p => {
      stats[p.category] = (stats[p.category] || 0) + 1;
    });

    res.json(stats);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductStats
};
