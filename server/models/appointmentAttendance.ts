export type Attended = 'yes' | 'no' | 'late' | null

export default interface AppointmentAttendance {
  attended: Attended
  additionalAttendanceInformation: string | null
}
