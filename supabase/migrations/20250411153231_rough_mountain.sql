/*
  # Add user_id to betting_operations table

  1. Changes
    - Add user_id column to betting_operations table
    - Create foreign key reference to auth.users
    - Add index for better query performance
    - Update update_monthly_summary function to include user_id in monthly_summaries
*/

-- Add user_id column to betting_operations if it doesn't exist
ALTER TABLE betting_operations
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS betting_operations_user_id_idx ON betting_operations(user_id);

-- Add user_id column to monthly_summaries if it doesn't exist
ALTER TABLE monthly_summaries
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS monthly_summaries_user_id_idx ON monthly_summaries(user_id);

-- Update the update_monthly_summary function to include user_id
CREATE OR REPLACE FUNCTION update_monthly_summary()
RETURNS TRIGGER AS $$
DECLARE
  year_val integer;
  month_val integer;
  total_bets integer;
  total_bet_amount numeric;
  total_result numeric;
  total_profit numeric;
  roi numeric;
  accounts_count integer;
  profit_per_acc numeric;
  user_id_val uuid;
BEGIN
  -- Get year, month and user_id
  year_val := EXTRACT(YEAR FROM NEW.date);
  month_val := EXTRACT(MONTH FROM NEW.date);
  user_id_val := NEW.user_id;
  
  -- Calculate totals for the month for this user
  SELECT 
    COUNT(*),
    COALESCE(SUM(bet_amount), 0),
    COALESCE(SUM(result), 0),
    COALESCE(SUM(profit), 0)
  INTO
    total_bets,
    total_bet_amount,
    total_result,
    total_profit
  FROM betting_operations
  WHERE 
    EXTRACT(YEAR FROM date) = year_val AND
    EXTRACT(MONTH FROM date) = month_val AND
    user_id = user_id_val;

  -- Calculate ROI
  IF total_bet_amount > 0 THEN
    roi := (total_profit / total_bet_amount) * 100;
  ELSE
    roi := 0;
  END IF;

  -- Count unique accounts used
  SELECT COUNT(DISTINCT account_id)
  INTO accounts_count
  FROM operation_accounts oa
  JOIN betting_operations bo ON bo.id = oa.operation_id
  WHERE 
    EXTRACT(YEAR FROM bo.date) = year_val AND
    EXTRACT(MONTH FROM bo.date) = month_val AND
    bo.user_id = user_id_val;

  -- Calculate profit per account
  IF accounts_count > 0 THEN
    profit_per_acc := total_profit / accounts_count;
  ELSE
    profit_per_acc := 0;
  END IF;

  -- Insert or update monthly summary
  INSERT INTO monthly_summaries (
    year,
    month,
    total_bets,
    total_bet_amount,
    total_result,
    total_profit,
    roi,
    accounts_used,
    profit_per_account,
    user_id
  ) VALUES (
    year_val,
    month_val,
    total_bets,
    total_bet_amount,
    total_result,
    total_profit,
    roi,
    accounts_count,
    profit_per_acc,
    user_id_val
  )
  ON CONFLICT (year, month) DO UPDATE SET
    total_bets = EXCLUDED.total_bets,
    total_bet_amount = EXCLUDED.total_bet_amount,
    total_result = EXCLUDED.total_result,
    total_profit = EXCLUDED.total_profit,
    roi = EXCLUDED.roi,
    accounts_used = EXCLUDED.accounts_used,
    profit_per_account = EXCLUDED.profit_per_account,
    updated_at = now(),
    user_id = EXCLUDED.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;