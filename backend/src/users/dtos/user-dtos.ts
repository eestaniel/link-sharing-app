import {
  IsArray,
  IsEmail,
  isObject,
  IsString,
  ValidateNested
} from 'class-validator';
import {Type} from "class-transformer"


export class UserCacheDto {
  @IsString()
  refresh_token: string; // Assuming you want to explicitly include the user ID
                         // in the DTO

  @IsArray()
  @Type(() => UserLinks)
  user_links: UserLinks[];

  @ValidateNested()
  @Type(() => UserProfile)
  user_profile: UserProfile;

}

class UserLinks {
  @IsString()
  id: string;

  @IsString()
  platform: string;

  @IsString()
  url: string;
}

class UserProfile {
  @IsString()
  first_name: string;

  @IsString()
  last_name: string;

  @IsEmail()
  email: string;

  @IsString()
  url: string;
}