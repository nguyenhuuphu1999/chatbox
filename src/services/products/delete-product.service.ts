import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { Types } from "mongoose";
import { LoggerService } from "../../logger/logger.service";
import { SYSTEM_CODE } from "../../constants/system-code.constants";
import { ProductRepository } from "../../repositories/product.repository";
import { ClsService } from "../../context/cls.service";

export interface DeleteProductBodyDto {
  id: string;
}

export interface DeleteProductResponseDto {
  id: string;
  success: boolean;
}

@Injectable()
export class DeleteProductService {
  public constructor(
    private readonly logger: LoggerService,
    private readonly productRepository: ProductRepository,
    private readonly cls: ClsService,
  ) {}

  public async deleteProduct(body: DeleteProductBodyDto, userId: string): Promise<DeleteProductResponseDto> {
    const correlationId = this.cls.getId() ?? `DELETE_PRODUCT_${body.id}`;
    this.logger.info("Delete product start", { correlationId, productId: body.id });

    try {
      // Check if product exists
      const existingProduct = await this.productRepository.findOne({ id: body.id });
      if (!existingProduct) {
        this.logger.error("Product not found", { correlationId, productId: body.id });
        throw new BadRequestException(SYSTEM_CODE.PRODUCT_NOT_FOUND);
      }

      // Perform soft delete
      await this.productRepository.softDelete({
        id: (existingProduct as any)._id,
        deletedById: userId
      });

      this.logger.info("Delete product done", { correlationId, productId: body.id });

      return { id: body.id, success: true };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error("Error delete product", { correlationId, error });
      throw new InternalServerErrorException(SYSTEM_CODE.DELETE_PRODUCT_ERROR);
    }
  }
}
