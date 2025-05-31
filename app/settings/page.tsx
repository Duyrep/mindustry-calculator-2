import BeaconSettings from "@/components/settings/BeaconSettings";
import BoostSettings from "@/components/settings/BoostSettings";
import GeneralSettings from "@/components/settings/GeneralSettings";
import MaterialSettings from "@/components/settings/RescourceSettings";

export default function Settings() {
  return (
    <div className="transition-all duration-200">
      <GeneralSettings />
      <MaterialSettings />
      <BoostSettings />
      <BeaconSettings />
    </div>
  )
}