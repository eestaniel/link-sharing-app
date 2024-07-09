import { IsString } from 'class-validator';

export class RefreshTokenStorageDto {
  @IsString()
  user_id: string; // Assuming you want to explicitly include the user ID in the DTO

  @IsString()
  refresh_token: string;

  @IsString()
  test: string;
}