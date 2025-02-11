import IProduct from '../domain/model/IProduct';
import ProductRepository from '../domain/repository/productRepository';
import APIError from './Errors/APIError';

class ProductUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async createProduct(product: IProduct): Promise<IProduct> {
    const productExists = await this.productRepository.get(product.id);

    if (productExists) throw new APIError('Product already exists', 400);
    if (!product.id) throw new APIError('Product id is required', 400);
    
    const newProduct = await this.productRepository.create(product);
    if (!newProduct) throw new APIError('Product not created', 500);

    return newProduct;
  }

  async getProductById(productId: string): Promise<IProduct> {
    const product = await this.productRepository.get(productId);
    if (!product) throw new APIError('Product not found', 404);
    return product;
  }

  async updateProduct(productId: string, product: IProduct): Promise<IProduct> {
    const productExists = await this.productRepository.get(productId);
    if (!productExists) throw new APIError('Product not found', 404);
    const updatedProduct = await this.productRepository.update(productId, product);
    if (!updatedProduct) throw new APIError('Product not updated', 500);

    return updatedProduct;
  }

  async deleteProduct(productId: string): Promise<void> {
    const productExists = await this.productRepository.get(productId);
    if (!productExists) throw new APIError('Product not found', 404);
    return this.productRepository.delete(productId);
  }

  async getProducts(): Promise<IProduct[]> {
    return this.productRepository.list();
  }
}

export default ProductUseCase;
