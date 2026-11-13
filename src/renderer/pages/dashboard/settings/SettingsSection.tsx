import type { ComponentType } from "react";
import { Navigate, useParams } from "react-router-dom";
import { SETTINGS_PATH } from "@/renderer/components/dashboard/nav";
import { DataSection, UsersSection } from "./sections/AdminSections";
import { AppearanceSection, HardwareSection } from "./sections/AppSections";
import { BusinessSection, InventorySection, InvoicesSection, TaxSection } from "./sections/BusinessSections";

const SECTIONS: Record<string, ComponentType> = {
  business: BusinessSection,
  invoices: InvoicesSection,
  tax: TaxSection,
  inventory: InventorySection,
  appearance: AppearanceSection,
  hardware: HardwareSection,
  users: UsersSection,
  data: DataSection,
};

/** Renders the section named in the URL; unknown sections go to Business profile. */
export default function SettingsSection() {
  const { section = "" } = useParams();
  const Section = SECTIONS[section];
  return Section ? <Section /> : <Navigate to={`${SETTINGS_PATH}/business`} replace />;
}
