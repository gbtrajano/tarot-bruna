-- =============================================
-- SEED: Criar Vendedor e Admin
--
-- PASSO A PASSO:
-- 1. Acesse: Authentication > Users > Add user
--    Crie dois usuários (vendedora e admin) com email e senha
-- 2. Copie os UUIDs de cada um
-- 3. Substitua os valores abaixo e execute no SQL Editor
-- =============================================

DO $$
DECLARE
  seller_uuid uuid := 'COLE-AQUI-O-UUID-DA-VENDEDORA';
  admin_uuid  uuid := 'COLE-AQUI-O-SEU-UUID-DE-ADMIN';
BEGIN
  -- Atualiza role da vendedora
  UPDATE profiles SET role = 'seller', full_name = 'Nome da Vendedora' WHERE id = seller_uuid;

  -- Cria seller_profile para a vendedora
  INSERT INTO seller_profiles (user_id) VALUES (seller_uuid) ON CONFLICT (user_id) DO NOTHING;

  -- Atualiza role do admin
  UPDATE profiles SET role = 'admin', full_name = 'Nome do Admin' WHERE id = admin_uuid;

  RAISE NOTICE 'Pronto! Roles atualizados.';
END $$;

-- Verificar resultado:
-- SELECT id, email, full_name, role FROM profiles ORDER BY created_at;
