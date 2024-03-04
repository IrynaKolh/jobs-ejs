const express = require("express");
const router = express.Router();
const {
  getAllProducts, 
  createProduct,
  updateProduct,
  deleteProduct,
  newProduct,
  editProduct
} = require("../controllers/products");


router.get ("/", getAllProducts);
router.post ("/", createProduct);
router.get ("/new", newProduct);
router.get ("/edit/:id", editProduct);
router.post ("/update/:id", updateProduct);
router.post ("/delete/:id", deleteProduct);


module.exports = router;