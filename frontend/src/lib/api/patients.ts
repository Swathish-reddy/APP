import { api } from "@/services/api";
export const getPatient = async (id: string) => {
  const cleanId = id.replace("P", "");
  try {
    return await api.getPatientDetails(cleanId);
  } catch (e) {
    console.error(e);
    return null;
  }
};
