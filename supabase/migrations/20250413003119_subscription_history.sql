-- Criar tabela de histórico de assinaturas
CREATE TABLE IF NOT EXISTS subscription_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_id text NOT NULL,
  action text NOT NULL, -- 'upgrade', 'downgrade', 'cancel'
  previous_plan_id text,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE subscription_history ENABLE ROW LEVEL SECURITY;

-- Criar políticas
CREATE POLICY "Usuários podem ler seu próprio histórico"
  ON subscription_history
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admin pode ler todo histórico"
  ON subscription_history
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND (raw_user_meta_data->>'role' = 'admin' OR is_super_admin = true)
    )
  );

-- Criar índices
CREATE INDEX subscription_history_user_id_idx ON subscription_history(user_id);
CREATE INDEX subscription_history_created_at_idx ON subscription_history(created_at); 