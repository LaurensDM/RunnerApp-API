import express, { Request, Response } from 'express';
const router = express.Router();
import handlers from '../service/weather';


/* GET users listing. */
router.post('/', async function(req: Request, res: Response){
    const weather = await handlers.getHandler(req.body.point);
    res.json({weather});
});

export default router;