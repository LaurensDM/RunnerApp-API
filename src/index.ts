import * as dotenv from 'dotenv'
import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet'
import indexRouter from './rest/index';
import usersRouter from './rest/users';
import routeRouter from './rest/route';
import morgan = require('morgan');
import bodyParser = require('body-parser');
import cookieParser = require('cookie-parser');

dotenv.config()


const app = express();
const port = process.env.PORT || 3000;
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(morgan('dev'))
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api', indexRouter);
app.use('/api/users', usersRouter);
app.use('/api/route', routeRouter);

app.get('*', function (req, res) {
  res.status(404).json(`No resource for route ${req.url}`);
});


// error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  res.status(500)
  res.json({ error: err.message })
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

module.exports = app;