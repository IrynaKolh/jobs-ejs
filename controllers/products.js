const Product = require("../models/Product");

const getAllProducts = async (req, res) => {  
  const products = await Product.find({ createdBy: req.user._id }).sort(
    "createdAt"
  );    
  res.render("products", { products });
};

const newProduct = async (req, res) => {
  res.render("product", { product: null });
}

const createProduct = async (req, res) => {  
  req.body.createdBy = req.user._id.toString();
  const { name, price, description } = req.body;

  if (name === '' || price === '' || description === '' ) {
    req.flash('error', 'All equired fields cannot be empty.');
    res.redirect('/products/new');
  }

  const product = await Product.create({ ...req.body });

  res.redirect("/products");
};

const editProduct = async (req, res) => {

  const productId = req.params.id;
  const userId = req.user._id.toString();
  
  const product = await Product.findOne({
    _id: productId,
    createdBy: userId,
  });
  if (!product) {
    req.flash("error", `No product with id: ${productId}`);
    res.redirect("/products");
  }
  res.render("product", { product });
}

const updateProduct = async (req, res) => {
  const userId = req.user._id.toString();
  const productId = req.params.id;
  const { productName, price, description, type } = req.body;

  if (productName === '' || price === '' || description === '' ) {
    req.flash('error', 'All equired fields cannot be empty.');
    res.redirect('/products');
  }

  const product = await Product.findOneAndUpdate(
    { _id: productId, createdBy: userId },
    req.body,
    { new: true, runValidators: true }
  );

  if (!product) {
    req.flash("error", `No product with id: ${productId}`);
    res.redirect("/products");
  }
  res.redirect("/products");
};

const deleteProduct = async (req, res) => {
  const userId = req.user._id.toString();
  const productId = req.params.id;

   const product = await Product.findOneAndDelete({
     _id: productId,
     createdBy: userId,
   });
   if (!product) {
    req.flash("error", `No product with id: ${productId}`);
  }
   res.redirect("/products");
};

module.exports = {
  getAllProducts, 
  createProduct,
  updateProduct,
  deleteProduct,
  newProduct,
  editProduct
};