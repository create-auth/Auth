import express from 'express';
import ProductController from './productController';
import ProductUsecase from '../../../application/ProductUsecase';
import ProductRepository from '../../../infrastructure/prisma/prismaRepositories/PrismaProductRepository';

const router = express.Router();
const productRepository = new ProductRepository();
const productUsecase = new ProductUsecase(productRepository);
const productController = new ProductController(productUsecase); 

router.get('/', productController.getProducts);
router.post('/', productController.createProduct);
router.get('/:id', productController.getProductById);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

export default router;
