-- Create pending_payments table
CREATE TABLE IF NOT EXISTS pending_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  payment_id text NOT NULL,
  plan_id text NOT NULL,
  status text NOT NULL,
  amount numeric NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_check_at timestamptz,
  check_attempts integer DEFAULT 0,
  UNIQUE(payment_id)
);

-- Enable RLS
ALTER TABLE pending_payments ENABLE ROW LEVEL SECURITY;

-- Create policies for pending_payments
CREATE POLICY "Users can read own pending payments"
  ON pending_payments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admin can read all pending payments"
  ON pending_payments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND (raw_user_meta_data->>'role' = 'admin' OR is_super_admin = true)
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_pending_payments_updated_at
  BEFORE UPDATE ON pending_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX pending_payments_user_id_idx ON pending_payments(user_id);
CREATE INDEX pending_payments_payment_id_idx ON pending_payments(payment_id);
CREATE INDEX pending_payments_status_idx ON pending_payments(status);
CREATE INDEX pending_payments_last_check_at_idx ON pending_payments(last_check_at); 