import { Request, Response } from 'express';
import { agreementService } from './agreement.service';
import { asyncHandler, successResponse } from '../../shared/utils/response';

export class AgreementController {
    createAgreement = asyncHandler(async (req: Request, res: Response) => {
        const result = await agreementService.createAgreement(req.user!.userId, req.body);
        successResponse(res, result, 'Agreement create and PDF generated', 201);
    });

    getAgreement = asyncHandler(async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        const result = await agreementService.getAgreement(req.user!.userId, id);
        successResponse(res, result);
    });

    updateStatus = asyncHandler(async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        const result = await agreementService.updateStatus(req.user!.userId, id, req.body.status);
        successResponse(res, result, `Agreement status updated to ${req.body.status}`);
    });
}

export const agreementController = new AgreementController();