import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { LoggerService } from "../../logger/logger.service";
import { SYSTEM_CODE } from "../../constants/system-code.constants";
import { ProductRepository } from "../../repositories/product.repository";
import { ClsService } from "../../context/cls.service";

export interface GetProductParamDto {
  id: string;
}

export interface GetProductResponseDto {
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
  updatedAt: Date;
}

@Injectable()
export class GetProductService {
  public constructor(
    private readonly logger: LoggerService,
    private readonly productRepository: ProductRepository,
    private readonly cls: ClsService,
  ) {}

  public async getProductById(param: GetProductParamDto): Promise<GetProductResponseDto> {
    const correlationId = this.cls.getId() ?? `GET_PRODUCT_${param.id}`;
    this.logger.info("Get product start", { correlationId, productId: param.id });

    try {
      const product = await this.productRepository.findByExternalId(param.id);
      if (!product) {
        this.logger.error("Product not found", { correlationId, productId: param.id });
        throw new BadRequestException(SYSTEM_CODE.PRODUCT_NOT_FOUND);
      }

      const result: GetProductResponseDto = {
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
        updatedAt: product.updatedAt!,
      };

      this.logger.info("Get product done", { correlationId, productId: param.id });
      return result;
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error("Error get product", { correlationId, error });
      throw new InternalServerErrorException(SYSTEM_CODE.SOMETHING_WENT_WRONG);
    }
  }
}
