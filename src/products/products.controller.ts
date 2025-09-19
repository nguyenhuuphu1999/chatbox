import { Body, Controller, Post, Get, Delete, Query } from "@nestjs/common";
import { RagService } from "../rag/rag.service";
import { LoggerService } from "../logger/logger.service";
import { SYSTEM_CODE } from '../constants/system-code.constants';
import { ROLES, Roles } from '../decorator/auth/roles.decorator';
import { Response, ResponsePaging } from '../decorator/response/response.decorator';
import { User } from '../decorator/auth/auth.decorator';
import { AuditIngest, AuditRead, AuditDelete } from '../decorator/audit/audit.decorator';
import { 
  IngestDto, 
  IngestBodyDto, 
  IngestResponseDto 
} from '../shared/dto/products/ingest.dto';
import { 
  GetCollectionInfoDto, 
  CollectionInfoResponseDto 
} from '../shared/dto/products/collection-info.dto';
import { 
  DeleteCollectionDto, 
  DeleteCollectionResponseDto 
} from '../shared/dto/products/delete-collection.dto';
import { CreateProductService } from '../services/products/create-product.service';
import { GetProductsService, GetProductsQueryDto } from '../services/products/get-products.service';

@Controller()
export class ProductsController {
  constructor(
    private readonly rag: RagService,
    private readonly logger: LoggerService,
    private readonly createProductService: CreateProductService,
    private readonly getProductsService: GetProductsService,
  ) {}

  @Response(SYSTEM_CODE.INGEST_PRODUCTS_SUCCESS)
  @AuditIngest('products')
  @Post(IngestDto.url)
  @Roles(ROLES.ADMIN, ROLES.USER)
  public async ingest(
    @Body() body: IngestBodyDto,
    @User("id") userId: string
  ): Promise<IngestResponseDto> {
    this.logger.info("ProductsController.ingest.start", { userId, count: body.items.length });
    try {
      // Create products in database first
      const createResult = await this.createProductService.createProducts(body, userId);
      
      // Then ingest to RAG system
      await this.rag.upsertProducts(body.items);
      
      this.logger.info("ProductsController.ingest.done", { count: body.items.length });
      return createResult;
    } catch (e: unknown) {
      this.logger.error("ProductsController.ingest.error", { err: (e as Error).message });
      throw e;
    }
  }

  @ResponsePaging(SYSTEM_CODE.GET_PRODUCTS_SUCCESS)
  @AuditRead('products')
  @Get('/products')
  @Roles(ROLES.ADMIN, ROLES.USER, ROLES.GUEST)
  public async getProducts(@Query() query: GetProductsQueryDto) {
    this.logger.info("ProductsController.getProducts.start", { query });
    try {
      const result = await this.getProductsService.getProducts(query);
      this.logger.info("ProductsController.getProducts.done", { count: result.list.length });
      return result;
    } catch (e: unknown) {
      this.logger.error("ProductsController.getProducts.error", { err: (e as Error).message });
      throw e;
    }
  }

  @Response(SYSTEM_CODE.GET_COLLECTION_INFO_SUCCESS)
  @Get(GetCollectionInfoDto.url)
  @Roles(ROLES.ADMIN, ROLES.USER)
  public async getCollectionInfo(): Promise<CollectionInfoResponseDto> {
    this.logger.info("ProductsController.getCollectionInfo.start");
    try {
      const result = await this.rag.getCollectionInfo();
      this.logger.info("ProductsController.getCollectionInfo.done");
      return result;
    } catch (e: unknown) {
      this.logger.error("ProductsController.getCollectionInfo.error", { err: (e as Error).message });
      throw e;
    }
  }

  @Response(SYSTEM_CODE.DELETE_COLLECTION_SUCCESS)
  @AuditDelete('collection')
  @Delete(DeleteCollectionDto.url)
  @Roles(ROLES.ADMIN)
  public async deleteCollection(): Promise<DeleteCollectionResponseDto> {
    this.logger.info("ProductsController.deleteCollection.start");
    try {
      await this.rag.deleteCollection();
      this.logger.info("ProductsController.deleteCollection.done");
      return { ok: true };
    } catch (e: unknown) {
      this.logger.error("ProductsController.deleteCollection.error", { err: (e as Error).message });
      throw e;
    }
  }
}