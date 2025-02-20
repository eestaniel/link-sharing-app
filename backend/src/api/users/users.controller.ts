import usersService from './users.service';
import {Request, Response} from 'express';
import multer from 'multer';

// Configure multer to handle `FormData`
const upload = multer(); // Memory storage for parsing only, not saving files


const getProfileWithLinks = async (req: Request, res: Response) => {
  try{
    const data = await usersService.getProfileWithLinks(req) as any;
    res.status(200).json(data);
  } catch (error: any) {
    res.status(403).json({ error: `Error fetching user profile: ${error.message}` });
  }
}

const updateProfile = async (req: Request, res: Response) => {
  try{

    const data = await usersService.updateProfile(req) as any;

    res.status(200).json(data);
  } catch (error: any) {
    res.status(403).json({ error: error.message });
  }
}


const upsertLinks = async (req: Request, res: Response) => {
  try{
    const data = await usersService.upsertLinks(req) as any;
    res.status(200).json(data);
  } catch (error: any) {
    res.status(403).json({ error: error.message });
  }
}

export default {
  getProfileWithLinks,
  updateProfile,
  upsertLinks,
}