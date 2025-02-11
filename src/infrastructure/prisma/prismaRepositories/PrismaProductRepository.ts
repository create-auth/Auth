import IProductRepository from '../../../domain/repository/productRepository';
import IProduct from '../../../domain/model/IProduct';
import prisma from '../../prisma/PrismaClient';

class PrismaProductRepository implements IProductRepository {
  async create(data: any): Promise<any> {
    const product = await prisma.product.create({ data });
    return product;
  }

  async get(id: string): Promise<IProduct | null> {
    const product = await prisma.product.findUnique({ where: { id } });
    return product;
  }

  async update(id: string, data: any): Promise<IProduct> {
    const product = await prisma.product.update({ where: { id }, data });
    return product;
  }

  async delete(id: string): Promise<IProduct> {
    const product = await prisma.product.delete({ where: { id } });
    return product;
  }

  async list(): Promise<IProduct[]> {
    const product = await prisma.product.findMany();
    return product;
  }
}

export default PrismaProductRepository;

