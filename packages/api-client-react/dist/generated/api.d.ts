import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import type { Appointment, AppointmentType, AppointmentsListResponse, CreateAppointmentRequest, CreateInvoiceRequest, CreatePatientFileRequest, CreatePatientRequest, DashboardStats, Doctor, GetDoctorAvailabilityParams, HealthStatus, Invoice, InvoicesListResponse, ListAppointmentsParams, ListInvoicesParams, ListNotificationsParams, ListPatientsParams, Notification, Patient, PatientFile, PatientsListResponse, SendNotificationRequest, Service, TimeSlot, UpdateAppointmentRequest, UpdateInvoiceRequest, UpdatePatientRequest } from "./api.schemas";
import { customFetch } from "../custom-fetch";
import type { ErrorType, BodyType } from "../custom-fetch";
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
/**
 * @summary Health check
 */
export declare const getHealthCheckUrl: () => string;
export declare const healthCheck: (options?: RequestInit) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary List appointment types
 */
export declare const getListAppointmentTypesUrl: () => string;
export declare const listAppointmentTypes: (options?: RequestInit) => Promise<AppointmentType[]>;
export declare const getListAppointmentTypesQueryKey: () => readonly ["/api/appointment-types"];
export declare const getListAppointmentTypesQueryOptions: <TData = Awaited<ReturnType<typeof listAppointmentTypes>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listAppointmentTypes>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listAppointmentTypes>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListAppointmentTypesQueryResult = NonNullable<Awaited<ReturnType<typeof listAppointmentTypes>>>;
export type ListAppointmentTypesQueryError = ErrorType<unknown>;
/**
 * @summary List appointment types
 */
export declare function useListAppointmentTypes<TData = Awaited<ReturnType<typeof listAppointmentTypes>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listAppointmentTypes>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary List clinic services
 */
export declare const getListServicesUrl: () => string;
export declare const listServices: (options?: RequestInit) => Promise<Service[]>;
export declare const getListServicesQueryKey: () => readonly ["/api/services"];
export declare const getListServicesQueryOptions: <TData = Awaited<ReturnType<typeof listServices>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listServices>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listServices>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListServicesQueryResult = NonNullable<Awaited<ReturnType<typeof listServices>>>;
export type ListServicesQueryError = ErrorType<unknown>;
/**
 * @summary List clinic services
 */
export declare function useListServices<TData = Awaited<ReturnType<typeof listServices>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listServices>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary List all doctors
 */
export declare const getListDoctorsUrl: () => string;
export declare const listDoctors: (options?: RequestInit) => Promise<Doctor[]>;
export declare const getListDoctorsQueryKey: () => readonly ["/api/doctors"];
export declare const getListDoctorsQueryOptions: <TData = Awaited<ReturnType<typeof listDoctors>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listDoctors>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listDoctors>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListDoctorsQueryResult = NonNullable<Awaited<ReturnType<typeof listDoctors>>>;
export type ListDoctorsQueryError = ErrorType<unknown>;
/**
 * @summary List all doctors
 */
export declare function useListDoctors<TData = Awaited<ReturnType<typeof listDoctors>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listDoctors>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get doctor available slots
 */
