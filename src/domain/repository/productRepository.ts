interface IProductRepository {
  create(data: any): Promise<any>;
  get(id: string): Promise<any>;
  update(id: string, data: any): Promise<any>;
  delete(id: string): Promise<any>;
  list(): Promise<any>;
}

export default IProductRepository;
