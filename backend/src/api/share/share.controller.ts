import {Request, Response} from 'express';
import shareService from './share.service';


export const getPublicProfile = async (req: Request, res: Response) => {
  try{
    const data = await shareService.getPublicProfile(req) as any;
    res.status(200).json(data);
  } catch (error: any) {
    res.status(403).json({ error: `${error.message}, ${process.env.SUPABASE_URL}` });
  }
}


export default {
  getPublicProfile
}