export interface ProductDto {
    id: number;
    name: string;
    categoryId: number;
    incomePrice: number;
    salePrice: number;
    stock: number;
    unit: string;
    barcode: string;
    sku: string;
    description?: string;
}