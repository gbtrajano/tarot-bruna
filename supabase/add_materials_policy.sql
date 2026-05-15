-- Adicionar políticas de storage para lesson-materials
do $$ begin
  create policy "upload_materiais" on storage.objects
    for insert with check (bucket_id = 'lesson-materials' and auth.role() = 'authenticated');
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "materiais_autenticados" on storage.objects
    for select using (bucket_id = 'lesson-materials' and auth.role() = 'authenticated');
exception when duplicate_object then null; end $$;