export declare const getGetDoctorAvailabilityUrl: (doctorId: string, params: GetDoctorAvailabilityParams) => string;
export declare const getDoctorAvailability: (doctorId: string, params: GetDoctorAvailabilityParams, options?: RequestInit) => Promise<TimeSlot[]>;
export declare const getGetDoctorAvailabilityQueryKey: (doctorId: string, params?: GetDoctorAvailabilityParams) => readonly [`/api/doctors/${string}/availability`, ...GetDoctorAvailabilityParams[]];
export declare const getGetDoctorAvailabilityQueryOptions: <TData = Awaited<ReturnType<typeof getDoctorAvailability>>, TError = ErrorType<unknown>>(doctorId: string, params: GetDoctorAvailabilityParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDoctorAvailability>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getDoctorAvailability>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetDoctorAvailabilityQueryResult = NonNullable<Awaited<ReturnType<typeof getDoctorAvailability>>>;
export type GetDoctorAvailabilityQueryError = ErrorType<unknown>;
/**
 * @summary Get doctor available slots
 */
export declare function useGetDoctorAvailability<TData = Awaited<ReturnType<typeof getDoctorAvailability>>, TError = ErrorType<unknown>>(doctorId: string, params: GetDoctorAvailabilityParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDoctorAvailability>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary List all patients
 */
export declare const getListPatientsUrl: (params?: ListPatientsParams) => string;
export declare const listPatients: (params?: ListPatientsParams, options?: RequestInit) => Promise<PatientsListResponse>;
export declare const getListPatientsQueryKey: (params?: ListPatientsParams) => readonly ["/api/patients", ...ListPatientsParams[]];
export declare const getListPatientsQueryOptions: <TData = Awaited<ReturnType<typeof listPatients>>, TError = ErrorType<unknown>>(params?: ListPatientsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listPatients>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listPatients>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListPatientsQueryResult = NonNullable<Awaited<ReturnType<typeof listPatients>>>;
export type ListPatientsQueryError = ErrorType<unknown>;
/**
 * @summary List all patients
 */
export declare function useListPatients<TData = Awaited<ReturnType<typeof listPatients>>, TError = ErrorType<unknown>>(params?: ListPatientsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listPatients>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Create a new patient
 */
export declare const getCreatePatientUrl: () => string;
export declare const createPatient: (createPatientRequest: CreatePatientRequest, options?: RequestInit) => Promise<Patient>;
export declare const getCreatePatientMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createPatient>>, TError, {
        data: BodyType<CreatePatientRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createPatient>>, TError, {
    data: BodyType<CreatePatientRequest>;
}, TContext>;
export type CreatePatientMutationResult = NonNullable<Awaited<ReturnType<typeof createPatient>>>;
export type CreatePatientMutationBody = BodyType<CreatePatientRequest>;
export type CreatePatientMutationError = ErrorType<unknown>;
/**
 * @summary Create a new patient
 */
export declare const useCreatePatient: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createPatient>>, TError, {
        data: BodyType<CreatePatientRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createPatient>>, TError, {
    data: BodyType<CreatePatientRequest>;
}, TContext>;
/**
 * @summary Get patient details
 */
export declare const getGetPatientUrl: (patientId: string) => string;
export declare const getPatient: (patientId: string, options?: RequestInit) => Promise<Patient>;
export declare const getGetPatientQueryKey: (patientId: string) => readonly [`/api/patients/${string}`];
export declare const getGetPatientQueryOptions: <TData = Awaited<ReturnType<typeof getPatient>>, TError = ErrorType<unknown>>(patientId: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPatient>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getPatient>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetPatientQueryResult = NonNullable<Awaited<ReturnType<typeof getPatient>>>;
export type GetPatientQueryError = ErrorType<unknown>;
/**
 * @summary Get patient details
 */
export declare function useGetPatient<TData = Awaited<ReturnType<typeof getPatient>>, TError = ErrorType<unknown>>(patientId: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPatient>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Update patient details
 */
export declare const getUpdatePatientUrl: (patientId: string) => string;
export declare const updatePatient: (patientId: string, updatePatientRequest: UpdatePatientRequest, options?: RequestInit) => Promise<Patient>;
export declare const getUpdatePatientMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updatePatient>>, TError, {
        patientId: string;
        data: BodyType<UpdatePatientRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updatePatient>>, TError, {
    patientId: string;
    data: BodyType<UpdatePatientRequest>;
}, TContext>;
export type UpdatePatientMutationResult = NonNullable<Awaited<ReturnType<typeof updatePatient>>>;
export type UpdatePatientMutationBody = BodyType<UpdatePatientRequest>;
export type UpdatePatientMutationError = ErrorType<unknown>;
/**
 * @summary Update patient details
 */
export declare const useUpdatePatient: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updatePatient>>, TError, {
        patientId: string;
        data: BodyType<UpdatePatientRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updatePatient>>, TError, {
    patientId: string;
    data: BodyType<UpdatePatientRequest>;
}, TContext>;
/**
 * @summary List all appointments
 */
export declare const getListAppointmentsUrl: (params?: ListAppointmentsParams) => string;
export declare const listAppointments: (params?: ListAppointmentsParams, options?: RequestInit) => Promise<AppointmentsListResponse>;
export declare const getListAppointmentsQueryKey: (params?: ListAppointmentsParams) => readonly ["/api/appointments", ...ListAppointmentsParams[]];
export declare const getListAppointmentsQueryOptions: <TData = Awaited<ReturnType<typeof listAppointments>>, TError = ErrorType<unknown>>(params?: ListAppointmentsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listAppointments>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listAppointments>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListAppointmentsQueryResult = NonNullable<Awaited<ReturnType<typeof listAppointments>>>;
export type ListAppointmentsQueryError = ErrorType<unknown>;
/**
 * @summary List all appointments
 */
export declare function useListAppointments<TData = Awaited<ReturnType<typeof listAppointments>>, TError = ErrorType<unknown>>(params?: ListAppointmentsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listAppointments>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Create a new appointment
 */
export declare const getCreateAppointmentUrl: () => string;
export declare const createAppointment: (createAppointmentRequest: CreateAppointmentRequest, options?: RequestInit) => Promise<Appointment>;
export declare const getCreateAppointmentMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createAppointment>>, TError, {
        data: BodyType<CreateAppointmentRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createAppointment>>, TError, {
    data: BodyType<CreateAppointmentRequest>;
}, TContext>;
export type CreateAppointmentMutationResult = NonNullable<Awaited<ReturnType<typeof createAppointment>>>;
export type CreateAppointmentMutationBody = BodyType<CreateAppointmentRequest>;
export type CreateAppointmentMutationError = ErrorType<unknown>;
/**
 * @summary Create a new appointment
 */
export declare const useCreateAppointment: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createAppointment>>, TError, {
        data: BodyType<CreateAppointmentRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createAppointment>>, TError, {
    data: BodyType<CreateAppointmentRequest>;
}, TContext>;
/**
 * @summary Get appointment details
 */
export declare const getGetAppointmentUrl: (appointmentId: string) => string;
export declare const getAppointment: (appointmentId: string, options?: RequestInit) => Promise<Appointment>;
export declare const getGetAppointmentQueryKey: (appointmentId: string) => readonly [`/api/appointments/${string}`];
export declare const getGetAppointmentQueryOptions: <TData = Awaited<ReturnType<typeof getAppointment>>, TError = ErrorType<unknown>>(appointmentId: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAppointment>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getAppointment>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetAppointmentQueryResult = NonNullable<Awaited<ReturnType<typeof getAppointment>>>;
export type GetAppointmentQueryError = ErrorType<unknown>;
/**
 * @summary Get appointment details
 */
export declare function useGetAppointment<TData = Awaited<ReturnType<typeof getAppointment>>, TError = ErrorType<unknown>>(appointmentId: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAppointment>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Update appointment status or details
 */
export declare const getUpdateAppointmentUrl: (appointmentId: string) => string;
export declare const updateAppointment: (appointmentId: string, updateAppointmentRequest: UpdateAppointmentRequest, options?: RequestInit) => Promise<Appointment>;
export declare const getUpdateAppointmentMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateAppointment>>, TError, {
        appointmentId: string;
        data: BodyType<UpdateAppointmentRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateAppointment>>, TError, {
    appointmentId: string;
    data: BodyType<UpdateAppointmentRequest>;
}, TContext>;
export type UpdateAppointmentMutationResult = NonNullable<Awaited<ReturnType<typeof updateAppointment>>>;
export type UpdateAppointmentMutationBody = BodyType<UpdateAppointmentRequest>;
export type UpdateAppointmentMutationError = ErrorType<unknown>;
/**
 * @summary Update appointment status or details
 */
export declare const useUpdateAppointment: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateAppointment>>, TError, {
        appointmentId: string;
        data: BodyType<UpdateAppointmentRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateAppointment>>, TError, {
    appointmentId: string;
    data: BodyType<UpdateAppointmentRequest>;
}, TContext>;
/**
 * @summary Cancel an appointment
 */
export declare const getCancelAppointmentUrl: (appointmentId: string) => string;
export declare const cancelAppointment: (appointmentId: string, options?: RequestInit) => Promise<Appointment>;
export declare const getCancelAppointmentMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof cancelAppointment>>, TError, {
        appointmentId: string;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof cancelAppointment>>, TError, {
    appointmentId: string;
}, TContext>;
export type CancelAppointmentMutationResult = NonNullable<Awaited<ReturnType<typeof cancelAppointment>>>;
export type CancelAppointmentMutationError = ErrorType<unknown>;
/**
 * @summary Cancel an appointment
 */
export declare const useCancelAppointment: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof cancelAppointment>>, TError, {
        appointmentId: string;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof cancelAppointment>>, TError, {
    appointmentId: string;
}, TContext>;
/**
 * @summary List all invoices
 */
export declare const getListInvoicesUrl: (params?: ListInvoicesParams) => string;
export declare const listInvoices: (params?: ListInvoicesParams, options?: RequestInit) => Promise<InvoicesListResponse>;
export declare const getListInvoicesQueryKey: (params?: ListInvoicesParams) => readonly ["/api/invoices", ...ListInvoicesParams[]];
export declare const getListInvoicesQueryOptions: <TData = Awaited<ReturnType<typeof listInvoices>>, TError = ErrorType<unknown>>(params?: ListInvoicesParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listInvoices>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listInvoices>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListInvoicesQueryResult = NonNullable<Awaited<ReturnType<typeof listInvoices>>>;
export type ListInvoicesQueryError = ErrorType<unknown>;
/**
 * @summary List all invoices
 */
export declare function useListInvoices<TData = Awaited<ReturnType<typeof listInvoices>>, TError = ErrorType<unknown>>(params?: ListInvoicesParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listInvoices>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Create a new invoice
 */
export declare const getCreateInvoiceUrl: () => string;
export declare const createInvoice: (createInvoiceRequest: CreateInvoiceRequest, options?: RequestInit) => Promise<Invoice>;
export declare const getCreateInvoiceMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createInvoice>>, TError, {
        data: BodyType<CreateInvoiceRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createInvoice>>, TError, {
    data: BodyType<CreateInvoiceRequest>;
}, TContext>;
export type CreateInvoiceMutationResult = NonNullable<Awaited<ReturnType<typeof createInvoice>>>;
export type CreateInvoiceMutationBody = BodyType<CreateInvoiceRequest>;
export type CreateInvoiceMutationError = ErrorType<unknown>;
/**
 * @summary Create a new invoice
 */
export declare const useCreateInvoice: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createInvoice>>, TError, {
        data: BodyType<CreateInvoiceRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createInvoice>>, TError, {
    data: BodyType<CreateInvoiceRequest>;
}, TContext>;
/**
 * @summary Get invoice details
 */
export declare const getGetInvoiceUrl: (invoiceId: string) => string;
export declare const getInvoice: (invoiceId: string, options?: RequestInit) => Promise<Invoice>;
export declare const getGetInvoiceQueryKey: (invoiceId: string) => readonly [`/api/invoices/${string}`];
export declare const getGetInvoiceQueryOptions: <TData = Awaited<ReturnType<typeof getInvoice>>, TError = ErrorType<unknown>>(invoiceId: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getInvoice>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getInvoice>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetInvoiceQueryResult = NonNullable<Awaited<ReturnType<typeof getInvoice>>>;
export type GetInvoiceQueryError = ErrorType<unknown>;
/**
 * @summary Get invoice details
 */
export declare function useGetInvoice<TData = Awaited<ReturnType<typeof getInvoice>>, TError = ErrorType<unknown>>(invoiceId: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getInvoice>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Update invoice status
 */
export declare const getUpdateInvoiceUrl: (invoiceId: string) => string;
export declare const updateInvoice: (invoiceId: string, updateInvoiceRequest: UpdateInvoiceRequest, options?: RequestInit) => Promise<Invoice>;
export declare const getUpdateInvoiceMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateInvoice>>, TError, {
        invoiceId: string;
        data: BodyType<UpdateInvoiceRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateInvoice>>, TError, {
    invoiceId: string;
    data: BodyType<UpdateInvoiceRequest>;
}, TContext>;
export type UpdateInvoiceMutationResult = NonNullable<Awaited<ReturnType<typeof updateInvoice>>>;
export type UpdateInvoiceMutationBody = BodyType<UpdateInvoiceRequest>;
export type UpdateInvoiceMutationError = ErrorType<unknown>;
/**
 * @summary Update invoice status
 */
export declare const useUpdateInvoice: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateInvoice>>, TError, {
        invoiceId: string;
        data: BodyType<UpdateInvoiceRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateInvoice>>, TError, {
    invoiceId: string;
    data: BodyType<UpdateInvoiceRequest>;
}, TContext>;
/**
 * @summary Get dashboard statistics
 */
export declare const getGetDashboardStatsUrl: () => string;
export declare const getDashboardStats: (options?: RequestInit) => Promise<DashboardStats>;
export declare const getGetDashboardStatsQueryKey: () => readonly ["/api/dashboard/stats"];
export declare const getGetDashboardStatsQueryOptions: <TData = Awaited<ReturnType<typeof getDashboardStats>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDashboardStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getDashboardStats>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetDashboardStatsQueryResult = NonNullable<Awaited<ReturnType<typeof getDashboardStats>>>;
export type GetDashboardStatsQueryError = ErrorType<unknown>;
/**
 * @summary Get dashboard statistics
 */
export declare function useGetDashboardStats<TData = Awaited<ReturnType<typeof getDashboardStats>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDashboardStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary List notifications
 */
export declare const getListNotificationsUrl: (params?: ListNotificationsParams) => string;
export declare const listNotifications: (params?: ListNotificationsParams, options?: RequestInit) => Promise<Notification[]>;
export declare const getListNotificationsQueryKey: (params?: ListNotificationsParams) => readonly ["/api/notifications", ...ListNotificationsParams[]];
export declare const getListNotificationsQueryOptions: <TData = Awaited<ReturnType<typeof listNotifications>>, TError = ErrorType<unknown>>(params?: ListNotificationsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listNotifications>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listNotifications>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListNotificationsQueryResult = NonNullable<Awaited<ReturnType<typeof listNotifications>>>;
export type ListNotificationsQueryError = ErrorType<unknown>;
/**
 * @summary List notifications
 */
export declare function useListNotifications<TData = Awaited<ReturnType<typeof listNotifications>>, TError = ErrorType<unknown>>(params?: ListNotificationsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listNotifications>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Send a notification
 */
export declare const getSendNotificationUrl: () => string;
export declare const sendNotification: (sendNotificationRequest: SendNotificationRequest, options?: RequestInit) => Promise<Notification>;
export declare const getSendNotificationMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof sendNotification>>, TError, {
        data: BodyType<SendNotificationRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof sendNotification>>, TError, {
    data: BodyType<SendNotificationRequest>;
}, TContext>;
export type SendNotificationMutationResult = NonNullable<Awaited<ReturnType<typeof sendNotification>>>;
export type SendNotificationMutationBody = BodyType<SendNotificationRequest>;
export type SendNotificationMutationError = ErrorType<unknown>;
/**
 * @summary Send a notification
 */
export declare const useSendNotification: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof sendNotification>>, TError, {
        data: BodyType<SendNotificationRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof sendNotification>>, TError, {
    data: BodyType<SendNotificationRequest>;
}, TContext>;
/**
 * @summary Create a patient file record
 */
export declare const getCreatePatientFileUrl: () => string;
export declare const createPatientFile: (createPatientFileRequest: CreatePatientFileRequest, options?: RequestInit) => Promise<PatientFile>;
export declare const getCreatePatientFileMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createPatientFile>>, TError, {
        data: BodyType<CreatePatientFileRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createPatientFile>>, TError, {
    data: BodyType<CreatePatientFileRequest>;
}, TContext>;
export type CreatePatientFileMutationResult = NonNullable<Awaited<ReturnType<typeof createPatientFile>>>;
export type CreatePatientFileMutationBody = BodyType<CreatePatientFileRequest>;
export type CreatePatientFileMutationError = ErrorType<unknown>;
/**
 * @summary Create a patient file record
 */
export declare const useCreatePatientFile: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createPatientFile>>, TError, {
        data: BodyType<CreatePatientFileRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createPatientFile>>, TError, {
    data: BodyType<CreatePatientFileRequest>;
}, TContext>;
/**
 * @summary List patient files
 */
export declare const getListPatientFilesUrl: (patientId: string) => string;
export declare const listPatientFiles: (patientId: string, options?: RequestInit) => Promise<PatientFile[]>;
export declare const getListPatientFilesQueryKey: (patientId: string) => readonly [`/api/patient-files/${string}`];
export declare const getListPatientFilesQueryOptions: <TData = Awaited<ReturnType<typeof listPatientFiles>>, TError = ErrorType<unknown>>(patientId: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listPatientFiles>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listPatientFiles>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListPatientFilesQueryResult = NonNullable<Awaited<ReturnType<typeof listPatientFiles>>>;
export type ListPatientFilesQueryError = ErrorType<unknown>;
/**
 * @summary List patient files
 */
export declare function useListPatientFiles<TData = Awaited<ReturnType<typeof listPatientFiles>>, TError = ErrorType<unknown>>(patientId: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listPatientFiles>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export {};
//# sourceMappingURL=api.d.ts.map