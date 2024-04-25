import express, { Request, Response } from 'express';
const router = express.Router();
import handlers from '../service/route';

// GET request
router.get('/', (req: Request, res: Response) => {
    handlers.getHandler(req, res);
});

// POST request
router.post('/', (req: Request, res: Response) => {
    handlers.postHandler(req.body);
});

// PUT request
router.put('/:id', (req: Request, res: Response) => {
    handlers.putHandler(req, res);
});

// DELETE request
router.delete('/:id', (req: Request, res: Response) => {
    handlers.deleteHandler(req, res);
});

export default router;