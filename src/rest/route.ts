import express, { Request, Response } from 'express';
const router = express.Router();
import handlers from '../service/route';
import { Schema, checkSchema } from 'express-validator';
import auth from '../auth/auth';

const { checkJwt } = auth;

const createSchema: Schema = {
    startPoint: {
        in: 'body',
        notEmpty: true,
        errorMessage: 'Start point is required',
    },
    endPoint: {
        in: 'body',
        notEmpty: true,
        errorMessage: 'End point is required',
    },
    waypoints: {
        in: 'body',
        isArray: true,
        errorMessage: 'Waypoints must be an array',
    },
    distance: {
        in: 'body',
        optional: true,
        isNumeric: true,
        errorMessage: 'Distance must be a number',
    },
    time: {
        in: 'body',
        optional: true,
        isNumeric: true,
        errorMessage: 'Time must be a number',
    },
    advancedOptions: {
        in: 'body',
        optional: true,
        errorMessage: 'Advanced options must be an object',
        isObject: true,
    },
};
// GET request
router.get('/', checkJwt, async (req: any, res: Response) => {
    console.log(req.auth.payload);
    return handlers.getHandler(req, res);
});

// POST request
router.post('/',  checkSchema(createSchema), async (req: Request, res: Response) => {
    const route = await handlers.postHandler(req.body);
    res.json({route: route})
});

// PUT request
router.put('/:id', checkJwt, async (req: Request, res: Response) => {
    return handlers.putHandler(req, res);
});

// DELETE request
router.delete('/:id', checkJwt, async (req: Request, res: Response) => {
    return handlers.deleteHandler(req, res);
});

export default router;