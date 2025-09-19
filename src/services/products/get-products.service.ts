import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { LoggerService } from "../../logger/logger.service";
import { SYSTEM_CODE } from "../../constants/system-code.constants";
import { ProductRepository } from "../../repositories/product.repository";
import { ClsService } from "../../context/cls.service";

export interface GetProductsQueryDto {
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface GetProductsItemDto {
  id: string;
  title: string;
  price: number;
  currency?: string;
  sizes?: string[];
  colors?: string[];
  stock?: number;
  url?: string;
  description: string;
  tags?: string[];
  createdAt: Date;
}

export interface GetProductsResponseDto {
  list: GetProductsItemDto[];
  paging: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

@Injectable()
export class GetProductsService {
  public constructor(
    private readonly logger: LoggerService,
    private readonly productRepository: ProductRepository,
    private readonly cls: ClsService,
  ) {}

  public async getProducts(query: GetProductsQueryDto): Promise<GetProductsResponseDto> {
    const correlationId = this.cls.getId() ?? `GET_PRODUCTS_${query.search ?? 'ALL'}`;
    this.logger.info("Get products start", { correlationId, query });

    try {
      const page = query.page ?? 1;
      const pageSize = query.pageSize ?? 10;
      const skip = (page - 1) * pageSize;

      // Build filter
      const filter: Record<string, unknown> = { isDeleted: { $ne: true } };
      if (query.search) {
        filter.$or = [
          { title: { $regex: query.search, $options: 'i' } },
          { description: { $regex: query.search, $options: 'i' } },
          { tags: { $in: [new RegExp(query.search, 'i')] } }
        ];
      }

      // Get products and total count
      const [products, total] = await Promise.all([
        this.productRepository.find(filter, { 
          skip, 
          limit: pageSize, 
          sort: { createdAt: -1 } 
        }),
        this.productRepository.count(filter)
      ]);

      // Map to response DTO
      const list: GetProductsItemDto[] = products.map(product => ({
        id: product.id,
        title: product.title,
        price: product.price,
        currency: product.currency,
        sizes: product.sizes,
        colors: product.colors,
        stock: product.stock,
        url: product.url,
        description: product.description,
        tags: product.tags,
        createdAt: product.createdAt!,
      }));

      const totalPages = Math.ceil(total / pageSize);

      const result: GetProductsResponseDto = {
        list,
        paging: {
          page,
          pageSize,
          total,
          totalPages,
        }
      };

      this.logger.info("Get products done", { correlationId, 
        count: list.length, 
        total,
        page,
        totalPages 
      });

      return result;
    } catch (error) {
      this.logger.error("Error get products", { correlationId, error });
      throw new InternalServerErrorException(SYSTEM_CODE.SOMETHING_WENT_WRONG);
    }
  }
}
