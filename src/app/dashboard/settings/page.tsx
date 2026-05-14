import { getSellerProfile } from '../../../lib/actions/dashboard'
import { SettingsClient } from '../../../components/dashboard/SettingsClient'

export default async function SettingsPage() {
  const profile = await getSellerProfile()
  return <SettingsClient profile={profile} />
}
