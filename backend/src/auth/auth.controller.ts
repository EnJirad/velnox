import { Body, Controller, HttpCode, HttpStatus, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Cookie } from '../common/decorators/cookie.decorator';
import { AuthenticatedRequestUser } from './types/authenticated-request-user';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.register(dto);
    this.setRefreshTokenCookie(res, result.refreshToken);
    return { ...result, refreshToken: undefined };
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(dto);
    this.setRefreshTokenCookie(res, result.refreshToken);
    return { ...result, refreshToken: undefined };
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(
    @Body() dto: RefreshTokenDto,
    @Cookie('refreshToken') cookieRefreshToken: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = dto.refreshToken || cookieRefreshToken;
    const result = await this.authService.refresh(refreshToken);
    this.setRefreshTokenCookie(res, result.refreshToken);
    return { ...result, refreshToken: undefined };
  }

  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.logout(user.userId);
    this.clearRefreshTokenCookie(res);
    return result;
  }

  /**
   * Cross-site cookie (Vercel frontend → Render API) ต้อง SameSite=None; Secure
   * อย่าพึ่งแค่ NODE_ENV — Render บางทีไม่ set production
   */
  private useCrossSiteCookie(): boolean {
    if (process.env.COOKIE_SAMESITE === 'none') return true;
    if (process.env.NODE_ENV === 'production') return true;
    const cors = process.env.CORS_ORIGINS ?? '';
    if (cors.includes('https://')) return true;
    return false;
  }

  private setRefreshTokenCookie(res: Response, refreshToken: string) {
    const crossSite = this.useCrossSiteCookie();
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: crossSite,
      sameSite: crossSite ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });
  }

  private clearRefreshTokenCookie(res: Response) {
    const crossSite = this.useCrossSiteCookie();
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: crossSite,
      sameSite: crossSite ? 'none' : 'lax',
      path: '/',
    });
  }
}
