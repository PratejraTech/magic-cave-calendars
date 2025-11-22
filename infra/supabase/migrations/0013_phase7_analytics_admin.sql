-- Phase 7: Analytics and Admin Tools Migration
-- Adds tables for template performance tracking, user feedback, and admin analytics

-- Template performance tracking table
CREATE TABLE template_performance (
    performance_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES template_catalog(template_id) ON DELETE CASCADE,
    metric_type VARCHAR(50) NOT NULL CHECK (metric_type IN ('adoption', 'completion', 'engagement', 'generation_success', 'generation_time')),
    metric_value DECIMAL(10,4),
    metric_count INTEGER DEFAULT 1,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    account_id UUID REFERENCES accounts(account_id), -- NULL for global metrics
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User feedback collection table
CREATE TABLE user_feedback (
    feedback_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES accounts(account_id) ON DELETE CASCADE,
    product_id UUID REFERENCES product(product_id) ON DELETE CASCADE,
    template_id UUID REFERENCES template_catalog(template_id) ON DELETE SET NULL,
    feedback_type VARCHAR(50) NOT NULL CHECK (feedback_type IN ('rating', 'comment', 'suggestion', 'bug_report', 'feature_request')),
    feedback_content TEXT,
    rating_value INTEGER CHECK (rating_value >= 1 AND rating_value <= 5), -- For rating type
    metadata JSONB DEFAULT '{}', -- Additional context (browser, device, etc.)
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- A/B testing experiments table
CREATE TABLE ab_experiments (
    experiment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    experiment_name VARCHAR(255) NOT NULL UNIQUE,
    experiment_type VARCHAR(50) NOT NULL CHECK (experiment_type IN ('template_vs_legacy', 'ai_generation', 'ui_variants')),
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
    start_date DATE,
    end_date DATE,
    target_percentage DECIMAL(5,2) CHECK (target_percentage >= 0 AND target_percentage <= 100),
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- A/B testing assignments table
CREATE TABLE ab_assignments (
    assignment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    experiment_id UUID NOT NULL REFERENCES ab_experiments(experiment_id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES accounts(account_id) ON DELETE CASCADE,
    variant_name VARCHAR(100) NOT NULL,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Feature flags table for beta rollout
CREATE TABLE feature_flags (
    flag_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flag_name VARCHAR(100) NOT NULL UNIQUE,
    flag_description TEXT,
    enabled BOOLEAN NOT NULL DEFAULT false,
    rollout_percentage DECIMAL(5,2) DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
    target_accounts UUID[] DEFAULT '{}', -- Specific account IDs for targeted rollout
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Admin audit log for template changes
CREATE TABLE admin_audit_log (
    audit_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_account_id UUID NOT NULL REFERENCES accounts(account_id) ON DELETE SET NULL,
    action_type VARCHAR(50) NOT NULL CHECK (action_type IN ('create_template', 'update_template', 'retire_template', 'feature_flag_change', 'experiment_change')),
    entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('template', 'feature_flag', 'experiment')),
    entity_id UUID NOT NULL, -- References the affected entity
    old_values JSONB,
    new_values JSONB,
    action_metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_template_performance_template_id ON template_performance(template_id);
CREATE INDEX idx_template_performance_metric_type ON template_performance(metric_type);
CREATE INDEX idx_template_performance_period ON template_performance(period_start, period_end);
CREATE INDEX idx_template_performance_account ON template_performance(account_id);

CREATE INDEX idx_user_feedback_account_id ON user_feedback(account_id);
CREATE INDEX idx_user_feedback_template_id ON user_feedback(template_id);
CREATE INDEX idx_user_feedback_type ON user_feedback(feedback_type);
CREATE INDEX idx_user_feedback_created_at ON user_feedback(created_at);

CREATE INDEX idx_ab_assignments_experiment_id ON ab_assignments(experiment_id);
CREATE INDEX idx_ab_assignments_account_id ON ab_assignments(account_id);
CREATE UNIQUE INDEX idx_ab_assignments_unique ON ab_assignments(experiment_id, account_id);

CREATE INDEX idx_feature_flags_name ON feature_flags(flag_name);
CREATE INDEX idx_feature_flags_enabled ON feature_flags(enabled);

CREATE INDEX idx_admin_audit_log_entity ON admin_audit_log(entity_type, entity_id);
CREATE INDEX idx_admin_audit_log_created_at ON admin_audit_log(created_at);

-- Row Level Security
ALTER TABLE template_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for template_performance
CREATE POLICY "Users can view performance data for their templates" ON template_performance
    FOR SELECT USING (
        account_id = auth.uid() OR
        account_id IS NULL -- Global metrics
    );

-- RLS Policies for user_feedback
CREATE POLICY "Users can view their own feedback" ON user_feedback
    FOR SELECT USING (account_id = auth.uid());

CREATE POLICY "Users can insert their own feedback" ON user_feedback
    FOR INSERT WITH CHECK (account_id = auth.uid());

-- RLS Policies for ab_experiments (read-only for users)
CREATE POLICY "Users can view active experiments" ON ab_experiments
    FOR SELECT USING (status = 'active');

-- RLS Policies for ab_assignments
CREATE POLICY "Users can view their own assignments" ON ab_assignments
    FOR SELECT USING (account_id = auth.uid());

-- RLS Policies for feature_flags (read-only for users)
CREATE POLICY "Users can view feature flags" ON feature_flags
    FOR SELECT USING (true);

-- RLS Policies for admin_audit_log (admin only)
CREATE POLICY "Only admins can view audit logs" ON admin_audit_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM accounts
            WHERE account_id = auth.uid()
            AND role = 'admin'
        )
    );

-- Functions for analytics aggregation
CREATE OR REPLACE FUNCTION get_template_performance_summary(
    p_template_id UUID,
    p_start_date DATE,
    p_end_date DATE
)
RETURNS TABLE (
    metric_type VARCHAR(50),
    total_value DECIMAL(10,4),
    average_value DECIMAL(10,4),
    metric_count INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        tp.metric_type,
        SUM(tp.metric_value) as total_value,
        AVG(tp.metric_value) as average_value,
        SUM(tp.metric_count) as metric_count
    FROM template_performance tp
    WHERE tp.template_id = p_template_id
    AND tp.period_start >= p_start_date
    AND tp.period_end <= p_end_date
    GROUP BY tp.metric_type;
END;
$$;

-- Function to assign users to A/B test variants
CREATE OR REPLACE FUNCTION assign_ab_variant(
    p_experiment_id UUID,
    p_account_id UUID
)
RETURNS VARCHAR(100)
LANGUAGE plpgsql
AS $$
DECLARE
    variant_name VARCHAR(100);
    experiment_record RECORD;
BEGIN
    -- Check if already assigned
    SELECT variant_name INTO variant_name
    FROM ab_assignments
    WHERE experiment_id = p_experiment_id AND account_id = p_account_id;

    IF variant_name IS NOT NULL THEN
        RETURN variant_name;
    END IF;

    -- Get experiment details
    SELECT * INTO experiment_record
    FROM ab_experiments
    WHERE experiment_id = p_experiment_id AND status = 'active';

    IF experiment_record IS NULL THEN
        RETURN 'control'; -- Default variant
    END IF;

    -- Simple random assignment (in production, use more sophisticated logic)
    IF random() < 0.5 THEN
        variant_name := 'variant_a';
    ELSE
        variant_name := 'variant_b';
    END IF;

    -- Insert assignment
    INSERT INTO ab_assignments (experiment_id, account_id, variant_name)
    VALUES (p_experiment_id, p_account_id, variant_name);

    RETURN variant_name;
END;
$$;

-- Function to check feature flag status for user
CREATE OR REPLACE FUNCTION check_feature_flag(
    p_flag_name VARCHAR(100),
    p_account_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    flag_record RECORD;
    user_in_rollout BOOLEAN := false;
BEGIN
    -- Get flag details
    SELECT * INTO flag_record
    FROM feature_flags
    WHERE flag_name = p_flag_name;

    IF flag_record IS NULL THEN
        RETURN false;
    END IF;

    -- Check if globally enabled
    IF flag_record.enabled THEN
        RETURN true;
    END IF;

    -- Check if user is in targeted rollout
    IF p_account_id IS NOT NULL AND flag_record.target_accounts IS NOT NULL THEN
        SELECT p_account_id = ANY(flag_record.target_accounts) INTO user_in_rollout;
        IF user_in_rollout THEN
            RETURN true;
        END IF;
    END IF;

    -- Check percentage rollout
    IF flag_record.rollout_percentage > 0 THEN
        -- Simple hash-based rollout (in production, use consistent hashing)
        IF (extract(epoch from p_account_id)::integer % 100) < flag_record.rollout_percentage THEN
            RETURN true;
        END IF;
    END IF;

    RETURN false;
END;
$$;