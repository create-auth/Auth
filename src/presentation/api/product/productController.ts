import { NextFunction, Request, Response } from 'express';
import ProductUseCase from '../../../application/ProductUsecase';

class ProductController {
  constructor(private readonly productUseCase: ProductUseCase) {}

  createProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const product = req.body;
      const newProduct = await this.productUseCase.createProduct(product);
      res.status(201).json(newProduct);
    } catch (error: any) {
      next(error);
    }
  };

  getProductById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const product = await this.productUseCase.getProductById(id);
      res.status(200).json(product);
    } catch (error: any) {
      next(error);
    }
  };

  updateProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const product = req.body;
      const updatedProduct = await this.productUseCase.updateProduct(
        id,
        product,
      );
      res.status(200).json(updatedProduct);
    } catch (error: any) {
      next(error);
    }
  };

  deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await this.productUseCase.deleteProduct(id);
      res.status(204).json();
    } catch (error: any) {
      next(error);
    }
  };

  getProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const products = await this.productUseCase.getProducts();
      res.status(200).json(products);
    } catch (error: any) {
      next(error);
    }
  };
}
export default ProductController;

