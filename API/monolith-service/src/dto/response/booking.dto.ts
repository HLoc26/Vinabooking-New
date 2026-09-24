import { BookingStatus, CancellationSource, BookingItemType } from "@/models/booking/booking.enums";
import { PaymentTransferStatus } from "@/models/payment/payment.enums";
import { Booking } from "@/models/booking";
import { PaymentTransfer } from "@/models/payment/payment-transfer.model";

export interface BookingDetailDto {
    id: string;
    count: number;
    note: string | null;
    bookingId: string;
    itemId: string;
    itemType: BookingItemType;
    createdAt: Date;
    updatedAt: Date;
}

export interface PaymentTransferDto {
    id: string;
    bookingId: string;
    transferReference: string | null;
    amount: string;
    currency: string;
    transferContent: string;
    bankName: string | null;
    receiverAccount: string | null;
    paymentLinkId: string | null;
    status: PaymentTransferStatus;
    receivedAt: Date | null;
    completedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface BookingDto {
    id: string;
    startDate: Date;
    endDate: Date;
    guestCount: number;
    leaderName: string | null;
    leaderEmail: string | null;
    totalPrice: number | null;
    pricingSnapshot: any | null;
    phone: string | null;
    referenceNo: number;
    status: BookingStatus;
    note: string | null;
    noteBy: CancellationSource | null;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
    details: BookingDetailDto[];
    paymentTransfers?: PaymentTransferDto[];
}

export function toBookingDto(booking: Booking, transfers?: PaymentTransfer[]): BookingDto {
    return {
        id: booking.getId(),
        startDate: booking.getStartDate(),
        endDate: booking.getEndDate(),
        guestCount: booking.getGuestCount(),
        leaderName: booking.getLeaderName(),
        leaderEmail: booking.getLeaderEmail(),
        totalPrice: booking.getTotalPrice(),
        pricingSnapshot: booking.getPricingSnapshot(),
        phone: booking.getPhone(),
        referenceNo: booking.getReferenceNo(),
        status: booking.getStatus(),
        note: booking.getNote(),
        noteBy: booking.getNoteBy(),
        userId: booking.getUserId(),
        createdAt: booking.getCreatedAt(),
        updatedAt: booking.getUpdatedAt(),
        details: booking.getDetails().map(d => ({
            id: d.getId(),
            count: d.getCount(),
            note: d.getNote(),
            bookingId: d.getBookingId(),
            itemId: d.getItemId(),
            itemType: d.getItemType(),
            createdAt: d.getCreatedAt(),
            updatedAt: d.getUpdatedAt()
        })),
        paymentTransfers: transfers ? transfers.map(t => ({
            id: t.getId(),
            bookingId: t.getBookingId(),
            transferReference: t.getTransferReference(),
            amount: t.getAmount().toString(),
            currency: t.getCurrency(),
            transferContent: t.getTransferContent(),
            bankName: t.getBankName(),
            receiverAccount: t.getReceiverAccount(),
            paymentLinkId: t.getPaymentLinkId(),
            status: t.getStatus(),
            receivedAt: t.getReceivedAt(),
            completedAt: t.getCompletedAt(),
            createdAt: t.getCreatedAt(),
            updatedAt: t.getUpdatedAt()
        })) : []
    };
}
