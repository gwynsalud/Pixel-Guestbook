import { Injectable, OnModuleInit, UnauthorizedException, ConflictException } from '@nestjs/common';
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

  // --- AUTH METHODS ---

  async register(dto: any) {
    const { data, error } = await this.supabase
      .from('profiles')
      .insert([{ username: dto.username, password: dto.password }]); // Simple text for now
    
    if (error?.code === '23505') throw new ConflictException('Username taken');
    return { message: 'Registered successfully' };
  }

  async login(dto: any) {
    const { data: user } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('username', dto.username)
      .eq('password', dto.password)
      .single();

    if (!user) throw new UnauthorizedException('Invalid credentials');
    return { username: user.username }; // Send this back to React
  }

  // --- GUESTBOOK METHODS ---

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

  async update(id: string, username: string, dto: any) {
    // Only update if the id matches AND the author matches
    const { data, error } = await this.supabase
      .from('guestbook')
      .update({ message: dto.message })
      .match({ id: id, author_username: username });

    if (error || !data) throw new UnauthorizedException('Ownership mismatch');
    return data;
  }

  async delete(id: string, username: string) {
    const { data, error } = await this.supabase
      .from('guestbook')
      .delete()
      .match({ id: id, author_username: username });

    if (error) throw new UnauthorizedException('Ownership mismatch');
    return { deleted: true };
  }
}