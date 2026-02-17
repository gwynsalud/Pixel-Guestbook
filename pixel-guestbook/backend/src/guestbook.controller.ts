import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { GuestbookService } from './guestbook.service';

@Controller('guestbook')
export class GuestbookController {
  constructor(private readonly guestbookService: GuestbookService) {}

  @Get()
  getAll() {
    return this.guestbookService.findAll();
  }

  @Post()
  createEntry(@Body() body: any) {
    return this.guestbookService.create(body);
  }

  @Put(':id')
  updateEntry(@Param('id') id: string, @Query('pin') pin: string, @Body() body: any) {
    return this.guestbookService.update(id, pin, body);
  }

  @Delete(':id')
  deleteEntry(@Param('id') id: string, @Query('pin') pin: string) {
    return this.guestbookService.delete(id, pin);
  }
}