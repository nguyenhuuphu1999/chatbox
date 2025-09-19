import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { LoggerService } from "../../logger/logger.service";
import { SYSTEM_CODE } from "../../constants/system-code.constants";
import { ProductRepository } from "../../repositories/product.repository";
import { IngestBodyDto } from "../../shared/dto/products/ingest.dto";
import { IngestResponseDto } from "../../shared/dto/products/ingest.dto";
import { ClsService } from "../../context/cls.service";

@Injectable()
export class CreateProductService {
  public constructor(
    private readonly logger: LoggerService,
    private readonly productRepository: ProductRepository,
    private readonly cls: ClsService,
  ) {}

  public async createProducts(body: IngestBodyDto, userId: string): Promise<IngestResponseDto> {
    const correlationId = this.cls.getId() ?? `CREATE_PRODUCTS_${Date.now()}`;
    this.logger.info("Create products start", { correlationId, count: body.items.length });

    try {
      // Validate all product IDs are unique
      const ids = body.items.map(item => item.id);
      const uniqueIds = new Set(ids);
      if (uniqueIds.size !== ids.length) {
        this.logger.error("Duplicate product IDs found", { correlationId });
        throw new BadRequestException(SYSTEM_CODE.PRODUCT_ID_DUPLICATE);
      }

      // Check for existing products
      const existingProducts = await this.productRepository.findByIds(ids);
      if (existingProducts.length > 0) {
        const existingIds = existingProducts.map(p => p.id);
        this.logger.error("Products already exist", { correlationId, existingIds });
        throw new BadRequestException(SYSTEM_CODE.PRODUCT_ID_DUPLICATE);
      }

      // Create products
      const productsToCreate = body.items.map(item => ({
        id: item.id,
        title: item.title,
        price: item.price,
        currency: item.currency || 'VND',
        sizes: item.sizes || [],
        colors: item.colors || [],
        stock: item.stock || 0,
        url: item.url,
        description: item.description,
        tags: item.tags || [],
        searchable: `${item.title}\n${item.description}`,
        createdById: userId,
      }));

      const createdProducts = [];
      for (const productData of productsToCreate) {
        const created = await this.productRepository.create(productData);
        createdProducts.push(created);
      }

      this.logger.info("Create products done", { correlationId, 
        count: createdProducts.length,
        ids: createdProducts.map(p => p.id)
      });

      return { ok: true, count: createdProducts.length };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error("Error create products", { correlationId, error });
      throw new InternalServerErrorException(SYSTEM_CODE.CREATE_PRODUCT_ERROR);
    }
  }
}
