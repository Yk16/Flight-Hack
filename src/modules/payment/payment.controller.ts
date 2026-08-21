import { Request, Response } from 'express';
import { paymentService } from './payment.service';
import { asyncHandler, successResponse } from '../../shared/utils/response';

export class PaymentController {
    createOrder = asyncHandler(async (req: Request, res: Response) => {
        const result = await paymentService.createOrder(req.user!.userId, req.body);
        successResponse(res, result, 'Order created', 201);
    });

    verifyPayment = asyncHandler(async (req: Request, res: Response) => {
        const result = await paymentService.verifyPayment(req.user!.userId, req.body);
        successResponse(res, result, 'Payment successful');
    });

    getMyPayments = asyncHandler(async (req: Request, res: Response) => {
        const result = await paymentService.getUserPayments(req.user!.userId);
        successResponse(res, result);
    });
}

export const paymentController = new PaymentController();