import express from 'express';
import {filter, values, prefix} from '../controllers/filterController.js';

const filterRouter = express.Router();

// Define a route to filter alumni profiles

filterRouter.get('/search', filter);
filterRouter.get('/values', values);
filterRouter.get('/alumniPrefix', prefix);

export default filterRouter;