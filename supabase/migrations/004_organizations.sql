-- 004: Organizations & Multi-user (Extended plan)

CREATE TABLE IF NOT EXISTS organizations (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name             TEXT NOT NULL,
  slug             TEXT UNIQUE NOT NULL,
  owner_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan             TEXT DEFAULT 'extended',
  subscription_status TEXT DEFAULT 'trialing'
    CHECK (subscription_status IN ('trialing','active','past_due','blocked','canceled')),
  stripe_customer_id  TEXT,
  subscription_id     TEXT,
  trial_ends_at       TIMESTAMPTZ DEFAULT NOW() + INTERVAL '14 days',
  current_period_end  TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS organization_members (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role            TEXT DEFAULT 'member' CHECK (role IN ('owner','admin','member')),
  invited_by      UUID REFERENCES auth.users(id),
  joined_at       TIMESTAMPTZ DEFAULT NOW(),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

CREATE TABLE IF NOT EXISTS organization_invitations (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  email           TEXT NOT NULL,
  role            TEXT DEFAULT 'member' CHECK (role IN ('admin','member')),
  token           TEXT UNIQUE DEFAULT gen_random_uuid()::TEXT NOT NULL,
  invited_by      UUID REFERENCES auth.users(id) NOT NULL,
  expires_at      TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days',
  accepted_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE projects      ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL;
ALTER TABLE work_items    ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL;
ALTER TABLE quality_items ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL;
ALTER TABLE bcm_items     ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL;
ALTER TABLE capas         ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL;
ALTER TABLE profiles      ADD COLUMN IF NOT EXISTS current_organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_org_members_org  ON organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user ON organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_invitations  ON organization_invitations(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_inv_token    ON organization_invitations(token);

ALTER TABLE organizations            ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members     ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_select" ON organizations FOR SELECT USING (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM organization_members m WHERE m.organization_id = id AND m.user_id = auth.uid()));
CREATE POLICY "org_insert" ON organizations FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "org_update" ON organizations FOR UPDATE USING (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM organization_members m WHERE m.organization_id = id AND m.user_id = auth.uid() AND m.role IN ('owner','admin')));
CREATE POLICY "org_delete" ON organizations FOR DELETE USING (owner_id = auth.uid());
CREATE POLICY "members_select" ON organization_members FOR SELECT USING (EXISTS (SELECT 1 FROM organization_members m WHERE m.organization_id = organization_id AND m.user_id = auth.uid()));
CREATE POLICY "members_insert" ON organization_members FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM organization_members m WHERE m.organization_id = organization_id AND m.user_id = auth.uid() AND m.role IN ('owner','admin')) OR user_id = auth.uid());
CREATE POLICY "members_update" ON organization_members FOR UPDATE USING (EXISTS (SELECT 1 FROM organization_members m WHERE m.organization_id = organization_id AND m.user_id = auth.uid() AND m.role IN ('owner','admin')));
CREATE POLICY "members_delete" ON organization_members FOR DELETE USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM organization_members m WHERE m.organization_id = organization_id AND m.user_id = auth.uid() AND m.role IN ('owner','admin')));
CREATE POLICY "invites_select" ON organization_invitations FOR SELECT USING (EXISTS (SELECT 1 FROM organization_members m WHERE m.organization_id = organization_id AND m.user_id = auth.uid()));
CREATE POLICY "invites_insert" ON organization_invitations FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM organization_members m WHERE m.organization_id = organization_id AND m.user_id = auth.uid() AND m.role IN ('owner','admin')));
CREATE POLICY "invites_delete" ON organization_invitations FOR DELETE USING (EXISTS (SELECT 1 FROM organization_members m WHERE m.organization_id = organization_id AND m.user_id = auth.uid() AND m.role IN ('owner','admin')));

CREATE OR REPLACE FUNCTION add_owner_as_member()
RETURNS TRIGGER AS $$ BEGIN
  INSERT INTO organization_members (organization_id, user_id, role) VALUES (NEW.id, NEW.owner_id, 'owner');
  RETURN NEW;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_org_created ON organizations;
CREATE TRIGGER on_org_created AFTER INSERT ON organizations FOR EACH ROW EXECUTE FUNCTION add_owner_as_member();
