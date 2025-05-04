/*
  # Create Subscription Management Schema

  1. New Tables
    - `user_subscriptions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `subscription_id` (text)
      - `plan_id` (text)
      - `status` (text)
      - `access_level` (text)
      - `expires_at` (timestamp)
      - `is_test` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `payment_transactions`
      - `id` (uuid, primary key)
      - `transaction_id` (text)
      - `customer_email` (text)
      - `amount` (numeric)
      - `status` (text)
      - `payment_method` (text)
      - `is_test` (boolean)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
*/

-- Create user_subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subscription_id text NOT NULL,
  plan_id text NOT NULL,
  status text NOT NULL,
  access_level text NOT NULL,
  expires_at timestamptz,
  is_test boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Create payment_transactions table
CREATE TABLE IF NOT EXISTS payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id text NOT NULL,
  customer_email text NOT NULL,
  amount numeric NOT NULL,
  status text NOT NULL,
  payment_method text NOT NULL,
  is_test boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for user_subscriptions
CREATE POLICY "Users can read own subscriptions"
  ON user_subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admin can read all subscriptions"
  ON user_subscriptions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND (raw_user_meta_data->>'role' = 'admin' OR is_super_admin = true)
    )
  );

-- Create policies for payment_transactions
CREATE POLICY "Users can read own transactions"
  ON payment_transactions
  FOR SELECT
  TO authenticated
  USING (
    customer_email IN (
      SELECT email FROM auth.users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admin can read all transactions"
  ON payment_transactions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND (raw_user_meta_data->>'role' = 'admin' OR is_super_admin = true)
    )
  );

-- Create trigger for updated_at on user_subscriptions
CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX user_subscriptions_user_id_idx ON user_subscriptions(user_id);
CREATE INDEX payment_transactions_customer_email_idx ON payment_transactions(customer_email);
CREATE INDEX payment_transactions_transaction_id_idx ON payment_transactions(transaction_id);
CREATE INDEX user_subscriptions_is_test_idx ON user_subscriptions(is_test);
CREATE INDEX payment_transactions_is_test_idx ON payment_transactions(is_test);