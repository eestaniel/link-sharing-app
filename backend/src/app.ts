import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from "cookie-parser";


import * as middlewares from './middlewares';
import authAPI from './api/auth/routes';
import usersAPI from './api/users/routes';
import shareAPI from './api/share/routes';
import MessageResponse from './interfaces/MessageResponse';

require('dotenv').config();

const app = express();

app.use(morgan('dev'));
app.use(helmet());
app.use(cors({
  origin: process.env.ORIGIN,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.use('/api/v1/auth/', authAPI);
app.use('/api/v1/users/', usersAPI);
app.use('/api/v1/share/', shareAPI);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

export default app;
