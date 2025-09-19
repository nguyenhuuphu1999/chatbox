import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { LoggerService } from "../../logger/logger.service";
import { SYSTEM_CODE } from "../../constants/system-code.constants";
import { ProductRepository } from "../../repositories/product.repository";
import { ClsService } from "../../context/cls.service";

export interface UpdateProductBodyDto {
  id: string;
  title?: string;
  price?: number;
  currency?: string;
  sizes?: string[];
  colors?: string[];
  stock?: number;
  url?: string;
  description?: string;
  tags?: string[];
}

export interface UpdateProductResponseDto {
  id: string;
  success: boolean;
}

@Injectable()
export class UpdateProductService {
  public constructor(
    private readonly logger: LoggerService,
    private readonly productRepository: ProductRepository,
    private readonly cls: ClsService,
  ) {}

  public async updateProduct(body: UpdateProductBodyDto, userId: string): Promise<UpdateProductResponseDto> {
    const correlationId = this.cls.getId() ?? `UPDATE_PRODUCT_${body.id}`;
    this.logger.info("Update product start", { correlationId, productId: body.id });

    try {
      // Check if product exists
      const existingProduct = await this.productRepository.findByExternalId(body.id);
      if (!existingProduct) {
        this.logger.error("Product not found", { correlationId, productId: body.id });
        throw new BadRequestException(SYSTEM_CODE.PRODUCT_NOT_FOUND);
      }

      // Check for title duplicate if title is being updated
      if (body.title && body.title !== existingProduct.title) {
        const duplicateProduct = await this.productRepository.findOne({ 
          title: body.title, 
          isDeleted: { $ne: true },
          id: { $ne: body.id }
        });
        if (duplicateProduct) {
          this.logger.error("Product title duplicate", { correlationId, title: body.title });
          throw new BadRequestException(SYSTEM_CODE.PRODUCT_TITLE_DUPLICATE);
        }
      }

      // Prepare update data
      const updateData: Record<string, unknown> = {
        updatedById: userId,
      };

      if (body.title !== undefined) updateData.title = body.title;
      if (body.price !== undefined) updateData.price = body.price;
      if (body.currency !== undefined) updateData.currency = body.currency;
      if (body.sizes !== undefined) updateData.sizes = body.sizes;
      if (body.colors !== undefined) updateData.colors = body.colors;
      if (body.stock !== undefined) updateData.stock = body.stock;
      if (body.url !== undefined) updateData.url = body.url;
      if (body.description !== undefined) updateData.description = body.description;
      if (body.tags !== undefined) updateData.tags = body.tags;

      // Update searchable field if title or description changed
      if (body.title !== undefined || body.description !== undefined) {
        const newTitle = body.title ?? existingProduct.title;
        const newDescription = body.description ?? existingProduct.description;
        updateData.searchable = `${newTitle}\n${newDescription}`;
      }

      // Update product
      await this.productRepository.updateOne(
        { id: body.id },
        { $set: updateData }
      );

      this.logger.info("Update product done", { correlationId, productId: body.id });

      return { id: body.id, success: true };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error("Error update product", { correlationId, error });
      throw new InternalServerErrorException(SYSTEM_CODE.UPDATE_PRODUCT_ERROR);
    }
  }
}
