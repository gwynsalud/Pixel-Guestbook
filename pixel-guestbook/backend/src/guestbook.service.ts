import { Injectable, OnModuleInit, UnauthorizedException, ConflictException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class GuestbookService implements OnModuleInit {
  private supabase: SupabaseClient;

  onModuleInit() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_KEY!
    );
  }

  // --- AUTHENTICATION ---
  async register(dto: any) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const { error } = await this.supabase
      .from('profiles')
      .insert([{ username: dto.username, password: hashedPassword }]);

    if (error?.code === '23505') throw new ConflictException('Username already exists');
    if (error) throw new Error(error.message);
    return { success: true };
  }

  async login(dto: any) {
    const { data: user, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('username', dto.username)
      .single();

    if (error || !user) throw new UnauthorizedException('Invalid username or password');

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid username or password');

    return { username: user.username };
  }

  // --- GUESTBOOK CRUD ---
  async findAll() {
    const { data } = await this.supabase
      .from('guestbook')
      .select('*')
      .order('created_at', { ascending: false });
    return data;
  }

  async create(dto: any) {
    const newEntry = {
      ...dto,
      category: dto.category || 'freedom'
    };

    const { data, error } = await this.supabase
      .from('guestbook')
      .insert([newEntry]);
    
    if (error) throw new Error(error.message);
    return data;
  }

  async update(id: string, username: string, dto: any) {
    const { data, error } = await this.supabase
      .from('guestbook')
      .update({ message: dto.message })
      .match({ id: id, author_username: username });

    if (error) throw new UnauthorizedException('You do not have permission to edit this');
    return data;
  }

  async delete(id: string, username: string) {
    const { error } = await this.supabase
      .from('guestbook')
      .delete()
      .match({ id: id, author_username: username });

    if (error) throw new UnauthorizedException('You do not have permission to delete this');
    return { success: true };
  }
}