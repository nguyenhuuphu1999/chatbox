import axios, { AxiosResponse } from 'axios';
import { ProductDoc, ChatResponse, IngestResponse } from '../src/types/product.types';

export class TestClient {
  private baseUrl: string;
  private timeout: number;

  constructor(baseUrl: string = 'http://localhost:3000', timeout: number = 30000) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
  }

  async ingestProducts(products: ProductDoc[]): Promise<AxiosResponse<IngestResponse>> {
    return axios.post(`${this.baseUrl}/products/ingest`, 
      { items: products },
      { timeout: this.timeout }
    );
  }

  async chat(message: string, filters?: any): Promise<AxiosResponse<ChatResponse>> {
    return axios.post(`${this.baseUrl}/chat`, 
      { message, filters },
      { timeout: this.timeout }
    );
  }

  async chatWithImage(message: string, imageBase64: string, mimeType: string): Promise<AxiosResponse<ChatResponse>> {
    return axios.post(`${this.baseUrl}/chat/image`, 
      { message, imageBase64, mimeType },
      { timeout: this.timeout }
    );
  }

  async getCollectionInfo(): Promise<AxiosResponse<any>> {
    return axios.get(`${this.baseUrl}/products/collection-info`, 
      { timeout: this.timeout }
    );
  }

  async deleteCollection(): Promise<AxiosResponse<any>> {
    return axios.delete(`${this.baseUrl}/products/collection`, 
      { timeout: this.timeout }
    );
  }

  async waitForService(maxRetries: number = 30, delay: number = 1000): Promise<boolean> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        await this.getCollectionInfo();
        return true;
      } catch (error) {
        if (i === maxRetries - 1) return false;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    return false;
  }
}

