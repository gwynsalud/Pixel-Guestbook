import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { GuestbookService } from './guestbook.service';

@Controller('guestbook')
export class GuestbookController {
  constructor(private readonly guestbookService: GuestbookService) {}

  // 1. Fetch all messages for the wall
  @Get()
  getAll() {
    return this.guestbookService.findAll();
  }

  // 2. New Route: Register a user
  @Post('register')
  register(@Body() body: any) {
    return this.guestbookService.register(body);
  }

  // 3. New Route: Login
  @Post('login')
  login(@Body() body: any) {
    return this.guestbookService.login(body);
  }

  // 4. Post a new message
  @Post()
  createEntry(@Body() body: any) {
    return this.guestbookService.create(body);
  }

  // 5. Update: Uses ?username= instead of PIN
  @Put(':id')
  updateEntry(
    @Param('id') id: string, 
    @Query('username') username: string, 
    @Body() body: any
  ) {
    return this.guestbookService.update(id, username, body);
  }

  // 6. Delete: Uses ?username= instead of PIN
  @Delete(':id')
  deleteEntry(
    @Param('id') id: string, 
    @Query('username') username: string
  ) {
    return this.guestbookService.delete(id, username);
  }
}