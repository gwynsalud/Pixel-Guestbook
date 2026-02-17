import { Injectable, OnModuleInit, UnauthorizedException, ConflictException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as bcrypt from 'bcrypt';

@Injectable()
export class GuestbookService implements OnModuleInit {
  private supabase: SupabaseClient;
  private readonly saltRounds = 10; // The complexity of the hash

  onModuleInit() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_KEY!
    );
  }

  // GET: Fetch all entries
  async findAll() {
    const { data } = await this.supabase
      .from('guestbook')
      .select('*')
      .order('created_at', { ascending: false });
    return data;
  }

  async create(dto: any) {
    // Expects { name, message, author_username }
    return await this.supabase.from('guestbook').insert([dto]);
  }

  // PUT: Update message only if PIN matches
  async update(id: string, pin: string, dto: any) {
    const { data: entry } = await this.supabase
      .from('guestbook')
      .select('secret_pin')
      .eq('id', id)
      .single();

    if (!entry || entry.secret_pin !== pin) {
      throw new UnauthorizedException('Invalid PIN - Update denied');
    }

    return await this.supabase
      .from('guestbook')
      .update({ message: dto.message })
      .eq('id', id);
  }

  // DELETE: Remove entry only if PIN matches
  async delete(id: string, pin: string) {
    const { data: entry } = await this.supabase
      .from('guestbook')
      .delete()
      .match({ id: id, author_username: username });

    if (!entry || entry.secret_pin !== pin) {
      throw new UnauthorizedException('Invalid PIN - Delete denied');
    }

    return await this.supabase.from('guestbook').delete().eq('id', id);
  }
}