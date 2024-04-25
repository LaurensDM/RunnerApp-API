import express from 'express';
import { Request, Response } from 'express';
const router = express.Router();

/* GET home page. */
router.get('/', function(req: Request, res: Response) {
  res.json('Hello, TypeScript Express!');
});

export default router;
