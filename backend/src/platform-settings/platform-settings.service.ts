import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { UpdatePlatformSettingsDto } from './dto/update-platform-settings.dto';

const DEFAULT_ID = 'default';

type SettingsRow = {
  id: string;
  platformName: string;
  commissionPercent: { toString(): string } | number;
  autoApproveMerchants: boolean;
  requireProductReview: boolean;
  autoApproveProducts?: boolean;
  paymentCreditCard: boolean;
  paymentPromptPay: boolean;
  paymentBankTransfer: boolean;
  paymentCod: boolean;
  promptPayId?: string | null;
  bankAccountName?: string | null;
  bankAccountNumber?: string | null;
  bankName?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class PlatformSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  private serialize(row: SettingsRow) {
    return {
      id: row.id,
      platformName: row.platformName,
      commissionPercent: Number(row.commissionPercent),
      autoApproveMerchants: row.autoApproveMerchants,
      requireProductReview: row.requireProductReview,
      autoApproveProducts: row.autoApproveProducts ?? false,
      paymentCreditCard: row.paymentCreditCard,
      paymentPromptPay: row.paymentPromptPay,
      paymentBankTransfer: row.paymentBankTransfer,
      paymentCod: row.paymentCod,
      promptPayId: row.promptPayId ?? null,
      bankAccountName: row.bankAccountName ?? null,
      bankAccountNumber: row.bankAccountNumber ?? null,
      bankName: row.bankName ?? null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  async get() {
    const row = await this.prisma.platformSettings.upsert({
      where: { id: DEFAULT_ID },
      update: {},
      create: { id: DEFAULT_ID },
    });
    return this.serialize(row as SettingsRow);
  }

  async update(dto: UpdatePlatformSettingsDto) {
    const data = {
      ...(dto.platformName !== undefined ? { platformName: dto.platformName } : {}),
      ...(dto.commissionPercent !== undefined ? { commissionPercent: dto.commissionPercent } : {}),
      ...(dto.autoApproveMerchants !== undefined
        ? { autoApproveMerchants: dto.autoApproveMerchants }
        : {}),
      ...(dto.requireProductReview !== undefined
        ? { requireProductReview: dto.requireProductReview }
        : {}),
      ...(dto.autoApproveProducts !== undefined
        ? { autoApproveProducts: dto.autoApproveProducts }
        : {}),
      ...(dto.paymentCreditCard !== undefined ? { paymentCreditCard: dto.paymentCreditCard } : {}),
      ...(dto.paymentPromptPay !== undefined ? { paymentPromptPay: dto.paymentPromptPay } : {}),
      ...(dto.paymentBankTransfer !== undefined
        ? { paymentBankTransfer: dto.paymentBankTransfer }
        : {}),
      ...(dto.paymentCod !== undefined ? { paymentCod: dto.paymentCod } : {}),
      ...(dto.promptPayId !== undefined ? { promptPayId: dto.promptPayId } : {}),
      ...(dto.bankAccountName !== undefined ? { bankAccountName: dto.bankAccountName } : {}),
      ...(dto.bankAccountNumber !== undefined ? { bankAccountNumber: dto.bankAccountNumber } : {}),
      ...(dto.bankName !== undefined ? { bankName: dto.bankName } : {}),
    };

    const row = await this.prisma.platformSettings.upsert({
      where: { id: DEFAULT_ID },
      create: { id: DEFAULT_ID, ...data },
      update: data,
    });
    return this.serialize(row as SettingsRow);
  }
}
