import { Injectable, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class GuestbookService implements OnModuleInit {
  private supabase: SupabaseClient;

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

  // POST: Create a new entry
  async create(dto: any) {
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
      .select('secret_pin')
      .eq('id', id)
      .single();

    if (!entry || entry.secret_pin !== pin) {
      throw new UnauthorizedException('Invalid PIN - Delete denied');
    }

    return await this.supabase.from('guestbook').delete().eq('id', id);
  }
}