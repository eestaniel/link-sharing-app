import usersService from './users.service';
import {Request, Response} from 'express';


const getProfileWithLinks = async (req: Request, res: Response) => {
  try{
    const data = await usersService.getProfileWithLinks(req);
    res.status(200).json(data);
  } catch (error: any) {
    res.status(403).json({ error: error.message });
  }
}

export default {
  getProfileWithLinks
}