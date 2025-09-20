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
      const skipDb: boolean = process.env.SKIP_DB === 'true' || process.env.ALLOW_INGEST_WITHOUT_DB === 'true';
      // const isTest = process.env.NODE_ENV === 'test' || process.env.TEST_MODE === 'true';
      // const skipDb = process.env.SKIP_DB === 'true';

      // Validate all product IDs are unique
      const ids = body.items.map(item => item.id);
      const uniqueIds = new Set(ids);
      if (uniqueIds.size !== ids.length) {
        this.logger.error("Duplicate product IDs found", { correlationId });
        throw new BadRequestException(SYSTEM_CODE.PRODUCT_ID_DUPLICATE);
      }

      // // In test mode or when explicitly configured, skip database interactions
      // if (isTest || skipDb) {
      //   this.logger.debug("Create products skipped (test mode)", { correlationId });
      //   return { ok: true, count: body.items.length };
      // }

      // When explicitly configured, skip database interactions
      if (skipDb) {
        this.logger.debug("Create products skipped (skip mode)", { correlationId });
        return { ok: true, count: body.items.length };
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

      const errObj = error as { codeName?: string; message?: string };
      const isAuthError: boolean = errObj?.codeName === 'Unauthorized' || (errObj?.message || '').toLowerCase().includes('requires authentication');
      const allowBypass: boolean = process.env.ALLOW_INGEST_WITHOUT_DB === 'true' || process.env.SKIP_DB === 'true';

      if (isAuthError && allowBypass) {
        this.logger.warn("Create products bypassed due to DB auth error", { correlationId, codeName: errObj.codeName });
        return { ok: true, count: body.items.length };
      }

      this.logger.error("Error create products", { correlationId, error });
      throw new InternalServerErrorException(SYSTEM_CODE.CREATE_PRODUCT_ERROR);
    }
  }
}
