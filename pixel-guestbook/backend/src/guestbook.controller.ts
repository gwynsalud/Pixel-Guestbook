import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { GuestbookService } from './guestbook.service';

@Controller('guestbook')
export class GuestbookController {
  constructor(private readonly guestbookService: GuestbookService) {}

  @Get()
  getAll() {
    return this.guestbookService.findAll();
  }

  @Post('register')
  register(@Body() body: any) {
    return this.guestbookService.register(body);
  }

  @Post('login')
  login(@Body() body: any) {
    return this.guestbookService.login(body);
  }

  // Receives: { name, message, author_username, category }
  @Post()
  createEntry(@Body() body: any) {
    return this.guestbookService.create(body);
  }

  @Put(':id')
  updateEntry(
    @Param('id') id: string, 
    @Query('username') username: string, 
    @Body() body: any
  ) {
    return this.guestbookService.update(id, username, body);
  }

  @Delete(':id')
  deleteEntry(
    @Param('id') id: string, 
    @Query('username') username: string
  ) {
    return this.guestbookService.delete(id, username);
  }
}