import { useQueryClient } from "@tanstack/react-query";
import {
  useCreateAppointment as useOrvalCreateAppointment,
  useUpdateAppointment as useOrvalUpdateAppointment,
  useCancelAppointment as useOrvalCancelAppointment,
  useCreatePatient as useOrvalCreatePatient,
  useUpdatePatient as useOrvalUpdatePatient,
  useCreateInvoice as useOrvalCreateInvoice,
  useUpdateInvoice as useOrvalUpdateInvoice,
  getListAppointmentsQueryKey,
  getListPatientsQueryKey,
  getListInvoicesQueryKey,
  getGetDashboardStatsQueryKey,
  getGetDoctorAvailabilityQueryKey
} from "@workspace/api-client-react";

// Wrapper hooks to handle TanStack Query cache invalidation seamlessly

export function useCreateAppointment() {
  const queryClient = useQueryClient();
  return useOrvalCreateAppointment({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListAppointmentsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardStatsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDoctorAvailabilityQueryKey('', { date: '' }).slice(0, 1) });
      },
    },
  });
}

export function useUpdateAppointment() {
  const queryClient = useQueryClient();
  return useOrvalUpdateAppointment({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListAppointmentsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardStatsQueryKey() });
      },
    },
  });
}

export function useCancelAppointment() {
  const queryClient = useQueryClient();
  return useOrvalCancelAppointment({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListAppointmentsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardStatsQueryKey() });
      },
    },
  });
}

export function useCreatePatient() {
  const queryClient = useQueryClient();
  return useOrvalCreatePatient({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListPatientsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardStatsQueryKey() });
      },
    },
  });
}

export function useUpdatePatient() {
  const queryClient = useQueryClient();
  return useOrvalUpdatePatient({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListPatientsQueryKey() });
      },
    },
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  return useOrvalCreateInvoice({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListInvoicesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardStatsQueryKey() });
      },
    },
  });
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();
  return useOrvalUpdateInvoice({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListInvoicesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardStatsQueryKey() });
      },
    },
  });
}

// Formatting helpers
export const formatSAR = (amount: number) => {
  return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(amount);
};

export const translateStatus = (status: string) => {
  const map: Record<string, string> = {
    scheduled: 'مجدول',
    confirmed: 'مؤكد',
    completed: 'مكتمل',
    cancelled: 'ملغي',
    no_show: 'لم يحضر',
    draft: 'مسودة',
    sent: 'مرسل',
    paid: 'مدفوع',
    void: 'ملغى'
  };
  return map[status] || status;
};

export const translateMode = (mode: string) => {
  const map: Record<string, string> = {
    in_person: 'حضوري',
    online: 'عبر الإنترنت',
  };
  return map[mode] || mode;
};

export const translatePaymentMethod = (method: string | undefined) => {
  if (!method) return '-';
  const map: Record<string, string> = {
    mada: 'مدى',
    apple_pay: 'Apple Pay',
    stc_pay: 'STC Pay',
    cash: 'نقدي',
    bank_transfer: 'تحويل بنكي'
  };
  return map[method] || method;
};