export const testProducts: ProductDoc[] = [
  {
    id: "d001",
    title: "Đầm đen ôm công sở",
    price: 590000,
    currency: "VND",
    sizes: ["S", "M", "L"],
    colors: ["đen"],
    stock: 12,
    url: "https://shop.example.com/dam-den-om",
    description: "Chất liệu cotton co giãn, phù hợp đi làm, dáng ôm nhẹ, dài qua gối. Thiết kế tinh tế với cổ tròn và tay dài, tạo vẻ ngoài chuyên nghiệp và thanh lịch.",
    tags: ["công sở", "đầm", "đen", "ôm dáng", "cotton"]
  },
  {
    id: "d002",
    title: "Đầm xòe dự tiệc ren",
    price: 720000,
    currency: "VND",
    sizes: ["S", "M"],
    colors: ["trắng", "hồng nhạt"],
    stock: 5,
    url: "https://shop.example.com/dam-xoe-ren",
    description: "Ren hoạ tiết tinh tế, phù hợp dự tiệc, form xòe nữ tính, tôn dáng. Chất liệu ren cao cấp với lớp lót mềm mại, tạo cảm giác thoải mái khi mặc.",
    tags: ["dự tiệc", "đầm", "ren", "xòe", "nữ tính"]
  },
  {
    id: "d003",
    title: "Chân váy chữ A",
    price: 350000,
    currency: "VND",
    sizes: ["S", "M", "L"],
    colors: ["be", "đen", "xanh navy"],
    stock: 8,
    url: "https://shop.example.com/chan-vay-chu-a",
    description: "Vải dày dặn, phù hợp đi làm, phối áo sơ mi. Thiết kế chữ A cổ điển, tôn dáng và che khuyết điểm hiệu quả.",
    tags: ["công sở", "chân váy", "chữ A", "vải dày"]
  },
  {
    id: "d004",
    title: "Áo sơ mi trắng cổ điển",
    price: 280000,
    currency: "VND",
    sizes: ["S", "M", "L", "XL"],
    colors: ["trắng"],
    stock: 15,
    url: "https://shop.example.com/ao-so-mi-trang",
    description: "Chất liệu cotton 100%, form dáng chuẩn, phù hợp mọi dịp. Thiết kế cổ điển với nút cài chắc chắn và đường may tinh tế.",
    tags: ["công sở", "áo sơ mi", "trắng", "cotton", "cổ điển"]
  },
  {
    id: "d005",
    title: "Quần tây ống suông",
    price: 450000,
    currency: "VND",
    sizes: ["S", "M", "L", "XL"],
    colors: ["đen", "xám", "xanh navy"],
    stock: 10,
    url: "https://shop.example.com/quan-tay-ong-suong",
    description: "Chất liệu vải tây cao cấp, ống suông tạo vẻ ngoài thanh lịch. Phù hợp đi làm và các dịp trang trọng.",
    tags: ["công sở", "quần tây", "ống suông", "thanh lịch"]
  },
  {
    id: "d006",
    title: "Áo len cardigan dài",
    price: 380000,
    currency: "VND",
    sizes: ["S", "M", "L"],
    colors: ["be", "xám", "hồng nhạt"],
    stock: 7,
    url: "https://shop.example.com/ao-len-cardigan",
    description: "Chất liệu len mềm mại, thiết kế dài tạo vẻ ngoài nữ tính. Phù hợp mặc trong mùa thu đông, có thể phối với nhiều trang phục khác nhau.",
    tags: ["áo len", "cardigan", "dài", "mùa thu đông", "nữ tính"]
  },
  {
    id: "d007",
    title: "Đầm maxi hoa nhí",
    price: 650000,
    currency: "VND",
    sizes: ["S", "M", "L"],
    colors: ["xanh lá", "hồng", "vàng"],
    stock: 6,
    url: "https://shop.example.com/dam-maxi-hoa-nhi",
    description: "Đầm dài với họa tiết hoa nhí tinh tế, phù hợp đi chơi và dự tiệc. Chất liệu vải mềm mại, thoáng mát.",
    tags: ["đầm", "maxi", "hoa nhí", "đi chơi", "dự tiệc"]
  },
  {
    id: "d008",
    title: "Áo thun basic",
    price: 120000,
    currency: "VND",
    sizes: ["S", "M", "L", "XL"],
    colors: ["trắng", "đen", "xám", "hồng", "xanh"],
    stock: 25,
    url: "https://shop.example.com/ao-thun-basic",
    description: "Áo thun cotton 100%, form dáng chuẩn, phù hợp mặc hàng ngày. Thiết kế đơn giản, dễ phối với nhiều trang phục khác nhau.",
    tags: ["áo thun", "basic", "cotton", "hàng ngày", "đơn giản"]
  },
  {
    id: "d009",
    title: "Quần jean skinny",
    price: 320000,
    currency: "VND",
    sizes: ["S", "M", "L", "XL"],
    colors: ["xanh đậm", "xanh nhạt", "đen"],
    stock: 18,
    url: "https://shop.example.com/quan-jean-skinny",
    description: "Quần jean skinny với chất liệu co giãn, tôn dáng và thoải mái khi mặc. Phù hợp mặc hàng ngày và đi chơi.",
    tags: ["quần jean", "skinny", "co giãn", "hàng ngày", "đi chơi"]
  },
  {
    id: "d010",
    title: "Áo khoác blazer",
    price: 550000,
    currency: "VND",
    sizes: ["S", "M", "L"],
    colors: ["đen", "xám", "xanh navy"],
    stock: 9,
    url: "https://shop.example.com/ao-khoac-blazer",
    description: "Áo khoác blazer với thiết kế thanh lịch, phù hợp đi làm và các dịp trang trọng. Chất liệu vải cao cấp, form dáng chuẩn.",
    tags: ["áo khoác", "blazer", "công sở", "thanh lịch", "trang trọng"]
  }
];

export const mockGeminiResponse = {
  candidates: [{
    content: {
      parts: [{
        text: "Dựa trên yêu cầu của bạn, tôi tìm thấy một số sản phẩm phù hợp:\n\n[1] Đầm đen ôm công sở — 590.000 VND — size: S, M, L — màu: đen\nMô tả: Chất liệu cotton co giãn, phù hợp đi làm, dáng ôm nhẹ...\n\nBạn có thể cho tôi biết size bạn muốn mua không?"
      }]
    }
  }]
};

export const mockEmbeddingResponse = {
  embedding: {
    values: new Array(768).fill(0.1) // Mock 768-dimensional vector
  }
};

export const mockQdrantSearchResponse = {
  result: [
    {
      payload: testProducts[0],
      score: 0.95
    },
    {
      payload: testProducts[1],
      score: 0.87
    }
  ]
};

export function validateVietnamesePrice(price: number): string {
  return price.toLocaleString('vi-VN') + ' VND';
}

export function validateResponseFormat(response: ChatResponse): boolean {
  return (
    typeof response.reply === 'string' &&
    Array.isArray(response.products) &&
    response.reply.length > 0
  );
}

export function validateNoHallucination(response: ChatResponse, availableProducts: ProductDoc[]): boolean {
  const availableIds = availableProducts.map(p => p.id);
  return response.products.every(product => availableIds.includes(product.id));
}

export function measureResponseTime<T>(fn: () => Promise<T>): Promise<{ result: T; time: number }> {
  const start = Date.now();
  return fn().then(result => ({
    result,
    time: Date.now() - start
  }));
}
