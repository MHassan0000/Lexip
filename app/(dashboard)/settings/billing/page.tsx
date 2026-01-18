import { redirect } from "next/navigation";

export default function SettingsBillingPage() {
    // Redirect to settings page with billing tab
    redirect("/settings?tab=billing");
}
